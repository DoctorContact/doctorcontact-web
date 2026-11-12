import { api } from "@/lib/api";

export function pushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  const output = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

export async function subscribeWebPush(): Promise<boolean> {
  if (!pushSupported() || Notification.permission !== "granted") return false;
  try {
    const keyRes = await api.get("/notifications/web-push-key");
    const publicKey: string | undefined = keyRes.data?.data?.publicKey;
    if (!publicKey) return false;

    const registration = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
    }

    await api.post("/notifications/web-push/subscribe", {
      subscription: subscription.toJSON(),
    });
    return true;
  } catch {
    return false;
  }
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
