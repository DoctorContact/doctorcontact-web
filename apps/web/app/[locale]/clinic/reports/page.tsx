"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  CalendarDays,
  Users,
  Stethoscope,
  CheckCircle2,
  XCircle,
  UserX,
  Loader2,
  FileSpreadsheet,
  FileText,
  Sparkles,
  Search,
  BadgeCheck,
  Award,
  ArrowRight,
  Building2,
} from "lucide-react";

import { api } from "@/lib/api";
import {
  usePeriodReport,
  useDownloadReport,
  useDailyDashboard,
  useGrowthReport,
  type Period,
} from "@/lib/hooks/useReports";

const today = new Date().toISOString().split("T")[0];

// ============================================================
// HELPERS
// ============================================================

function getInitials(name?: string) {
  if (!name) return "DR";
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDoctorName(name?: string) {
  if (!name?.trim()) {
    return "Dr. Doctor";
  }
  const cleanName = name
    .trim()
    .replace(/^(dr\.?\s*)+/i, "")
    .trim();
  return cleanName ? `Dr. ${cleanName}` : "Dr. Doctor";
}

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

// ============================================================
// PAGE
// ============================================================

export default function ClinicReportsPage() {
  const t = useTranslations("ClinicReports");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<any | "ALL" | null>(null);

  // Fetch Clinic Profile for Logo
  const { data: clinicProfile } = useQuery({
    queryKey: ["clinicProfile"],
    queryFn: async () => {
      try {
        const response = await api.get("/clinic/profile");
        return response.data?.data?.clinic || response.data?.data || null;
      } catch {
        return null;
      }
    },
  });

  // Fetch Doctors
  const { data: doctorsData, isLoading: isLoadingDoctors } = useQuery({
    queryKey: ["clinicDoctors"],
    queryFn: async () => {
      const response = await api.get("/clinic/doctors");
      return response.data?.data?.doctors || [];
    },
  });

  const clinicPhoto = clinicProfile?.logo || clinicProfile?.image || clinicProfile?.avatar || null;
  const clinicName = clinicProfile?.clinicName || clinicProfile?.name || "Clinic";

  const filteredDoctors =
    doctorsData?.filter((doctor: any) => {
      const doctorName = doctor?.user?.name || doctor?.name || "";
      const specialization = doctor?.specialization || doctor?.specialty || "";
      const search = searchQuery.trim().toLowerCase();

      if (!search) return true;
      return (
        doctorName.toLowerCase().includes(search) ||
        specialization.toLowerCase().includes(search)
      );
    }) || [];

  // ============================================================
  // DOCTOR SELECTION VIEW
  // ============================================================
  if (!selectedDoctor) {
    return (
      <div className="min-h-screen bg-[#fafbfc] px-3 py-4 sm:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-5 sm:mb-7">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Select Doctor for Report
            </h1>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Choose a doctor to generate their individual report or view the overall clinic report.
            </p>
          </div>

          <div className="relative mb-5 sm:mb-7">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 sm:left-4 sm:h-5 sm:w-5" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search doctor by name..."
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-xs text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-[#252a67]/30 focus:ring-2 focus:ring-[#252a67]/15 sm:rounded-2xl sm:py-3.5 sm:pl-12 sm:text-sm"
            />
          </div>

          {isLoadingDoctors ? (
            <div className="flex min-h-[280px] items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#252a67] border-t-transparent" />
                <p className="text-xs font-medium text-slate-400">Loading doctors...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
              {/* CLINIC OVERVIEW CARD */}
              <button
                type="button"
                onClick={() => setSelectedDoctor("ALL")}
                className="group min-w-0 text-left"
              >
                <div className="h-full rounded-2xl bg-gradient-to-br from-[#1e3a8a] via-[#3b82f6] to-[#60a5fa] p-[1.5px] shadow-[0_3px_14px_-6px_rgba(37,42,103,0.45)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-lg sm:p-[2px]">
                  <div className="flex h-full min-w-0 flex-col overflow-hidden rounded-[15px] bg-white sm:rounded-[14px]">
                    <div className="relative h-[118px] w-full overflow-hidden bg-slate-50 sm:h-[150px]">
                      {clinicPhoto ? (
                        <img
                          src={clinicPhoto}
                          alt={clinicName}
                          className="h-full w-full object-cover object-center"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1e3a8a] to-[#3b82f6] text-white">
                          <Building2 className="h-10 w-10 sm:h-12 sm:w-12 text-white/90" />
                        </div>
                      )}
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-7 bg-gradient-to-t from-black/15 to-transparent sm:h-9" />
                      
                      <div className="absolute bottom-1.5 right-1.5 sm:bottom-2.5 sm:right-2.5">
                        <BadgeCheck className="h-4 w-4 rounded-full bg-blue-500 p-0.5 text-white shadow-md sm:h-5 sm:w-5" />
                      </div>
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col p-2.5 sm:p-4">
                      <h3 className="truncate text-xs font-bold text-slate-900 sm:text-base">
                        Overall Clinic Report
                      </h3>
                      <p className="mt-1 flex min-w-0 items-center gap-1 text-[9px] text-slate-500 sm:text-xs">
                        <Building2 className="h-3 w-3 shrink-0 text-blue-500 sm:h-3.5 sm:w-3.5" />
                        <span className="truncate">{clinicName}</span>
                      </p>
                      <div className="mt-2.5 flex items-center justify-between rounded-lg bg-slate-50 px-2 py-1.5 transition-all group-hover:bg-blue-50 sm:mt-3 sm:px-3 sm:py-2">
                        <span className="truncate text-[8px] font-bold text-blue-600 sm:text-[11px]">
                          View All Doctors
                        </span>
                        <ArrowRight className="h-3 w-3 shrink-0 text-blue-500 sm:h-3.5 sm:w-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              </button>

              {/* INDIVIDUAL DOCTOR CARDS */}
              {filteredDoctors.map((doctor: any) => {
                const avatarSrc = doctor?.user?.avatar || doctor?.user?.profilePhoto || doctor?.profilePhoto || doctor?.avatar || null;
                const doctorName = doctor?.user?.name || doctor?.name || "Doctor";
                const displayName = formatDoctorName(doctorName);
                const specialization = doctor?.specialization || doctor?.specialty || "General";
                const experience = Number(doctor?.experience || doctor?.yearsOfExperience || 0);

                return (
                  <button
                    key={doctor.id}
                    type="button"
                    onClick={() => setSelectedDoctor(doctor)}
                    className="group min-w-0 text-left"
                  >
                    <div className="h-full rounded-2xl bg-gradient-to-br from-[#252a67] via-[#3b4a8f] to-[#14B8A6] p-[1.5px] shadow-[0_3px_14px_-6px_rgba(37,42,103,0.45)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_12px_28px_-10px_rgba(20,184,166,0.4)] sm:p-[2px]">
                      <div className="flex h-full min-w-0 flex-col overflow-hidden rounded-[15px] bg-white sm:rounded-[14px]">
                        <div className="relative h-[118px] w-full overflow-hidden bg-slate-100 sm:h-[150px]">
                          {avatarSrc ? (
                            <img
                              src={avatarSrc}
                              alt={displayName}
                              loading="lazy"
                              className="h-full w-full object-cover object-top"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#2563EB] to-[#0F766E] text-3xl font-bold text-white sm:text-4xl">
                              {getInitials(doctorName)}
                            </div>
                          )}
                          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-7 bg-gradient-to-t from-black/10 to-transparent sm:h-9" />
                          {experience > 0 && (
                            <div className="absolute left-1.5 top-1.5 sm:left-2.5 sm:top-2.5">
                              <div className="flex items-center gap-0.5 rounded-full bg-[#252a67]/95 px-1.5 py-0.5 shadow-md ring-1 ring-white/20 backdrop-blur-sm sm:gap-1 sm:px-2 sm:py-1">
                                <Award className="h-2.5 w-2.5 text-amber-300 sm:h-3 sm:w-3" />
                                <span className="text-[8px] font-bold text-white sm:text-[10px]">
                                  {experience}+ yrs
                                </span>
                              </div>
                            </div>
                          )}
                          <div className="absolute bottom-1.5 right-1.5 sm:bottom-2.5 sm:right-2.5">
                            <BadgeCheck className="h-4 w-4 rounded-full bg-blue-500 p-0.5 text-white shadow-md sm:h-5 sm:w-5" />
                          </div>
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col p-2.5 sm:p-4">
                          <h3 className="truncate text-xs font-bold text-slate-900 sm:text-base">
                            {displayName}
                          </h3>
                          <p className="mt-1 flex min-w-0 items-center gap-1 text-[9px] text-slate-500 sm:text-xs">
                            <Stethoscope className="h-3 w-3 shrink-0 text-[#14B8A6] sm:h-3.5 sm:w-3.5" />
                            <span className="truncate">{specialization}</span>
                          </p>
                          <div className="mt-2.5 flex items-center justify-between rounded-lg bg-slate-50 px-2 py-1.5 transition-all group-hover:bg-[#252a67]/[0.06] sm:mt-3 sm:px-3 sm:py-2">
                            <span className="truncate text-[8px] font-bold text-slate-600 transition-colors group-hover:text-[#252a67] sm:text-[11px]">
                              Generate Report
                            </span>
                            <ArrowRight className="h-3 w-3 shrink-0 text-slate-400 transition-all group-hover:translate-x-1 group-hover:text-[#252a67] sm:h-3.5 sm:w-3.5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
          {filteredDoctors.length === 0 && !isLoadingDoctors && (
            <div className="flex min-h-[280px] flex-col items-center justify-center px-4 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                <Search className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-700">No doctors found</p>
              <p className="mt-1 max-w-xs text-xs text-slate-400">
                No doctors match <span className="font-medium">"{searchQuery}"</span>
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============================================================
  // REPORT VIEW (Doctor Selected)
  // ============================================================
  const doctorId = selectedDoctor === "ALL" ? undefined : selectedDoctor.id;
  const doctorNameDisplay = selectedDoctor === "ALL" 
    ? "Overall Clinic" 
    : formatDoctorName(selectedDoctor?.user?.name || selectedDoctor?.name);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <button
        type="button"
        onClick={() => setSelectedDoctor(null)}
        className="group mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-[#252a67]"
      >
        <ArrowRight className="h-4 w-4 rotate-180 transition-transform duration-200 group-hover:-translate-x-1" />
        Back to Doctor Selection
      </button>

      <GradientCard gradient="from-[#1e3a8a] via-[#3b82f6] to-[#60a5fa]">
        <div className="p-5">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] text-white shadow-lg shadow-blue-500/30">
              <BarChart3 className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#1e40af]">
              {t("tagline")}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#059669] to-[#10b981] px-2 py-0.5 text-[9px] font-bold text-white">
              <Sparkles className="h-3 w-3" />
              Analytics
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Reports for {doctorNameDisplay}
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            {t("subtitle")}
          </p>
        </div>
      </GradientCard>

      <PeriodReportCard doctorId={doctorId} doctorNameDisplay={doctorNameDisplay} />
      <GrowthCard />
    </div>
  );
}

/* ============================================================
   PERIOD REPORT - Gradient Border
============================================================ */

function PeriodReportCard({ doctorId, doctorNameDisplay }: { doctorId?: string; doctorNameDisplay: string }) {
  const t = useTranslations("ClinicReports");
  const tStatus = useTranslations("Status");

  const PERIODS: {
    value: Period;
    labelKey: "daily" | "weekly" | "monthly" | "yearly" | "custom";
  }[] = [
    { value: "daily", labelKey: "daily" },
    { value: "weekly", labelKey: "weekly" },
    { value: "monthly", labelKey: "monthly" },
    { value: "yearly", labelKey: "yearly" },
    { value: "custom", labelKey: "custom" },
  ];

  const [period, setPeriod] = useState<Period>("daily");
  const [date, setDate] = useState(today);
  const [month, setMonth] = useState(today.slice(0, 7));
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const periodReport = usePeriodReport();
  const download = useDownloadReport();
  const dashboardDate = period === "daily" ? date : undefined;
  const { data: dashboard } = useDailyDashboard(dashboardDate);

  function currentParams() {
    const baseParams: any = {};
    if (doctorId) {
      baseParams.doctorId = doctorId;
    }

    if (period === "daily") return { ...baseParams, period, date };
    if (period === "monthly") return { ...baseParams, period, month };
    if (period === "yearly") return { ...baseParams, period, year };
    if (period === "custom") return { ...baseParams, period, startDate, endDate };
    return { ...baseParams, period, date };
  }

  function handleFetch() {
    periodReport.mutate(currentParams());
  }

  function handleDownload(format: "pdf" | "excel") {
    let datePart = "";
    if (period === "daily" || period === "weekly") datePart = date;
    else if (period === "monthly") datePart = month;
    else if (period === "yearly") datePart = year;
    else if (period === "custom") datePart = `${startDate}_to_${endDate}`;
    
    // Clean names to be safe for filenames
    const safeDocName = doctorNameDisplay.replace(/[^\w\s-]/g, "").replace(/\s+/g, "_");
    const extension = format === "excel" ? "xlsx" : "pdf";

const filename = `Report_${safeDocName}_${datePart}.${extension}`;

    download.mutate({
      ...currentParams(),
      format,
      filename, // Sending the dynamic filename to the hook
    });
  }

  const report = periodReport.data;

  return (
    <GradientCard gradient="from-[#667eea] via-[#764ba2] to-[#f093fb]">
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white shadow-lg shadow-purple-500/30">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                {t("patientReportTitle")}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {t("patientReportSub")}
              </p>
            </div>
          </div>

          {report && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleDownload("pdf")}
                disabled={download.isPending}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#f5576c] to-[#fda085] px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-pink-500/30 transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
              >
                {download.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
                PDF
              </button>
              <button
                type="button"
                onClick={() => handleDownload("excel")}
                disabled={download.isPending}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#059669] to-[#10b981] px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-green-500/30 transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
              >
                {download.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileSpreadsheet className="h-3.5 w-3.5" />}
                Excel
              </button>
            </div>
          )}
        </div>

        <div className="mt-5">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {t("reportPeriod")}
          </p>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPeriod(p.value)}
                className={
                  period === p.value
                    ? "rounded-lg bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/30 transition"
                    : "rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 transition hover:border-[#1e40af]/30 hover:bg-[#1e40af]/5"
                }
              >
                {t(p.labelKey)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-[#1e40af]/10 bg-gradient-to-r from-[#1e40af]/5 to-transparent p-3.5">
          <div className="flex flex-wrap items-end gap-3">
            {(period === "daily" || period === "weekly") && (
              <Field label={period === "weekly" ? t("weekDateLabel") : t("dateLabel")}>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800"
                />
              </Field>
            )}
            {period === "monthly" && (
              <Field label={t("monthLabel")}>
                <input
                  type="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800"
                />
              </Field>
            )}
            {period === "yearly" && (
              <Field label={t("yearLabel")}>
                <input
                  type="number"
                  min="2000"
                  max="2100"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 w-28"
                />
              </Field>
            )}
            {period === "custom" && (
              <>
                <Field label={t("startDateLabel")}>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800"
                  />
                </Field>
                <Field label={t("endDateLabel")}>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800"
                  />
                </Field>
              </>
            )}
            <button
              type="button"
              onClick={handleFetch}
              disabled={periodReport.isPending}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/30 transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              {periodReport.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {periodReport.isPending ? t("loading") : t("viewReportBtn")}
            </button>
          </div>
        </div>

        {report && (
          <div className="mt-6 space-y-6 border-t border-slate-100 pt-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <ReportStat icon={Users} label={t("totalAppointments")} value={report.totalAppointments} />
              
              {/* 🟢 Removed Income Field from Here */}
              
              {period === "daily" && dashboard && (
                <>
                  <ReportStat icon={Users} label={t("newPatients")} value={dashboard.newPatients} />
                  <ReportStat icon={CheckCircle2} label={t("returningPatients")} value={dashboard.returningPatients} />
                </>
              )}
            </div>

            <div>
              <SectionTitle>{t("statusBreakdown")}</SectionTitle>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {Object.entries(report.byStatus).map(([status, count]) => (
                  <StatusCard key={status} status={status} count={count as number} tStatus={tStatus} t={t} />
                ))}
              </div>
            </div>

            <div>
              <SectionTitle>{t("doctorWiseBreakdown")}</SectionTitle>
              <div className="overflow-hidden rounded-lg border border-slate-200 divide-y divide-slate-100">
                {Object.entries(report.byDoctor).map(([doctorName, doctor]: [string, any]) => (
                  <div key={doctorName} className="flex flex-col gap-3 p-3.5 sm:flex-row sm:items-center sm:justify-between hover:bg-[#1e40af]/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] text-white shadow-md shadow-blue-500/30">
                        <Stethoscope className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{doctorName}</p>
                        <p className="mt-0.5 text-[11px] text-slate-500">{doctor.totalAppointments} {t("appointmentsShort")}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
                      <span className="rounded-md bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] px-2.5 py-1 text-white shadow-md shadow-blue-500/30">
                        {doctor.totalAppointments} {t("totalAppointments")}
                      </span>
                      <span className="rounded-md bg-gradient-to-r from-[#059669] to-[#10b981] px-2.5 py-1 text-white shadow-md shadow-green-500/30">
                        {doctor.completed} {tStatus("COMPLETED")}
                      </span>
                      {/* 🟢 Removed Doctor's Revenue Field from Here */}
                    </div>
                  </div>
                ))}
                {Object.keys(report.byDoctor).length === 0 && (
                  <div className="p-6 text-center">
                    <Stethoscope className="mx-auto h-6 w-6 text-slate-400" />
                    <p className="mt-2 text-xs font-medium text-slate-500">{t("noAppointmentsPeriod")}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </GradientCard>
  );
}

/* ============================================================
   GROWTH REPORT - Gradient Border
============================================================ */

function GrowthCard() {
  const t = useTranslations("ClinicReports");

  const [granularity, setGranularity] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly");
  const [startDate, setStartDate] = useState(
    new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(today);

  const growth = useGrowthReport();

  function handleFetch() {
    growth.mutate({ granularity, startDate, endDate });
  }

  const data = growth.data;

  return (
    <GradientCard gradient="from-[#1e3a8a] via-[#3b82f6] to-[#059669]">
      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-[#059669] to-[#10b981] text-white shadow-lg shadow-green-500/30">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">{t("patientGrowthTitle")}</h2>
            <p className="mt-0.5 text-xs text-slate-500">{t("patientGrowthSub")}</p>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-[#059669]/10 bg-gradient-to-r from-[#059669]/5 to-transparent p-3.5">
          <div className="flex flex-wrap items-end gap-3">
            <Field label={t("granularityLabel")}>
              <select
                value={granularity}
                onChange={(e) => setGranularity(e.target.value as typeof granularity)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800"
              >
                <option value="daily">{t("daily")}</option>
                <option value="weekly">{t("weekly")}</option>
                <option value="monthly">{t("monthly")}</option>
                <option value="yearly">{t("yearly")}</option>
              </select>
            </Field>
            <Field label={t("startDateLabel")}>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800"
              />
            </Field>
            <Field label={t("endDateLabel")}>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800"
              />
            </Field>
            <button
              type="button"
              onClick={handleFetch}
              disabled={growth.isPending}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#059669] to-[#10b981] px-4 py-2 text-xs font-semibold text-white shadow-md shadow-green-500/30 transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              {growth.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {growth.isPending ? t("loading") : t("viewGrowthBtn")}
            </button>
          </div>
        </div>

        {data && (
          <div className="mt-6 space-y-6 border-t border-slate-100 pt-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <GrowthStat label={t("thisPeriod")} value={data.summary.currentPeriodPatients} />
              <GrowthStat label={t("previousPeriod")} value={data.summary.previousPeriodPatients} />
              <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t("growthRate")}</p>
                <div className="mt-2 flex items-center gap-2">
                  {data.summary.growthRatePercent >= 0 ? (
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-r from-[#059669] to-[#10b981] text-white shadow-md shadow-green-500/30">
                      <TrendingUp className="h-3.5 w-3.5" />
                    </div>
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-r from-[#f5576c] to-[#fda085] text-white shadow-md shadow-pink-500/30">
                      <TrendingDown className="h-3.5 w-3.5" />
                    </div>
                  )}
                  <span className={"text-base font-bold " + (data.summary.growthRatePercent >= 0 ? "text-[#059669]" : "text-[#f5576c]")}>
                    {data.summary.growthRatePercent}%
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">{t("vsPreviousPeriod")}</p>
              </div>
            </div>

            <div>
              <SectionTitle>{t("growthTrend")}</SectionTitle>
              <div className="overflow-hidden rounded-lg border border-slate-200 divide-y divide-slate-100">
                {data.trend.map((point: any) => (
                  <div key={point.period} className="p-3.5 hover:bg-[#1e40af]/5 transition-colors">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-900">{point.period}</p>
                        <p className="mt-0.5 text-[11px] text-slate-500">{t("patientActivity")}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
                        <span className="rounded-md bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] px-2.5 py-1 text-white shadow-md shadow-blue-500/30">
                          {point.newPatients} {t("newShort")}
                        </span>
                        <span className="rounded-md bg-gradient-to-r from-[#059669] to-[#10b981] px-2.5 py-1 text-white shadow-md shadow-green-500/30">
                          {point.returningPatients} {t("returningShort")}
                        </span>
                        <span className="rounded-md bg-gradient-to-r from-[#f59e0b] to-[#f97316] px-2.5 py-1 text-white shadow-md shadow-orange-500/30">
                          {point.totalAppointments} {t("appointmentsShort")}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {data.trend.length === 0 && (
                  <div className="p-6 text-center">
                    <TrendingUp className="mx-auto h-6 w-6 text-slate-400" />
                    <p className="mt-2 text-xs font-medium text-slate-500">{t("noDataRange")}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </GradientCard>
  );
}

/* ============================================================
   HELPERS & SUB-COMPONENTS
============================================================ */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-400">
      {children}
    </p>
  );
}

function ReportStat({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] text-white shadow-md shadow-blue-500/30">
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
      <p className="mt-2 text-lg font-bold text-slate-900">{value}</p>
      <p className="mt-0.5 text-[11px] text-slate-500">{label}</p>
    </div>
  );
}

function GrowthStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3.5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1.5 text-lg font-bold text-slate-900">{value}</p>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6]" />
      </div>
    </div>
  );
}

function StatusCard({ status, count, tStatus, t }: { status: string; count: number; tStatus: any; t: any }) {
  const isCancelled = status === "CANCELLED";
  const isAbsent = status === "ABSENT";
  const isCompleted = status === "COMPLETED";

  let icon = Users;
  let gradient = "from-[#1e3a8a] to-[#3b82f6]";
  let textClass = "text-[#1e40af]";

  if (isCancelled) {
    icon = XCircle;
    gradient = "from-[#f5576c] to-[#fda085]";
    textClass = "text-[#f5576c]";
  } else if (isAbsent) {
    icon = UserX;
    gradient = "from-[#f59e0b] to-[#f97316]";
    textClass = "text-[#f59e0b]";
  } else if (isCompleted) {
    icon = CheckCircle2;
    gradient = "from-[#059669] to-[#10b981]";
    textClass = "text-[#059669]";
  }

  const Icon = icon;
  const displayStatus = isAbsent ? t("noShow") : tStatus.has(status) ? tStatus(status) : status;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-xs">
      <div className="flex items-center gap-3">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gradient-to-r ${gradient} text-white shadow-md`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className={`truncate text-xs font-semibold ${textClass}`}>{displayStatus}</p>
          <p className="mt-0.5 text-base font-bold text-slate-900">{count}</p>
        </div>
      </div>
    </div>
  );
}