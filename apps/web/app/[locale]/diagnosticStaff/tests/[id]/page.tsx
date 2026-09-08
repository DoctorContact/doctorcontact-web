"use client";

import { use, useState, useEffect } from "react";
import { useRouter, Link } from "@/i18n/routing";
import toast from "react-hot-toast";
import { ArrowLeft, Loader2, User, Building2, CalendarDays, FileText } from "lucide-react";
import {
  useReferralDetails,
  useUpdateReferralStatus,
  type ReferralStatus,
} from "@/lib/hooks/useReferrals";
import { REFERRAL_STATUS_META, REFERRAL_STATUS_ORDER } from "@/lib/referralStatus";

export default function DiagnosticStaffTestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: referral, isLoading, isError } = useReferralDetails(id);
  const updateStatus = useUpdateReferralStatus();

  const [status, setStatus] = useState<ReferralStatus>("PENDING");
  const [resultNotes, setResultNotes] = useState("");

  useEffect(() => {
    if (referral) {
      setStatus(referral.status);
      setResultNotes(referral.resultNotes ?? "");
    }
  }, [referral]);

  async function save() {
    try {
      await updateStatus.mutateAsync({ id, status, resultNotes: resultNotes.trim() || undefined });
      toast.success("Status updated — the patient has been notified");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Update failed");
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-[#1C63E7]" />
      </div>
    );
  }

  if (isError || !referral) {
    return (
      <div className="space-y-4">
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">Referral not found.</p>
        <Link href="/diagnosticStaff/tests" className="text-sm font-semibold text-[#1C63E7]">← Back to tests</Link>
      </div>
    );
  }

  const patientName = referral.patient?.user?.name ?? referral.patient?.name ?? "Patient";
  const patientPhone = referral.patient?.user?.phone ?? referral.patient?.phone;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <button
        onClick={() => router.push("/diagnosticStaff/tests")}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-extrabold text-[#0F1B33] dark:text-white">Test recommendation</h1>
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${REFERRAL_STATUS_META[referral.status].badge}`}>
            {REFERRAL_STATUS_META[referral.status].label}
          </span>
        </div>

        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <User className="mt-0.5 h-4 w-4 text-slate-400" />
            <div>
              <dt className="text-xs text-slate-400">Patient</dt>
              <dd className="font-semibold text-slate-800 dark:text-slate-100">
                {patientName}
                {patientPhone ? ` · ${patientPhone}` : ""}
              </dd>
            </div>
          </div>
          {referral.referringClinic?.clinicName && (
            <div className="flex items-start gap-2">
              <Building2 className="mt-0.5 h-4 w-4 text-slate-400" />
              <div>
                <dt className="text-xs text-slate-400">Referred by</dt>
                <dd className="font-semibold text-slate-800 dark:text-slate-100">{referral.referringClinic.clinicName}</dd>
              </div>
            </div>
          )}
          <div className="flex items-start gap-2">
            <CalendarDays className="mt-0.5 h-4 w-4 text-slate-400" />
            <div>
              <dt className="text-xs text-slate-400">Created</dt>
              <dd className="font-semibold text-slate-800 dark:text-slate-100">
                {new Date(referral.createdAt).toLocaleString()}
              </dd>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <FileText className="mt-0.5 h-4 w-4 text-slate-400" />
            <div>
              <dt className="text-xs text-slate-400">Tests</dt>
              <dd className="mt-1 flex flex-wrap gap-1.5">
                {referral.testNames.map((t) => (
                  <span key={t} className="rounded-md bg-[#EAF2FF] px-2 py-0.5 text-xs font-semibold text-[#1C63E7]">
                    {t}
                  </span>
                ))}
              </dd>
            </div>
          </div>
          {referral.notes && (
            <div className="rounded-lg bg-slate-50 p-3 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{referral.notes}</div>
          )}
        </dl>
      </div>

      {/* update status */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 text-sm font-bold text-slate-800 dark:text-slate-100">Update status</h2>

        <div className="flex flex-wrap gap-2">
          {REFERRAL_STATUS_ORDER.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                status === s
                  ? "border-[#1C63E7] bg-[#1C63E7] text-white"
                  : "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {REFERRAL_STATUS_META[s].label}
            </button>
          ))}
        </div>

        <label className="mb-1 mt-4 block text-xs font-semibold text-slate-600 dark:text-slate-300">
          Result / remarks (optional)
        </label>
        <textarea
          value={resultNotes}
          onChange={(e) => setResultNotes(e.target.value)}
          rows={3}
          placeholder="e.g. Sample collected, report ready for pickup"
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#1C63E7] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />

        <button
          onClick={save}
          disabled={updateStatus.isPending}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#1C63E7] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1550c4] disabled:opacity-50"
        >
          {updateStatus.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Save update
        </button>
      </div>
    </div>
  );
}
