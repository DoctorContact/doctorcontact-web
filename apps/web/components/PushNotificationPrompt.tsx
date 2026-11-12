"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, Bell, BellOff, Smartphone, X } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/auth-context";
import {
  enablePushWithFeedback,
  getPushState,
  isPromptDue,
  markPromptDismissed,
  resetPromptMemory,
  subscribeWebPush,
  warmUpPush,
} from "@/lib/push";

type Mode = "hidden" | "ask" | "blocked" | "ios-install" | "problem";

const RECHECK_MS = 30 * 1000;
const RESUBSCRIBE_MS = 10 * 60 * 1000;

export default function PushNotificationPrompt() {
  const { user } = useAuth();
  const userId = user?.id;
  const [mode, setMode] = useState<Mode>("hidden");
  const [problem, setProblem] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const problemRef = useRef<string | null>(null);
  const lastEnsureRef = useRef(0);

  const evaluate = useCallback(async () => {
    const state = getPushState();

    if (state === "unsupported") {
      setMode("hidden");
      return;
    }

    if (state === "granted") {
      const now = Date.now();
      if (now - lastEnsureRef.current > RESUBSCRIBE_MS) {
        lastEnsureRef.current = now;
        const res = await subscribeWebPush();
        problemRef.current = res.ok ? null : res.reason || "Unknown problem";
        if (!res.ok) lastEnsureRef.current = now - RESUBSCRIBE_MS + 60 * 1000;
        setProblem(problemRef.current);
        if (res.ok) resetPromptMemory();
      }
      setMode(problemRef.current && isPromptDue() ? "problem" : "hidden");
      return;
    }

    if (state === "ask") warmUpPush();

    if (!isPromptDue()) {
      setMode("hidden");
      return;
    }

    setMode(state === "denied" ? "blocked" : state === "ios-install" ? "ios-install" : "ask");
  }, []);

  useEffect(() => {
    if (!userId) {
      setMode("hidden");
      return;
    }

    void evaluate();
    const timer = window.setInterval(() => void evaluate(), RECHECK_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") void evaluate();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [userId, evaluate]);

  async function enable() {
    if (busy) return;
    setBusy(true);
    await enablePushWithFeedback({
      onGranted: () => setMode("hidden"),
      onBlocked: () => setMode("blocked"),
    });
    setBusy(false);
  }

  async function retry() {
    if (busy) return;
    setBusy(true);
    const res = await subscribeWebPush();
    setBusy(false);
    if (res.ok) {
      problemRef.current = null;
      setProblem(null);
      resetPromptMemory();
      setMode("hidden");
      toast.success("Notifications are working");
    } else {
      problemRef.current = res.reason || "Unknown problem";
      setProblem(problemRef.current);
    }
  }

  function dismiss() {
    markPromptDismissed();
    setMode("hidden");
  }

  if (mode === "hidden") return null;

  const title =
    mode === "blocked"
      ? "Notifications are blocked"
      : mode === "ios-install"
        ? "Get notifications on iPhone"
        : mode === "problem"
          ? "Notifications need attention"
          : "Turn on notifications";

  const text =
    mode === "blocked"
      ? "Open your browser site settings for this website, set Notifications to Allow, then reload this page."
      : mode === "ios-install"
        ? "Tap the Share button in Safari, choose Add to Home Screen, then open Doctor Contact from your home screen and tap Enable."
        : mode === "problem"
          ? "Notifications are allowed, but setup did not finish: " + (problem || "unknown problem")
          : "Get instant alerts for your queue turn, appointments, follow-ups and announcements, even when this tab is closed.";

  const Icon =
    mode === "blocked"
      ? BellOff
      : mode === "ios-install"
        ? Smartphone
        : mode === "problem"
          ? AlertTriangle
          : Bell;

  return (
    <div className="fixed left-4 right-4 top-[72px] z-[9999] sm:left-auto sm:w-[360px]">
      <div className="flex items-start gap-3 rounded-2xl border border-teal-100 bg-white p-4 shadow-[0_12px_40px_rgba(15,27,51,0.18)] dark:border-teal-900/40 dark:bg-slate-900">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-[#0F766E]">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
          <p className="mt-0.5 break-words text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            {text}
          </p>
          <div className="mt-3 flex items-center gap-2">
            {mode === "ask" && (
              <button
                type="button"
                onClick={enable}
                disabled={busy}
                className="rounded-lg bg-[#0F766E] px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-[#115e59] disabled:opacity-60"
              >
                {busy ? "Please wait..." : "Enable"}
              </button>
            )}
            {mode === "problem" && (
              <button
                type="button"
                onClick={retry}
                disabled={busy}
                className="rounded-lg bg-[#0F766E] px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-[#115e59] disabled:opacity-60"
              >
                {busy ? "Trying..." : "Try again"}
              </button>
            )}
            <button
              type="button"
              onClick={dismiss}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mode === "ask" ? "Not now" : "Got it"}
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
