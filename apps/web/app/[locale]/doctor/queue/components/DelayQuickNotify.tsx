"use client";

import { useState } from "react";
import { AlarmClock, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useNotifyDoctorDelay } from "@/lib/hooks/useDoctor";
import { GradientCard } from "@/components/ui/GradientCard";

const PRESET_MINUTES = [10, 15, 30];

// Lets Doctor/Clinic/Receptionist push a "running late" notification to
// every waiting patient in one tap. Uses the existing useNotifyDoctorDelay
// mutation (POST /doctors/:doctorId/clinics/:clinicId/delay) — that hook
// already existed, this component was just never created.
export function DelayQuickNotify({
  doctorId,
  clinicId,
}: {
  doctorId: string;
  clinicId: string;
}) {
  const [customMinutes, setCustomMinutes] = useState("");
  const delayMutation = useNotifyDoctorDelay();

  async function sendDelay(minutes: number) {
    if (!minutes || minutes <= 0) return;
    try {
      await delayMutation.mutateAsync({ doctorId, clinicId, delayMinutes: minutes });
      toast.success(`Patients notified: doctor is running ${minutes} min late`);
      setCustomMinutes("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send delay notification");
    }
  }

  return (
    <GradientCard variant="amber">
      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <AlarmClock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            Notify Delay
          </p>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {PRESET_MINUTES.map((min) => (
            <button
              key={min}
              type="button"
              disabled={delayMutation.isPending}
              onClick={() => sendDelay(min)}
              className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-amber-700 shadow-xs hover:bg-amber-50 disabled:opacity-50 dark:bg-slate-900 dark:text-amber-400"
            >
              +{min} min
            </button>
          ))}

          <input
            type="number"
            min={1}
            max={300}
            placeholder="Custom"
            value={customMinutes}
            onChange={(e) => setCustomMinutes(e.target.value)}
            className="w-20 rounded-lg border border-amber-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-900 outline-none dark:border-amber-900 dark:bg-slate-900 dark:text-white"
          />
          <button
            type="button"
            disabled={delayMutation.isPending || !customMinutes}
            onClick={() => sendDelay(Number(customMinutes))}
            className="flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-amber-700 disabled:opacity-50"
          >
            {delayMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Send"}
          </button>
        </div>
      </div>
    </GradientCard>
  );
}
