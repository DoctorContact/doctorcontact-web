"use client";

import type { QueueToken } from "@doctor-contract/shared";
import { User, Clock, Calendar, Stethoscope, ArrowRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { GradientCard } from "@/components/ui/GradientCard";

interface CurrentPatientCardProps {
  currentPatientToken?: QueueToken;
  currentTokenNumber?: number;
  nextPatientToken?: QueueToken; // NEW: first WAITING/CHECKED_IN token, so the
  // person calling patients always knows who's coming up without scrolling
  // down to the full queue list.
}

export function CurrentPatientCard({
  currentPatientToken,
  currentTokenNumber = 0,
  nextPatientToken,
}: CurrentPatientCardProps) {
  const t = useTranslations("DoctorQueue");
  const hasCurrentPatient =
    Boolean(currentPatientToken) || (currentTokenNumber > 0);

  const formatTokenDisplay = (val: number) => {
    if (!val || val <= 0) return "--";
    return `#${val < 10 ? `0${val}` : val}`;
  };

  const formattedBookingTime = currentPatientToken?.bookedAt
    ? new Date(currentPatientToken.bookedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <GradientCard variant="blue" className="h-full">
      <div className="flex h-full flex-col justify-between p-5">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                <Stethoscope className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {t("currentPatientTitle")}
              </h2>
            </div>
            {hasCurrentPatient && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
                {t("activeCall")}
              </span>
            )}
          </div>

          {!hasCurrentPatient ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                <User className="h-6 w-6" />
              </div>
              <p className="mt-3 text-xs font-bold text-slate-700 dark:text-slate-300">
                {t("noPatientServing")}
              </p>
              <p className="mt-1 max-w-xs text-[11px] text-slate-500 dark:text-slate-400">
                {t("useControlPanel")}
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between rounded-2xl bg-blue-50/70 p-4 transition-colors dark:bg-blue-950/40">
                <div>
                  <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                    {t("servingTokenNumber")}
                  </p>
                  <p className="mt-0.5 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                    {formatTokenDisplay(currentPatientToken?.token ?? currentTokenNumber)}
                  </p>
                </div>
                <div className="rounded-xl bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs">
                  {currentPatientToken?.status || "IN_PROGRESS"}
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 py-1.5 dark:border-slate-800/60">
                  <span className="text-slate-500 dark:text-slate-400">{t("patientName")}</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {currentPatientToken?.patientName || `Patient #${currentPatientToken?.token ?? currentTokenNumber}`}
                  </span>
                </div>

                {(currentPatientToken?.patientAge !== undefined && currentPatientToken?.patientAge !== null) ||
                currentPatientToken?.patientGender ? (
                  <div className="flex items-center justify-between border-b border-slate-100 py-1.5 dark:border-slate-800/60">
                    <span className="text-slate-500 dark:text-slate-400">{t("demographics")}</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {[
                        currentPatientToken.patientAge !== null && currentPatientToken.patientAge !== undefined
                          ? `${currentPatientToken.patientAge} yrs`
                          : null,
                        currentPatientToken.patientGender,
                      ]
                        .filter(Boolean)
                        .join(" • ")}
                    </span>
                  </div>
                ) : null}

                {formattedBookingTime && (
                  <div className="flex items-center justify-between py-1.5">
                    <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <Clock className="h-3.5 w-3.5" />
                      {t("bookedAt")}
                    </span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      {formattedBookingTime}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {nextPatientToken && (
            <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs dark:bg-slate-800/60">
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <ArrowRight className="h-3.5 w-3.5" />
                Next up
              </span>
              <span className="font-bold text-slate-800 dark:text-white">
                {formatTokenDisplay(nextPatientToken.token)} · {nextPatientToken.patientName || "Patient"}
              </span>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-400 dark:border-slate-800">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {t("liveTokenSequence")}
          </span>
          <span>{t("doctorQueueSystem")}</span>
        </div>
      </div>
    </GradientCard>
  );
}
