"use client";

import { FlaskConical, Building2, Stethoscope, FileText } from "lucide-react";
import { useMyReferrals } from "@/lib/hooks/useReferrals";
import { REFERRAL_STATUS_META } from "@/lib/referralStatus";

function fmt(d: string) {
  try {
    return new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return d;
  }
}

export default function MyTestsPage() {
  const { data, isLoading, isError } = useMyReferrals();
  const referrals = data ?? [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-[#0F1B33] dark:text-ink-900">
          <FlaskConical className="h-6 w-6 text-[#1C63E7]" /> My Tests
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-ink-500">
          Lab tests recommended for you and their current status.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-slate-100 dark:bg-surface" />
          ))}
        </div>
      ) : isError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">Could not load your tests.</p>
      ) : referrals.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-soft-300 dark:bg-surface">
          <FlaskConical className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-ink-700">No test recommendations</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-ink-500">
            When a clinic or receptionist recommends a lab test for you, it will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {referrals.map((r) => {
            const meta = REFERRAL_STATUS_META[r.status];
            return (
              <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-soft-300 dark:bg-surface">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-bold text-slate-900 dark:text-ink-900">{fmt(r.createdAt)}</p>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${meta.badge}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                    {meta.label}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap gap-1.5">
                  {r.testNames.map((t) => (
                    <span key={t} className="rounded-md bg-[#EAF2FF] px-2 py-0.5 text-xs font-semibold text-[#1C63E7]">
                      {t}
                    </span>
                  ))}
                </div>

                <div className="mt-3 space-y-1 text-xs text-slate-600 dark:text-ink-600">
                  {r.diagnosticCenter?.centerName && (
                    <p className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-[#16A34A]" />
                      {r.diagnosticCenter.centerName}
                    </p>
                  )}
                  {r.referringClinic?.clinicName && (
                    <p className="flex items-center gap-1.5">
                      <Stethoscope className="h-3.5 w-3.5 text-[#1C63E7]" />
                      Referred by {r.referringClinic.clinicName}
                    </p>
                  )}
                  {r.resultNotes && (
                    <p className="flex items-start gap-1.5 rounded-lg bg-slate-50 p-2 dark:bg-soft-50">
                      <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                      {r.resultNotes}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
