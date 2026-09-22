"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  Check,
  X,
  Inbox,
  Send,
  CalendarDays,
  Clock,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock3,
  Sparkles,
} from "lucide-react";
import {
  useReceivedDoctorRequests,
  useSentDoctorRequests,
  useRespondToDoctorRequest,
  type SentDoctorRequest,
} from "@/lib/hooks/useClinic";

// 🟢 Multi-Language Name Parser
const parseMultiLangName = (rawName: string = "") => {
  const parts = rawName.split(" | ");
  return {
    en: parts[0]?.trim() || rawName,
    bn: parts[1]?.trim() || "",
    hi: parts[2]?.trim() || "",
  };
};

// ============================================================
// GRADIENT BORDER CARD COMPONENT
// ============================================================
function GradientCard({
  children,
  className = "",
  gradient = "from-[#667eea] via-[#764ba2] to-[#f093fb]",
}: {
  children: React.ReactNode;
  className?: string;
  gradient?: string;
}) {
  return (
    <div className={`relative rounded-2xl p-[3px] bg-gradient-to-r ${gradient} shadow-xl ${className}`}>
      <div className="rounded-[calc(1rem-2px)] bg-white dark:bg-slate-900 h-full">
        {children}
      </div>
    </div>
  );
}

export default function ClinicRequestsPage() {
  const t = useTranslations("ClinicRequests");
  const tDays = useTranslations("Days");
  const locale = useLocale(); // 🟢 Locale for parsing language

  const { data: received, isLoading: loadingReceived } = useReceivedDoctorRequests();
  const { data: sent, isLoading: loadingSent } = useSentDoctorRequests();
  const respond = useRespondToDoctorRequest();

  const pending = (received ?? []).filter((r) => r.status === "PENDING");

  return (
    <div className="space-y-6">
      {/* =====================================================
          PAGE HEADER
      ====================================================== */}
      <GradientCard gradient="from-[#1e3a8a] via-[#3b82f6] to-[#60a5fa]">
        <div className="p-5">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] text-white shadow-lg shadow-blue-500/30">
              <Inbox className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#1e40af]">
              {t("tagline")}
            </span>

            {pending.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#f59e0b] to-[#f97316] px-2 py-0.5 text-[9px] font-bold text-white">
                <Sparkles className="h-3 w-3" />
                {pending.length} Pending
              </span>
            )}
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {t("heading")}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {t("subtitle")}
          </p>
        </div>
      </GradientCard>

      {/* =====================================================
          INCOMING REQUESTS
      ====================================================== */}
      <GradientCard gradient="from-[#667eea] via-[#764ba2] to-[#f093fb]">
        <div className="p-5 sm:p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white shadow-lg shadow-purple-500/30">
              <Inbox className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                {t("incomingTab")}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {t("incomingSub")}
              </p>
            </div>
          </div>

          {loadingReceived ? (
            <div className="flex min-h-[150px] items-center justify-center rounded-2xl border border-slate-100 bg-slate-50/50">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-[#667eea]" />
                <p className="text-sm font-medium text-slate-500">
                  {t("loadingIncoming")}
                </p>
              </div>
            </div>
          ) : pending.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-[#059669] to-[#10b981] text-white shadow-lg shadow-green-500/30">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-sm font-bold text-slate-800">
                {t("emptyIncomingTitle")}
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                {t("emptyIncomingDesc")}
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {pending.map((r) => (
                <IncomingRow
                  key={r.id}
                  request={r}
                  t={t}
                  tDays={tDays}
                  locale={locale} // 🟢 Pass locale
                  onRespond={(action) =>
                    respond.mutate({ associationId: r.id, action })
                  }
                  busy={respond.isPending}
                />
              ))}
            </div>
          )}
        </div>
      </GradientCard>

      {/* =====================================================
          SENT REQUESTS
      ====================================================== */}
      <GradientCard gradient="from-[#1e3a8a] via-[#3b82f6] to-[#059669]">
        <div className="p-5 sm:p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] text-white shadow-lg shadow-blue-500/30">
              <Send className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                {t("sentTab")}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {t("sentSub")}
              </p>
            </div>
          </div>

          {loadingSent ? (
            <div className="flex min-h-[150px] items-center justify-center rounded-2xl border border-slate-100 bg-slate-50/50">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                <p className="text-sm font-medium text-slate-500">
                  {t("loadingSent")}
                </p>
              </div>
            </div>
          ) : !sent || sent.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] text-white shadow-lg shadow-blue-500/30">
                <Send className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-sm font-bold text-slate-800">
                {t("emptySentTitle")}
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                {t("emptySentDesc")}
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {sent.map((r) => {
                // 🟢 Parse Name for Sent Requests
                const parsedName = parseMultiLangName(r.doctor?.user?.name);
                const displayName = locale === "bn" && parsedName.bn ? parsedName.bn : 
                                    locale === "hi" && parsedName.hi ? parsedName.hi : 
                                    parsedName.en || "Unknown Doctor";

                return (
                  <div
                    key={r.id}
                    className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition hover:shadow-lg sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] text-white shadow-md shadow-blue-500/30">
                        <span className="text-sm font-bold">
                          {getInitials(displayName)}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-800">
                          {displayName.startsWith("Dr.") || displayName.startsWith("ডাঃ") || displayName.startsWith("डॉ.") ? displayName : `Dr. ${displayName}`}
                        </p>
                        {r.dayOfWeek && (
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-slate-500">
                            <div className="flex items-center gap-1.5">
                              <CalendarDays className="h-3.5 w-3.5 text-[#1e40af]" />
                              <span>
                                {tDays.has(r.dayOfWeek)
                                  ? tDays(r.dayOfWeek)
                                  : r.dayOfWeek}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-[#1e40af]" />
                              <span>
                                {r.startTime} – {r.endTime}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0">
                      <StatusBadge status={r.status} t={t} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </GradientCard>
    </div>
  );
}

// ============================================================
// Incoming Row Component
// ============================================================
function IncomingRow({
  request,
  onRespond,
  busy,
  t,
  tDays,
  locale,
}: {
  request: SentDoctorRequest;
  onRespond: (action: "ACCEPT" | "REJECT") => void;
  busy: boolean;
  t: any;
  tDays: any;
  locale: string;
}) {
  // 🟢 Parse Name for Incoming Requests
  const parsedName = parseMultiLangName(request.doctor?.user?.name);
  const displayName = locale === "bn" && parsedName.bn ? parsedName.bn : 
                      locale === "hi" && parsedName.hi ? parsedName.hi : 
                      parsedName.en || "Unknown Doctor";

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[#667eea]/10 bg-gradient-to-r from-[#667eea]/5 to-transparent p-4 transition hover:from-[#667eea]/10 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        {/* Avatar */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] text-white shadow-md shadow-blue-500/30">
          <span className="text-sm font-bold">
            {getInitials(displayName)}
          </span>
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-800">
            {displayName.startsWith("Dr.") || displayName.startsWith("ডাঃ") || displayName.startsWith("डॉ.") ? displayName : `Dr. ${displayName}`}
          </p>
          {request.dayOfWeek && (
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-[#1e40af]" />
                <span>
                  {tDays.has(request.dayOfWeek)
                    ? tDays(request.dayOfWeek)
                    : request.dayOfWeek}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-[#1e40af]" />
                <span>
                  {request.startTime} – {request.endTime}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 gap-2 sm:ml-auto">
        <button
          type="button"
          disabled={busy}
          onClick={() => onRespond("ACCEPT")}
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#059669] to-[#10b981] px-4 py-2 text-xs font-bold text-white shadow-md shadow-green-500/30 transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Check className="h-4 w-4" />
          {t("accept")}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => onRespond("REJECT")}
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#f5576c] to-[#fda085] px-4 py-2 text-xs font-bold text-white shadow-md shadow-pink-500/30 transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
        >
          <X className="h-4 w-4" />
          {t("reject")}
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Status Badge Component
// ============================================================
function StatusBadge({ status, t }: { status: string; t: any }) {
  if (status === "APPROVED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#059669] to-[#10b981] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md shadow-green-500/30">
        <CheckCircle2 className="h-3.5 w-3.5" />
        {t("statusApproved")}
      </span>
    );
  }

  if (status === "REJECTED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#f5576c] to-[#fda085] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md shadow-pink-500/30">
        <XCircle className="h-3.5 w-3.5" />
        {t("statusRejected")}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#f59e0b] to-[#f97316] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md shadow-orange-500/30">
      <Clock3 className="h-3.5 w-3.5" />
      {t("statusPending")}
    </span>
  );
}

// ============================================================
// Utility Component
// ============================================================
function getInitials(name: string) {
  const cleanName = name.replace("Dr. ", "").replace("ডাঃ ", "").replace("डॉ. ", "");
  return cleanName
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
}