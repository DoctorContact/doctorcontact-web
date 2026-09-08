"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import { FlaskConical, ChevronRight } from "lucide-react";
import { useIncomingReferrals, type ReferralStatus } from "@/lib/hooks/useReferrals";
import { REFERRAL_STATUS_META, REFERRAL_STATUS_ORDER } from "@/lib/referralStatus";

const TABS: { key: "" | ReferralStatus; label: string }[] = [
  { key: "", label: "All" },
  ...REFERRAL_STATUS_ORDER.map((s) => ({ key: s, label: REFERRAL_STATUS_META[s].label })),
];

export default function DiagnosticStaffTestsPage() {
  const [tab, setTab] = useState<"" | ReferralStatus>("");
  const { data: referrals = [], isLoading } = useIncomingReferrals(tab ? { status: tab } : {});

  return (
    <div className="space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-[#0F1B33] dark:text-white">
          <FlaskConical className="h-6 w-6 text-[#1C63E7]" /> Assigned Tests
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Test recommendations sent to your centre.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {TABS.map((t) => (
          <button
            key={t.key || "all"}
            onClick={() => setTab(t.key)}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
              tab === t.key
                ? "border-[#1C63E7] bg-[#1C63E7] text-white"
                : "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      ) : referrals.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">
          No test recommendations{tab ? ` (${REFERRAL_STATUS_META[tab].label.toLowerCase()})` : ""}.
        </p>
      ) : (
        <div className="space-y-2">
          {referrals.map((r) => {
            const meta = REFERRAL_STATUS_META[r.status];
            return (
              <Link
                key={r.id}
                href={`/diagnosticStaff/tests/${r.id}`}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-[#1C63E7]/30 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-bold text-slate-800 dark:text-slate-100">
                      {r.patient?.user?.name ?? r.patient?.name ?? "Patient"}
                    </p>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${meta.badge}`}>{meta.label}</span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-slate-500">{r.testNames.join(", ")}</p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {r.referringClinic?.clinicName ? `From ${r.referringClinic.clinicName} · ` : ""}
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
