"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CalendarClock, Search, CheckCircle2, XCircle, Loader2, UserRound } from "lucide-react";

import { api } from "@/lib/api";
import { useClinicProfile } from "@/lib/hooks/useClinic";
import {
  useClinicFollowups,
  useScheduleFollowup,
  useCancelFollowup,
  useCompleteFollowup,
  type FollowupStatus,
} from "@/lib/hooks/useFollowups";

function fmtDate(d: string) {
  try {
    return new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return d;
  }
}

const STATUS_TABS: { key: "" | FollowupStatus; label: string }[] = [
  { key: "", label: "All" },
  { key: "SCHEDULED", label: "Scheduled" },
  { key: "COMPLETED", label: "Completed" },
  { key: "CANCELLED", label: "Cancelled" },
];

interface DoctorOpt {
  id: string;
  name: string;
  specialization?: string;
}

export default function ClinicFollowupsPage() {
  const { data: clinic } = useClinicProfile();
  const clinicId = clinic?.id;

  const [statusTab, setStatusTab] = useState<"" | FollowupStatus>("");
  const { data: followups = [], isLoading } = useClinicFollowups(
    clinicId,
    statusTab ? { status: statusTab } : {},
  );

  const { data: doctors = [] } = useQuery<DoctorOpt[]>({
    queryKey: ["clinic", "doctors", "options"],
    enabled: !!clinicId,
    queryFn: async () => {
      const res = await api.get("/clinic/doctors");
      const raw = res.data?.data?.doctors ?? res.data?.data ?? res.data ?? [];
      return (Array.isArray(raw) ? raw : []).map((d: any) => ({
        id: d.id,
        name: d.user?.name ?? d.name ?? "Doctor",
        specialization: d.specialization ?? d.user?.specialization,
      }));
    },
  });

  // --- schedule form state ---
  const [phone, setPhone] = useState("");
  const [patient, setPatient] = useState<{ id: string; name: string } | null>(null);
  const [lookingUp, setLookingUp] = useState(false);
  const [doctorId, setDoctorId] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [notes, setNotes] = useState("");

  const scheduleMut = useScheduleFollowup();
  const cancelMut = useCancelFollowup();
  const completeMut = useCompleteFollowup();

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  async function lookupPatient() {
    if (phone.trim().length < 10) {
      toast.error("Enter a valid 10-digit phone number");
      return;
    }
    setLookingUp(true);
    try {
      const res = await api.get(`/patient/search-by-phone?phone=${phone.trim()}`);
      const p = res.data?.data?.patient;
      if (p?.id) {
        setPatient({ id: p.id, name: p.name ?? "Patient" });
        toast.success(`Patient found: ${p.name ?? ""}`);
      } else {
        setPatient(null);
        toast.error("No patient found with this phone number");
      }
    } catch {
      setPatient(null);
      toast.error("Lookup failed");
    } finally {
      setLookingUp(false);
    }
  }

  async function submitSchedule(e: React.FormEvent) {
    e.preventDefault();
    if (!patient || !doctorId || !followUpDate || !clinicId) {
      toast.error("Patient, doctor and date are required");
      return;
    }
    try {
      await scheduleMut.mutateAsync({
        patientId: patient.id,
        doctorId,
        clinicId,
        followUpDate,
        notes: notes.trim() || undefined,
      });
      toast.success("Follow-up scheduled — the patient will be notified on that date");
      setPhone("");
      setPatient(null);
      setDoctorId("");
      setFollowUpDate("");
      setNotes("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Could not schedule follow-up");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0F1B33] dark:text-white">Follow-ups</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Schedule a follow-up visit date for a patient. They are automatically notified when the date arrives.
        </p>
      </div>

      {/* ================= SCHEDULE FORM ================= */}
      <form
        onSubmit={submitSchedule}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100">
          <CalendarClock className="h-4 w-4 text-[#1C63E7]" /> Schedule a follow-up
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          {/* phone lookup */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">Patient phone</label>
            <div className="flex gap-2">
              <input
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                  setPatient(null);
                }}
                placeholder="10-digit mobile"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#1C63E7] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <button
                type="button"
                onClick={lookupPatient}
                disabled={lookingUp}
                className="flex shrink-0 items-center gap-1 rounded-xl bg-slate-800 px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-50 dark:bg-slate-700"
              >
                {lookingUp ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </button>
            </div>
            {patient && (
              <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-green-600">
                <UserRound className="h-3 w-3" /> {patient.name}
              </p>
            )}
          </div>

          {/* doctor */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">Doctor</label>
            <select
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#1C63E7] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="">Select doctor</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                  {d.specialization ? ` — ${d.specialization}` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* date */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">Follow-up date</label>
            <input
              type="date"
              min={today}
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#1C63E7] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* notes */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">Notes (optional)</label>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. review blood report"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#1C63E7] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={scheduleMut.isPending || !patient || !doctorId || !followUpDate}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#1C63E7] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1550c4] disabled:opacity-50"
        >
          {scheduleMut.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Schedule follow-up
        </button>
      </form>

      {/* ================= LIST ================= */}
      <div>
        <div className="mb-3 flex gap-2 overflow-x-auto no-scrollbar">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key || "all"}
              onClick={() => setStatusTab(tab.key)}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                statusTab === tab.key
                  ? "border-[#1C63E7] bg-[#1C63E7] text-white"
                  : "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        ) : followups.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">
            No follow-ups {statusTab ? `(${statusTab.toLowerCase()})` : ""} yet.
          </p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Doctor</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {followups.map((f) => (
                  <tr key={f.id} className="bg-white dark:bg-slate-900">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-800 dark:text-slate-100">
                        {f.patient?.user?.name ?? f.patient?.name ?? "Patient"}
                      </p>
                      <p className="text-xs text-slate-400">{f.patient?.user?.phone ?? f.patient?.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">Dr. {f.doctor?.user?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{fmtDate(f.followUpDate)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          f.status === "SCHEDULED"
                            ? "bg-blue-50 text-blue-700"
                            : f.status === "COMPLETED"
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-600"
                        }`}
                      >
                        {f.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {f.status === "SCHEDULED" && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => completeMut.mutate(f.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 hover:bg-green-100"
                          >
                            <CheckCircle2 className="h-3 w-3" /> Complete
                          </button>
                          <button
                            onClick={() => cancelMut.mutate(f.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
                          >
                            <XCircle className="h-3 w-3" /> Cancel
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
