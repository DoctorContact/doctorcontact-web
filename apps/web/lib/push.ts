import toast from "react-hot-toast";
import { api } from "@/lib/api";

export type PushResult = { ok: boolean; reason?: string };
export type PushState = "unsupported" | "ios-install" | "granted" | "denied" | "ask";

export function pushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const nav = navigator as unknown as { standalone?: boolean };
  return (
    nav.standalone === true ||
    (typeof window.matchMedia === "function" &&
      window.matchMedia("(display-mode: standalone)").matches)
  );
}

export function getPushState(): PushState {
  if (typeof window === "undefined") return "unsupported";
  if (isIOS() && !isStandalone()) return "ios-install";
  if (!pushSupported()) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return "ask";
}

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  const output = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

function fail(reason: string, err?: unknown): PushResult {
  console.warn("[push]", reason, err ?? "");
  return { ok: false, reason };
}

let keyPromise: Promise<string | null> | null = null;
let swPromise: Promise<ServiceWorkerRegistration> | null = null;

function getPublicKey(): Promise<string | null> {
  if (!keyPromise) {
    keyPromise = api
      .get("/notifications/web-push-key", { timeout: 45000 })
      .then((res) => (res.data?.data?.publicKey as string | undefined) ?? null)
      .catch(() => null);
  }
  return keyPromise;
}

function getRegistration(): Promise<ServiceWorkerRegistration> {
  if (!swPromise) {
    swPromise = navigator.serviceWorker.register("/sw.js").then(async (registration) => {
      await navigator.serviceWorker.ready;
      return registration;
    });
    swPromise.catch(() => {
      swPromise = null;
    });
  }
  return swPromise;
}

export function warmUpPush(): void {
  if (!pushSupported()) return;
  void getPublicKey();
  getRegistration().catch(() => {});
}

function askPermission(): Promise<NotificationPermission> {
  return new Promise((resolve) => {
    try {
      const maybePromise = Notification.requestPermission((result) => resolve(result));
      if (maybePromise && typeof maybePromise.then === "function") {
        maybePromise.then(resolve, () => resolve(Notification.permission));
      }
    } catch {
      resolve(Notification.permission);
    }
  });
}

export async function subscribeWebPush(): Promise<PushResult> {
  if (!pushSupported()) {
    return fail("This browser or address does not support push (needs HTTPS or localhost)");
  }
  if (Notification.permission !== "granted") {
    return fail("Notification permission is not granted");
  }

  const publicKey = await getPublicKey();
  if (!publicKey) {
    keyPromise = null;
    return fail("Could not get the push key from the server (it may be waking up, or VAPID keys are missing on the server)");
  }

  let registration: ServiceWorkerRegistration;
  try {
    registration = await withTimeout(getRegistration(), 10000, "Service worker took too long to start");
  } catch (err) {
    swPromise = null;
    return fail("Could not start the notification service worker", err);
  }

  let subscription: PushSubscription | null = null;
  try {
    subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await withTimeout(
        registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        }),
        20000,
        "The browser push service did not respond",
      );
    }
  } catch (err) {
    return fail("Browser refused to subscribe (Brave: enable Google services for push messaging)", err);
  }
  if (!subscription) return fail("Browser did not create a push subscription");

  try {
    await api.post(
      "/notifications/web-push/subscribe",
      { subscription: subscription.toJSON() },
      { timeout: 45000 },
    );
  } catch (err) {
    return fail("Server could not save the subscription", err);
  }

  console.info("[push] browser notifications are active");
  return { ok: true };
}

export async function enableBrowserPush(onGranted?: () => void): Promise<PushResult> {
  if (!pushSupported()) {
    return fail("This browser does not support notifications");
  }
  const permission = await askPermission();
  if (permission === "denied") return { ok: false, reason: "blocked" };
  if (permission !== "granted") return { ok: false, reason: "dismissed" };
  onGranted?.();
  return subscribeWebPush();
}

export async function enablePushWithFeedback(hooks?: {
  onGranted?: () => void;
  onBlocked?: () => void;
}): Promise<PushResult> {
  let toastId: string | undefined;
  const result = await enableBrowserPush(() => {
    hooks?.onGranted?.();
    toastId = toast.loading("Enabling notifications...");
  });

  if (result.ok) {
    resetPromptMemory();
    toast.success("Notifications enabled", { id: toastId });
  } else if (result.reason === "blocked") {
    hooks?.onBlocked?.();
  } else if (result.reason === "dismissed") {
    // the person closed the browser popup, nothing to show
  } else {
    toast.error(result.reason || "Could not enable notifications", { id: toastId });
  }
  return result;
}

export async function unsubscribeWebPush(): Promise<void> {
  if (!pushSupported()) return;
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    const subscription = await registration?.pushManager.getSubscription();
    if (!subscription) return;
    try {
      await api.delete("/notifications/web-push/subscribe", {
        data: { endpoint: subscription.endpoint },
      });
    } catch {
      // backend row is cleaned up automatically when the browser endpoint expires
    }
    await subscription.unsubscribe();
  } catch {
    // never block logout
  }
}

const DISMISSED_AT_KEY = "dc_push_dismissed_at";
const DISMISS_COUNT_KEY = "dc_push_dismiss_count";
const FIRST_GAP_MS = 5 * 60 * 1000;
const NEXT_GAP_MS = 10 * 60 * 1000;

function readNumber(key: string): number {
  try {
    return Number(localStorage.getItem(key) || 0) || 0;
  } catch {
    return 0;
  }
}

export function isPromptDue(): boolean {
  const dismissedAt = readNumber(DISMISSED_AT_KEY);
  if (!dismissedAt) return true;
  const gap = readNumber(DISMISS_COUNT_KEY) <= 1 ? FIRST_GAP_MS : NEXT_GAP_MS;
  return Date.now() - dismissedAt >= gap;
}

export function markPromptDismissed(): void {
  try {
    localStorage.setItem(DISMISSED_AT_KEY, String(Date.now()));
    localStorage.setItem(DISMISS_COUNT_KEY, String(readNumber(DISMISS_COUNT_KEY) + 1));
  } catch {
    // ignore
  }
}

export function resetPromptMemory(): void {
  try {
    localStorage.removeItem(DISMISSED_AT_KEY);
    localStorage.removeItem(DISMISS_COUNT_KEY);
  } catch {
    // ignore
  }
}

type TestSummary = {
  configured: boolean;
  devices: number;
  sent: number;
  failed: { statusCode: number; message: string }[];
};

export async function sendTestPush(): Promise<{ ok: boolean; message: string; noDevice?: boolean }> {
  try {
    const res = await api.post("/notifications/web-push/test", undefined, { timeout: 45000 });
    const data = res.data?.data as TestSummary | undefined;
    if (!data) return { ok: false, message: "The server gave no answer" };
    if (!data.configured) {
      return {
        ok: false,
        message:
          "Server push keys are missing. Add VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY and VAPID_SUBJECT to the backend environment and redeploy it.",
      };
    }
    if (data.devices === 0) {
      return { ok: false, noDevice: true, message: "This account has no saved device yet" };
    }
    if (data.sent > 0) return { ok: true, message: "Test sent. You should see it in a moment." };
    const first = data.failed[0];
    return {
      ok: false,
      message: "The push service rejected it (" + (first?.statusCode || "error") + "): " + (first?.message || ""),
    };
  } catch {
    return { ok: false, message: "Could not reach the server. Check your internet and try again." };
  }
}

export async function runPushCheck(): Promise<{ ok: boolean; message: string }> {
  const subscribed = await subscribeWebPush();
  if (!subscribed.ok) return { ok: false, message: subscribed.reason || "Could not set up notifications" };
  const first = await sendTestPush();
  if (first.noDevice) {
    const again = await subscribeWebPush();
    if (!again.ok) return { ok: false, message: again.reason || "Could not set up notifications" };
    return sendTestPush();
  }
  return first;
}
