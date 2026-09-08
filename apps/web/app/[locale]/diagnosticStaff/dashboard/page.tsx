"use client";

import { Link } from "@/i18n/routing";
import { FlaskConical, Clock, Loader2, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { useCenterStats, useIncomingReferrals } from "@/lib/hooks/useReferrals";
import { REFERRAL_STATUS_META } from "@/lib/referralStatus";

export default function DiagnosticStaffDashboard() {
  const { data: stats, isLoading } = useCenterStats();
  const { data: recent = [] } = useIncomingReferrals();

  const cards = [
    { key: "PENDING", label: "Pending", value: stats?.PENDING ?? 0, Icon: Clock, cls: "text-amber-600 bg-amber-50" },
    { key: "IN_PROGRESS", label: "In progress", value: stats?.IN_PROGRESS ?? 0, Icon: Loader2, cls: "text-blue-600 bg-blue-50" },
    { key: "COMPLETED", label: "Completed", value: stats?.COMPLETED ?? 0, Icon: CheckCircle2, cls: "text-green-600 bg-green-50" },
    { key: "CANCELLED", label: "Cancelled", value: stats?.CANCELLED ?? 0, Icon: XCircle, cls: "text-red-600 bg-red-50" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0F1B33] dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Test recommendations assigned to your centre.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map(({ key, label, value, Icon, cls }) => (
          <div key={key} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <span className={`mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl ${cls}`}>
              <Icon className="h-5 w-5" />
            </span>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{isLoading ? "–" : value}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Recent</h2>
          <Link href="/diagnosticStaff/tests" className="flex items-center gap-1 text-xs font-bold text-[#1C63E7]">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">
            No test recommendations yet.
          </p>
        ) : (
          <div className="space-y-2">
            {recent.slice(0, 6).map((r) => {
              const meta = REFERRAL_STATUS_META[r.status];
              return (
                <Link
                  key={r.id}
                  href={`/diagnosticStaff/tests/${r.id}`}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-sm transition hover:border-[#1C63E7]/30 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-100">
                      <FlaskConical className="h-3.5 w-3.5 text-[#1C63E7]" />
                      {r.patient?.user?.name ?? r.patient?.name ?? "Patient"}
                    </p>
                    <p className="truncate text-xs text-slate-500">{r.testNames.join(", ")}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${meta.badge}`}>{meta.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
