"use client";

import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/auth-context";
import { pushSupported, subscribeWebPush } from "@/lib/push";

const DISMISS_KEY = "push-prompt-dismissed-at";
const DISMISS_DAYS = 3;

export default function PushNotificationPrompt() {
  const { user } = useAuth();
  const userId = user?.id;
  const [showPrompt, setShowPrompt] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!userId || !pushSupported()) {
      setShowPrompt(false);
      return;
    }

    if (Notification.permission === "granted") {
      setShowPrompt(false);
      void subscribeWebPush();
      return;
    }

    if (Notification.permission === "denied") {
      setShowPrompt(false);
      return;
    }

    let dismissedAt = 0;
    try {
      dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
    } catch {
      dismissedAt = 0;
    }
    const recentlyDismissed = Date.now() - dismissedAt < DISMISS_DAYS * 24 * 60 * 60 * 1000;
    setShowPrompt(!recentlyDismissed);
  }, [userId]);

  async function enable() {
    setBusy(true);
    try {
      const result = await Notification.requestPermission();
      if (result === "granted") {
        const ok = await subscribeWebPush();
        if (ok) toast.success("Notifications enabled");
        else toast.error("Could not enable notifications");
      } else if (result === "denied") {
        toast.error("Notifications are blocked in your browser settings");
      }
    } finally {
      setBusy(false);
      setShowPrompt(false);
    }
  }

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // ignore
    }
    setShowPrompt(false);
  }

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[60] sm:left-auto sm:w-[360px]">
      <div className="flex items-start gap-3 rounded-2xl border border-teal-100 bg-white p-4 shadow-[0_12px_40px_rgba(15,27,51,0.18)] dark:border-teal-900/40 dark:bg-slate-900">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-[#0F766E]">
          <Bell className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Turn on notifications
          </h3>
          <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Get instant alerts for your queue turn, appointments, follow-ups and announcements,
            even when this tab is closed.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={enable}
              disabled={busy}
              className="rounded-lg bg-[#0F766E] px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-[#115e59] disabled:opacity-60"
            >
              {busy ? "Please wait..." : "Enable"}
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Not now
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close"
          className="shrink-0 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
