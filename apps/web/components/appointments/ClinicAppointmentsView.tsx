"use client";

import { useMemo, useState } from "react";
import {
  Calendar,
  Users,
  Stethoscope,
  Phone,
  Filter,
  Award,
  Activity,
  RefreshCw,
  Download,
} from "lucide-react";
import { toast } from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { useClinicAppointments } from "@/lib/hooks/useAppointments";
import { useClinicProfile } from "@/lib/hooks/useClinic";
import type { AppointmentStatus } from "@doctor-contract/shared";

// ------------------------------------------------------------
// Shared View for Clinic & Receptionist Appointments
// ------------------------------------------------------------

type SimpleDoctor = { id: string; name: string };

const STATUS_OPTIONS: { value: AppointmentStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All Statuses" },
  { value: "WAITING", label: "Waiting" },
  { value: "CHECKED_IN", label: "Checked In" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "ABSENT", label: "Absent" },
];

const STATUS_BADGE: Record<string, string> = {
  WAITING: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
  CHECKED_IN: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
  COMPLETED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
  ABSENT: "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400",
};

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function formatDoctorName(name?: string) {
  if (!name?.trim()) return "Dr. Doctor";
  const clean = name.trim().replace(/^(dr\.?\s*)+/i, "").trim();
  return clean ? `Dr. ${clean}` : "Dr. Doctor";
}

export default function ClinicAppointmentsView({
  doctors,
  isLoadingDoctors,
  title = "Appointments",
  subtitle = "All appointments at your clinic — filter by doctor, status, or date.",
}: {
  doctors: SimpleDoctor[];
  isLoadingDoctors?: boolean;
  title?: string;
  subtitle?: string;
}) {
  const { data: clinic } = useClinicProfile();
  
  const [doctorId, setDoctorId] = useState<string>("ALL");
  const [status, setStatus] = useState<AppointmentStatus | "ALL">("ALL");
  const [dateFilter, setDateFilter] = useState<string>(todayStr());
  const [showAllDates, setShowAllDates] = useState(false);

  const filters = useMemo(
    () => ({
      doctorId: doctorId === "ALL" ? undefined : doctorId,
      status: status === "ALL" ? undefined : status,
      date: showAllDates ? undefined : dateFilter,
    }),
    [doctorId, status, dateFilter, showAllDates]
  );

  const { data: appointments, isLoading, isFetching, refetch } = useClinicAppointments(filters);

  // ============================================================
  // 🟢 ZERO-SERVER-LOAD PDF GENERATOR
  // ============================================================
  const generatePDF = () => {
    if (!appointments || appointments.length === 0) {
      toast.error("No appointments available to download.");
      return;
    }

    const doc = new jsPDF();
    
    // Clean Clinic Name (Removes non-English chars to prevent PDF gibberish)
    let rawClinicName = clinic?.clinicName || (clinic as any)?.name || "Clinic Appointments";
    const clinicName = rawClinicName.replace(/[^\x00-\x7F]/g, "").trim() || "Clinic Appointments";

    // Determine Doctor Name
    let doctorName = "All Doctors";
    if (doctorId !== "ALL") {
      const selectedDoc = doctors.find((d) => d.id === doctorId);
      doctorName = formatDoctorName(selectedDoc?.name);
      doctorName = doctorName.replace(/[^\x00-\x7F]/g, "").trim() || "Unknown Doctor";
    }

    const displayDate = showAllDates ? "All Dates" : dateFilter;
    const displayStatus = status === "ALL" ? "All" : status.replace("_", " ");

    // Header styling
    doc.setFontSize(18);
    doc.setTextColor(37, 42, 103); // Dark Blue
    doc.text(clinicName, 14, 20);

    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Doctor: ${doctorName}`, 14, 28);
    doc.text(`Date: ${displayDate}   |   Status: ${displayStatus}`, 14, 34);
    doc.text(`Total Appointments: ${appointments.length}`, 14, 40);

    // Divider Line
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 44, 196, 44);

    // 🟢 Fix: Added (appt: any) to bypass TypeScript strict property checks
    const tableData = appointments.map((appt: any, index: number) => {
      let pName = appt.patient?.user?.name || appt.patient?.name || "-";
      pName = pName.replace(/[^\x00-\x7F]/g, "").trim() || "Unknown";

      let dName = appt.doctor?.user?.name || appt.doctor?.name || "-";
      dName = formatDoctorName(dName).replace(/[^\x00-\x7F]/g, "").trim();

      return [
        String(index + 1),
        String(appt.token),
        pName,
        appt.patient?.user?.phone || appt.patient?.phone || "-",
        dName,
        new Date(appt.date).toLocaleDateString(),
        appt.status.replace("_", " "),
      ];
    });

    // Draw Table
    autoTable(doc, {
      startY: 50,
      head: [["#", "Token", "Patient Name", "Phone", "Doctor", "Date", "Status"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [37, 42, 103], textColor: 255 },
      styles: { fontSize: 9, cellPadding: 3 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    // Save File
    doc.save(`Appointments_${doctorName.replace(/\s+/g, "_")}_${displayDate}.pdf`);
    toast.success("PDF Downloaded Successfully!");
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 px-3 py-4 sm:space-y-6 sm:p-6 lg:p-8">
      {/* ==================================================
          HEADER SECTION
          ================================================== */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-gradient-to-r from-[#252a67] via-[#3b4a8f] to-[#14B8A6] p-6 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
            <p className="mt-1 text-sm text-blue-100 opacity-90">{subtitle}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold transition hover:bg-white/20 backdrop-blur-sm"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={generatePDF}
            disabled={!appointments || appointments.length === 0}
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#252a67] shadow-md transition hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100"
          >
            <Download className="h-4 w-4 text-[#14B8A6]" />
            Download PDF
          </button>
        </div>
      </div>

      {/* ==================================================
          FILTER BAR
          ================================================== */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-1.5 text-sm font-bold text-slate-500 dark:text-slate-400">
          <Filter className="h-4 w-4" />
          Filters:
        </div>

        <select
          value={doctorId}
          onChange={(e) => setDoctorId(e.target.value)}
          disabled={isLoadingDoctors}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-[#252a67] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        >
          <option value="ALL">All Doctors</option>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>
              {formatDoctorName(d.name)}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as AppointmentStatus | "ALL")}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-[#252a67] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={dateFilter}
          disabled={showAllDates}
          onChange={(e) => setDateFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-[#252a67] disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />

        <label className="ml-2 flex cursor-pointer items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
          <input
            type="checkbox"
            checked={showAllDates}
            onChange={(e) => setShowAllDates(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-[#252a67] focus:ring-[#252a67]"
          />
          All Dates
        </label>
      </div>

      {/* ==================================================
          RESULTS TABLE
          ================================================== */}
      {isLoading ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#252a67] border-t-transparent dark:border-blue-400" />
          <p className="text-sm font-semibold text-slate-500">Loading appointments...</p>
        </div>
      ) : (appointments ?? []).length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-5 text-center dark:border-slate-700 dark:bg-slate-800/50">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <Calendar className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">No Appointments Found</h3>
          <p className="mt-1 text-sm font-medium text-slate-500">Try adjusting your filters to see more results.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-4">Token</th>
                  <th className="px-4 py-4">Patient Details</th>
                  <th className="px-4 py-4">Doctor</th>
                  <th className="px-4 py-4">Date</th>
                  <th className="px-4 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {/* 🟢 Fix: Added (appt: any) to bypass TypeScript strict property checks */}
                {appointments!.map((appt: any) => {
                  const patientName = appt.patient?.user?.name || appt.patient?.name || "—";
                  const patientPhone = appt.patient?.user?.phone || appt.patient?.phone || "";
                  
                  return (
                    <tr key={appt.id} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 font-bold text-slate-900 dark:bg-slate-800 dark:text-white">
                          <Award className="h-4 w-4 text-[#252a67] dark:text-blue-400" />
                          #{appt.token}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{patientName}</div>
                        {patientPhone && (
                          <div className="mt-0.5 flex items-center gap-1 text-xs font-medium text-slate-500">
                            <Phone className="h-3 w-3" />
                            {patientPhone}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                          <Stethoscope className="h-4 w-4 text-[#14B8A6]" />
                          {formatDoctorName(appt.doctor?.user?.name || appt.doctor?.name)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-600 dark:text-slate-400">
                        {new Date(appt.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                            STATUS_BADGE[appt.status] ?? STATUS_BADGE.WAITING
                          }`}
                        >
                          {appt.status.replace("_", " ")}
                        </span>
                        {appt.queue?.currentToken != null && appt.status === "WAITING" && (
                          <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                            <Activity className="h-3 w-3" />
                            Serving #{appt.queue.currentToken}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="flex items-center justify-center gap-1.5 text-xs font-medium text-slate-400">
        <Users className="h-4 w-4" />
        Showing secure data for your clinic only.
      </p>
    </div>
  );
}