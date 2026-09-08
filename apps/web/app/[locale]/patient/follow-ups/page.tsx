"use client";

import { CalendarClock, Stethoscope, Building2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useMyFollowups, type Followup } from "@/lib/hooks/useFollowups";

function fmtDate(d: string) {
  try {
    return new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return d;
  }
}

const STATUS: Record<string, { label: string; cls: string; Icon: typeof Clock }> = {
  SCHEDULED: { label: "Scheduled", cls: "bg-blue-50 text-blue-700", Icon: Clock },
  COMPLETED: { label: "Completed", cls: "bg-green-50 text-green-700", Icon: CheckCircle2 },
  CANCELLED: { label: "Cancelled", cls: "bg-red-50 text-red-600", Icon: XCircle },
};

function FollowupCard({ f }: { f: Followup }) {
  const s = STATUS[f.status] ?? STATUS.SCHEDULED;
  const upcoming = f.status === "SCHEDULED" && new Date(f.followUpDate) >= new Date(new Date().toDateString());

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-soft-300 dark:bg-surface">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF2FF] text-[#1C63E7]">
            <CalendarClock className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-ink-900">{fmtDate(f.followUpDate)}</p>
            {upcoming && <p className="text-[11px] font-semibold text-[#16A34A]">Upcoming visit</p>}
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${s.cls}`}>
          <s.Icon className="h-3 w-3" />
          {s.label}
        </span>
      </div>

      <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-ink-600">
        {f.doctor?.user?.name && (
          <p className="flex items-center gap-1.5">
            <Stethoscope className="h-3.5 w-3.5 text-[#1C63E7]" />
            Dr. {f.doctor.user.name}
          </p>
        )}
        {f.clinic?.clinicName && (
          <p className="flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-[#16A34A]" />
            {f.clinic.clinicName}
          </p>
        )}
        {f.notes && <p className="rounded-lg bg-slate-50 p-2 text-slate-600 dark:bg-soft-50 dark:text-ink-600">{f.notes}</p>}
      </div>
    </div>
  );
}

export default function MyFollowupsPage() {
  const { data, isLoading, isError } = useMyFollowups();
  const followups = data ?? [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0F1B33] dark:text-ink-900">My Follow-ups</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-ink-500">
          Follow-up visits your doctor or clinic has scheduled for you.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-slate-100 dark:bg-surface" />
          ))}
        </div>
      ) : isError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          Could not load your follow-ups. Please try again.
        </p>
      ) : followups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-soft-300 dark:bg-surface">
          <CalendarClock className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-ink-700">No follow-ups scheduled</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-ink-500">
            When a clinic schedules a follow-up for you, it will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {followups.map((f) => (
            <FollowupCard key={f.id} f={f} />
          ))}
        </div>
      )}
    </div>
  );
}
