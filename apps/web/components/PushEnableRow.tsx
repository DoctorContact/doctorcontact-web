"use client";

import { useEffect, useState } from "react";
import { BellRing } from "lucide-react";
import { enablePushWithFeedback, getPushState, type PushState } from "@/lib/push";

export default function PushEnableRow() {
  const [state, setState] = useState<PushState>("unsupported");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setState(getPushState());
  }, []);

  if (state === "unsupported" || state === "granted") return null;

  async function enable() {
    if (busy) return;
    setBusy(true);
    await enablePushWithFeedback({
      onGranted: () => setState("granted"),
      onBlocked: () => setState("denied"),
    });
    setBusy(false);
  }

  const text =
    state === "denied"
      ? "Notifications are blocked. Open your browser site settings, set Notifications to Allow, then reload."
      : state === "ios-install"
        ? "On iPhone: tap Share, choose Add to Home Screen, then open the app from your home screen."
        : "Get alerts for your turn, appointments and announcements even when the tab is closed.";

  return (
    <div className="border-b border-slate-100 bg-teal-50/60 px-4 py-3 dark:border-slate-700 dark:bg-teal-900/10">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#0F766E] dark:bg-slate-800">
          <BellRing className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
            Browser notifications are off
          </p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
            {text}
          </p>
          {state === "ask" && (
            <button
              type="button"
              onClick={enable}
              disabled={busy}
              className="mt-2 rounded-lg bg-[#0F766E] px-3 py-1 text-[11px] font-bold text-white transition hover:bg-[#115e59] disabled:opacity-60"
            >
              {busy ? "Please wait..." : "Enable"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
