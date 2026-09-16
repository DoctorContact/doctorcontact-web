"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Search,
  Loader2,
  BadgeCheck,
  Award,
  Stethoscope,
  ArrowRight,
  Clock,
  Download,
  Users,
} from "lucide-react";
import { toast } from "react-hot-toast";

// 🟢 NEW: Client-side PDF libraries
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { api } from "@/lib/api";
import { useClinicProfile } from "@/lib/hooks/useClinic";

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
  if (!name?.trim()) return "Dr. Doctor";
  const cleanName = name.trim().replace(/^(dr\.?\s*)+/i, "").trim();
  return cleanName ? `Dr. ${cleanName}` : "Dr. Doctor";
}

function getTodayLocal() {
  const tzOffset = new Date().getTimezoneOffset() * 60000;
  return new Date(Date.now() - tzOffset).toISOString().split("T")[0];
}

function formatDateStripLabel(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const today = new Date();
  const isToday =
    dt.getFullYear() === today.getFullYear() &&
    dt.getMonth() === today.getMonth() &&
    dt.getDate() === today.getDate();
  if (isToday) return { top: "Today", bottom: dt.toLocaleDateString("en-US", { day: "numeric", month: "short" }) };
  return {
    top: dt.toLocaleDateString("en-US", { weekday: "short" }),
    bottom: dt.toLocaleDateString("en-US", { day: "numeric", month: "short" }),
  };
}

type AvailableDateEntry = { date: string; sessions: any[] };

// ============================================================
// PAGE COMPONENT
// ============================================================

export default function ClinicAddPatientPage() {
  const { data: clinic } = useClinicProfile();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);

  // Patient States
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [patientId, setPatientId] = useState("");
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);
  const [isExistingPatient, setIsExistingPatient] = useState(false);

  // Schedule & Date States
  const [date, setDate] = useState("");
  const [schedules, setSchedules] = useState<any[]>([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState("");
  const [isFetchingSchedules, setIsFetchingSchedules] = useState(false);

  const [availableDates, setAvailableDates] = useState<AvailableDateEntry[]>([]);
  const [isFetchingDates, setIsFetchingDates] = useState(false);

  // ============================================================
  // FETCH CLINIC DOCTORS
  // ============================================================

  const { data: doctorsData, isLoading: isLoadingDoctors } = useQuery({
    queryKey: ["clinicDoctors"],
    queryFn: async () => {
      const response = await api.get("/clinic/doctors");
      return response.data?.data?.doctors || [];
    },
  });

  const filteredDoctors = doctorsData?.filter((doctor: any) => {
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
  // AUTO-FETCH SCHEDULES WHEN DATE OR DOCTOR CHANGES
  // ============================================================
  
  useEffect(() => {
    async function fetchSchedulesForDate() {
      if (!selectedDoctor || !clinic?.id || !date) return;
      
      setIsFetchingSchedules(true);
      setSelectedScheduleId("");

      try {
        const response = await api.get(`/doctors/${selectedDoctor.id}/clinics/${clinic.id}/schedules?date=${date}`);
        if (response.data?.success) {
          setSchedules(response.data.data.schedules || []);
        }
      } catch (error) {
        setSchedules([]);
        toast.error("Failed to load sessions for this date.");
      } finally {
        setIsFetchingSchedules(false);
      }
    }

    fetchSchedulesForDate();
  }, [selectedDoctor, clinic?.id, date]);

  // ============================================================
  // FETCH AVAILABLE DATES
  // ============================================================

  useEffect(() => {
    async function fetchAvailableDates() {
      if (!selectedDoctor || !clinic?.id) return;

      setIsFetchingDates(true);
      setAvailableDates([]);
      setDate("");
      setSchedules([]);
      setSelectedScheduleId("");

      try {
        const response = await api.get(
          `/doctors/${selectedDoctor.id}/clinics/${clinic.id}/schedules/available-dates?limit=10`
        );
        if (response.data?.success) {
          const dates: AvailableDateEntry[] = response.data.data.dates || [];
          setAvailableDates(dates);
          if (dates.length > 0) setDate(dates[0].date);
        }
      } catch (error) {
        setAvailableDates([]);
        toast.error("Failed to load available dates.");
      } finally {
        setIsFetchingDates(false);
      }
    }

    fetchAvailableDates();
  }, [selectedDoctor, clinic?.id]);

  // ============================================================
  // 🟢 NEW: FETCH APPOINTMENTS FOR SELECTED DATE (BACKGROUND)
  // ============================================================
  const { data: allAppointments = [], isLoading: isLoadingAppointments, refetch: refetchAppointments } = useQuery({
    queryKey: ["clinicAppointments", clinic?.id, selectedDoctor?.id, date],
    queryFn: async () => {
      if (!clinic?.id || !selectedDoctor?.id || !date) return [];
      const response = await api.get("/appointments/clinic", {
        params: { doctorId: selectedDoctor.id, date },
      });
      return response.data?.data?.appointments || [];
    },
    enabled: !!(clinic?.id && selectedDoctor?.id && date), // Only fetch if these exist
  });

  // Filter appointments to show ONLY those for the currently selected session
  const sessionAppointments = allAppointments.filter(
    (appt: any) => appt.queue?.scheduleId === selectedScheduleId
  );

  const onlineCount = sessionAppointments.filter((a: any) => a.bookingSource === "ONLINE").length;
  const offlineCount = sessionAppointments.length - onlineCount;

  // ============================================================
  // PHONE CHECK (AUTO-FILL EXISTING PATIENT)
  // ============================================================

  const handlePhoneChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/\D/g, "");
    if (value.length > 10) return;
    setPhone(value);

    if (value.length !== 10) {
      setIsExistingPatient(false);
      setPatientId("");
      return;
    }

    setIsCheckingPhone(true);
    try {
      const response = await api.get(`/patient/search`, { params: { phone: value } });
      const patient = response.data?.data?.patient;

      if (patient) {
        setPatientId(patient.id);
        setName(patient?.name || "");
        setAge(patient?.age != null ? String(patient.age) : "");
        setIsExistingPatient(true);
        toast.success("Existing patient found. You can edit the name if needed.");
      } else {
        setPatientId("");
        setName("");
        setAge("");
        setIsExistingPatient(false);
      }
    } catch {
      setPatientId("");
      setName("");
      setAge("");
      setIsExistingPatient(false);
    } finally {
      setIsCheckingPhone(false);
    }
  };

  // ============================================================
  // ADD PATIENT TO QUEUE
  // ============================================================

  const addToQueueMutation = useMutation({
    mutationFn: async () => {
      if (!selectedDoctor || !selectedScheduleId || !date) {
        throw new Error("Please select a doctor, date, and an available session.");
      }

      const payload: any = {
        doctorId: selectedDoctor.id,
        clinicId: clinic?.id,
        scheduleId: selectedScheduleId,
        date: date,
        bookingSource: date === getTodayLocal() ? "WALK_IN" : "RECEPTION"
      };

      if (isExistingPatient && patientId) {
        payload.patientId = patientId;
      } else {
        payload.newPatient = {
          name,
          phone,
          age: age ? Number(age) : undefined,
        };
      }

      return api.post("/appointments/book/reception", payload);
    },
    onSuccess: (res) => {
      toast.success(`Booking successful! Token #${res.data?.data?.appointment?.token || res.data?.data?.token || 'Confirmed'}`);
      setPhone("");
      setName("");
      setAge("");
      setPatientId("");
      setIsExistingPatient(false);
      
      // Refresh the table silently
      refetchAppointments();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to book appointment");
    },
  });

// ============================================================
  // 🟢 ZERO-SERVER-LOAD PDF GENERATOR (FIXED)
  // ============================================================
  const generatePDF = () => {
    if (sessionAppointments.length === 0) {
      toast.error("No patients to download for this session.");
      return;
    }

    const doc = new jsPDF();
    const doctorName = formatDoctorName(selectedDoctor?.user?.name || selectedDoctor?.name);
    const selectedSession = schedules.find((s) => s.id === selectedScheduleId);
    
    // 🟢 Fix 1: TypeScript Error Fixed (Removed clinic?.name)
    let rawClinicName = clinic?.clinicName || "Clinic Patient List";
    
    // 🟢 Fix 2: PDF Gibberish Text Fixed 
    // jsPDF ডিফল্ট ফন্টে বাংলা/হিন্দি সাপোর্ট করে না, তাই শুধু ইংরেজি অক্ষর ফিল্টার করা হলো
    const clinicName = rawClinicName.replace(/[^\x00-\x7F]/g, "").trim() || "Clinic Patient List";

    // Header styling
    doc.setFontSize(18);
    doc.setTextColor(31, 78, 120); // Primary Dark Blue
    doc.text(clinicName, 14, 20);

    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Doctor: ${doctorName}`, 14, 28);
    doc.text(`Date: ${date}   |   Session: ${selectedSession?.startTime || "N/A"} - ${selectedSession?.endTime || "N/A"}`, 14, 34);
    
    doc.setFontSize(10);
    doc.text(`Total: ${sessionAppointments.length} (Online: ${onlineCount}, Walk-in: ${offlineCount})`, 14, 40);

    // Line divider
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 44, 196, 44);

    // Prepare table data
    const tableData = sessionAppointments.map((appt: any, index: number) => {
      // পেশেন্টের নামেও যদি বাংলা/হিন্দি থাকে, সেটাকে ফিল্টার করা হচ্ছে যাতে PDF ক্র্যাশ না করে
      let pName = appt.patient?.user?.name || appt.patient?.name || "-";
      pName = pName.replace(/[^\x00-\x7F]/g, "").trim() || "Unknown";

      return [
        String(index + 1),
        String(appt.token),
        pName,
        appt.patient?.user?.phone || appt.patient?.phone || "-",
        appt.bookingSource === "ONLINE" ? "Online" : "Walk-in",
        appt.status,
      ];
    });

    // Draw Table
    autoTable(doc, {
      startY: 50,
      head: [["#", "Token", "Patient Name", "Phone", "Type", "Status"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [37, 42, 103], textColor: 255 },
      styles: { fontSize: 10, cellPadding: 3 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    // Save File
    doc.save(`Patient_List_${doctorName.replace(/\s+/g, "_")}_${date}.pdf`);
    toast.success("PDF Downloaded Successfully!");
  };

  // ============================================================
  // PATIENT FORM RENDER
  // ============================================================

  if (selectedDoctor) {
    const avatarSrc = selectedDoctor?.user?.avatar || selectedDoctor?.profilePhoto || null;
    const doctorName = formatDoctorName(selectedDoctor?.user?.name || selectedDoctor?.name);
    const specialization = selectedDoctor?.specialization || "General";

    return (
      <div className="min-h-screen bg-[#fafbfc] px-3 py-5 sm:p-6 lg:p-8 dark:bg-slate-950 pb-20">
        <div className="mx-auto w-full max-w-2xl">
          <button type="button" onClick={() => setSelectedDoctor(null)} className="group mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-[#252a67] dark:hover:text-white">
            <ArrowRight className="h-4 w-4 rotate-180 transition-transform duration-200 group-hover:-translate-x-1" />
            Back to Doctor List
          </button>

          {/* DOCTOR HEADER */}
          <div className="mb-6 rounded-[24px] bg-gradient-to-br from-[#252a67] via-[#3b4a8f] to-[#14B8A6] p-[1.5px] shadow-[0_10px_30px_-15px_rgba(37,42,103,0.45)]">
            <div className="flex min-h-[84px] items-center gap-3 rounded-[22px] bg-white px-3.5 py-3.5 sm:gap-4 sm:px-5 sm:py-4 dark:bg-slate-900">
              <div className="relative shrink-0">
                <div className="h-14 w-14 overflow-hidden rounded-2xl bg-slate-100 ring-2 ring-[#252a67] sm:h-16 sm:w-16">
                  {avatarSrc ? (
                    <img src={avatarSrc} alt={doctorName} className="h-full w-full object-cover object-top" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#2563EB] to-[#0F766E] text-xl font-bold text-white">
                      {getInitials(selectedDoctor?.user?.name)}
                    </div>
                  )}
                </div>
                <BadgeCheck className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-blue-500 p-0.5 text-white shadow-md" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-base font-bold text-slate-900 sm:text-lg dark:text-white">{doctorName}</h2>
                <p className="mt-1 truncate text-xs font-medium text-slate-500 sm:text-sm">{specialization}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[26px] bg-gradient-to-br from-[#252a67] via-[#3b4a8f] to-[#14B8A6] p-[1.5px] shadow-[0_14px_38px_-18px_rgba(37,42,103,0.45)] mb-6">
            <div className="overflow-hidden rounded-[24px] bg-white dark:bg-slate-900">
              <div className="relative overflow-hidden border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-[#252a67]/[0.035] via-white to-[#14B8A6]/[0.05] dark:from-[#252a67]/20 dark:via-slate-900 dark:to-[#14B8A6]/10 px-5 py-5 sm:px-6">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#252a67] to-[#14B8A6] shadow-sm"><Stethoscope className="h-4 w-4 text-white" /></div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">Book Appointment</h1>
                </div>
                <p className="mt-2 pl-10 text-xs leading-relaxed text-slate-500 sm:text-sm">
                  Select a date, session, and enter patient details.
                </p>
              </div>

              <div className="space-y-5 p-5 sm:p-6">
                
                {/* DATE STRIP */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Appointment Date</label>
                  {isFetchingDates ? (
                    <div className="flex items-center gap-2 rounded-xl border border-dashed border-slate-200 p-3 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
                      <Loader2 className="h-4 w-4 animate-spin" /> Finding next available dates...
                    </div>
                  ) : availableDates.length === 0 ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-500 dark:border-red-900/50 dark:bg-red-900/20">
                      No upcoming availability found for this doctor at this clinic.
                    </div>
                  ) : (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {availableDates.map((entry) => {
                        const isSelected = date === entry.date;
                        const label = formatDateStripLabel(entry.date);
                        return (
                          <button
                            key={entry.date}
                            type="button"
                            onClick={() => setDate(entry.date)}
                            className={`flex shrink-0 flex-col items-center rounded-xl border-2 px-4 py-2.5 transition-all ${
                              isSelected
                                ? "border-[#252a67] bg-[#252a67]/5 dark:border-teal-500 dark:bg-teal-500/10"
                                : "border-slate-200 hover:border-[#252a67]/30 dark:border-slate-700 dark:hover:border-teal-500/40"
                            }`}
                          >
                            <span className={`text-[10px] font-bold uppercase tracking-wide ${isSelected ? "text-[#252a67] dark:text-teal-400" : "text-slate-400"}`}>
                              {label.top}
                            </span>
                            <span className={`mt-0.5 text-sm font-bold ${isSelected ? "text-[#252a67] dark:text-teal-400" : "text-slate-700 dark:text-slate-300"}`}>
                              {label.bottom}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* SESSION SELECTOR */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Select Session</label>
                  {!date ? (
                    <div className="p-3 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400 dark:border-slate-700">Please select a date first</div>
                  ) : isFetchingSchedules ? (
                    <div className="p-4 border rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-center text-[#14B8A6]"><Loader2 className="h-5 w-5 animate-spin" /></div>
                  ) : schedules.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2">
                      {schedules.map(s => {
                        const isFull = s.slotsLeft <= 0;
                        const isSelected = selectedScheduleId === s.id;
                        return (
                          <button
                            key={s.id}
                            disabled={isFull}
                            onClick={() => setSelectedScheduleId(s.id)}
                            className={`flex justify-between items-center p-3 rounded-xl border-2 text-left transition-all ${
                              isFull ? 'bg-slate-50 border-slate-100 opacity-60 dark:bg-slate-800 dark:border-slate-700' :
                              isSelected ? 'border-[#14B8A6] bg-[#14B8A6]/5' : 'border-slate-200 hover:border-[#14B8A6]/40 dark:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Clock className={`h-4 w-4 ${isSelected ? 'text-[#14B8A6]' : 'text-slate-400'}`} />
                              <p className={`font-bold text-sm ${isSelected ? 'text-[#14B8A6]' : 'text-slate-700 dark:text-slate-200'}`}>
                                {s.startTime} - {s.endTime}
                              </p>
                            </div>
                            <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${isFull ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'}`}>
                              {isFull ? 'Full' : `${s.slotsLeft} Slots Left`}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-3 border border-red-200 bg-red-50 text-red-600 rounded-xl text-sm font-bold text-center dark:bg-red-900/20 dark:border-red-900/50">
                      No active sessions for this doctor on selected date.
                    </div>
                  )}
                </div>

                {/* PHONE */}
                <div className="pt-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Patient Mobile Number</label>
                  <div className="relative">
                    <input id="patient-phone" type="tel" placeholder="Enter 10-digit mobile number" value={phone} onChange={handlePhoneChange} className={`w-full rounded-xl border px-4 py-3.5 text-sm outline-none transition-all dark:bg-slate-800 dark:text-white ${isExistingPatient ? "border-green-300 bg-green-50/60 focus:border-green-500" : "border-slate-200 hover:border-slate-300 focus:border-[#252a67] dark:border-slate-700"}`} />
                    {isCheckingPhone && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-[#252a67]" />}
                  </div>
                  {isExistingPatient && <p className="mt-1 text-xs font-bold text-green-600 flex items-center gap-1"><BadgeCheck className="h-3 w-3" /> Existing patient auto-filled (You can edit details below)</p>}
                </div>

                {/* NAME & AGE */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Patient Name</label>
                    <input type="text" placeholder="Enter patient name" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none hover:border-slate-300 focus:border-[#252a67] dark:text-white dark:bg-slate-800 dark:border-slate-700 transition-colors" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Age</label>
                    <input type="number" placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none hover:border-slate-300 focus:border-[#252a67] dark:text-white text-center dark:bg-slate-800 dark:border-slate-700 transition-colors" />
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="button"
                  onClick={() => addToQueueMutation.mutate()}
                  disabled={phone.length !== 10 || !name.trim() || !age || !selectedScheduleId || addToQueueMutation.isPending}
                  className="group relative mt-4 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#252a67] via-[#3b4a8f] to-[#14B8A6] py-3.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0 shadow-md"
                >
                  {addToQueueMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : "Confirm Booking"}
                </button>
              </div>
            </div>
          </div>

          {/* ============================================================
              🟢 NEW: PATIENT LIST TABLE & PDF DOWNLOAD SECTION
              ============================================================ */}
          {selectedScheduleId && (
            <div className="rounded-[24px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Session Patient List</h3>
                    <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-slate-500">
                      <span className="rounded bg-slate-200 px-1.5 py-0.5 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                        Total: {sessionAppointments.length}
                      </span>
                      <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                        Online: {onlineCount}
                      </span>
                      <span className="rounded bg-orange-100 px-1.5 py-0.5 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400">
                        Walk-in: {offlineCount}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={generatePDF}
                  disabled={sessionAppointments.length === 0}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#14B8A6] to-[#0F766E] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-teal-500/20 transition-all hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:hover:scale-100 w-full sm:w-auto"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Token</th>
                      <th className="px-4 py-3">Patient Name</th>
                      <th className="px-4 py-3">Phone</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {isLoadingAppointments ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          <Loader2 className="mx-auto h-5 w-5 animate-spin mb-2" />
                          Loading patients...
                        </td>
                      </tr>
                    ) : sessionAppointments.length > 0 ? (
                      sessionAppointments.map((appt: any) => (
                        <tr key={appt.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                          <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                            #{appt.token}
                          </td>
                          <td className="px-4 py-3 font-medium">
                            {appt.patient?.user?.name || appt.patient?.name || "-"}
                          </td>
                          <td className="px-4 py-3 text-xs">
                            {appt.patient?.user?.phone || appt.patient?.phone || "-"}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              appt.bookingSource === "ONLINE" 
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                                : "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400"
                            }`}>
                              {appt.bookingSource === "ONLINE" ? "Online" : "Walk-in"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs font-semibold">
                            {appt.status}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          <Users className="mx-auto h-6 w-6 mb-2 opacity-50" />
                          No patients booked for this session yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============================================================
  // DOCTOR SELECTION SCREEN RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-[#fafbfc] px-3 py-4 sm:p-6 lg:p-8 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-5 sm:mb-7">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">Select a Doctor</h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">Choose a doctor to book a patient appointment.</p>
        </div>

        <div className="relative mb-5 sm:mb-7">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 sm:left-4 sm:h-5 sm:w-5" />
          <input type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search doctor by name..." className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm shadow-sm outline-none focus:border-[#252a67] sm:rounded-2xl sm:py-3.5 sm:pl-12 dark:bg-slate-900 dark:border-slate-800 dark:text-white" />
        </div>

        {isLoadingDoctors ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center gap-3"><Loader2 className="h-8 w-8 animate-spin text-[#252a67]" /><p className="text-xs font-medium text-slate-400">Loading doctors...</p></div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
              {filteredDoctors.map((doctor: any) => {
                const avatarSrc = doctor?.user?.avatar || doctor?.profilePhoto || null;
                const doctorName = formatDoctorName(doctor?.user?.name || doctor?.name);
                const specialization = doctor?.specialization || "General";
                const experience = Number(doctor?.experience || 0);

                return (
                  <button key={doctor.id} type="button" onClick={() => setSelectedDoctor(doctor)} className="group min-w-0 text-left">
                    <div className="h-full rounded-2xl bg-gradient-to-br from-[#252a67] via-[#3b4a8f] to-[#14B8A6] p-[1.5px] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
                      <div className="flex h-full min-w-0 flex-col overflow-hidden rounded-[15px] bg-white dark:bg-slate-900">
                        <div className="relative h-[118px] w-full overflow-hidden bg-slate-100 dark:bg-slate-800 sm:h-[150px]">
                          {avatarSrc ? (
                            <img src={avatarSrc} alt={doctorName} loading="lazy" className="h-full w-full object-cover object-top" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#2563EB] to-[#0F766E] text-3xl font-bold text-white">{getInitials(doctorName)}</div>
                          )}
                          {experience > 0 && (
                            <div className="absolute left-1.5 top-1.5 flex items-center gap-0.5 rounded-full bg-[#252a67]/95 px-1.5 py-0.5 shadow-md backdrop-blur-sm sm:left-2.5 sm:top-2.5">
                              <Award className="h-2.5 w-2.5 text-amber-300" />
                              <span className="text-[8px] font-bold text-white sm:text-[10px]">{experience}+ yrs</span>
                            </div>
                          )}
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col p-2.5 sm:p-4">
                          <h3 className="truncate text-xs font-bold text-slate-900 sm:text-base dark:text-white">{doctorName}</h3>
                          <p className="mt-1 flex min-w-0 items-center gap-1 text-[9px] text-slate-500 sm:text-xs"><Stethoscope className="h-3 w-3 shrink-0 text-[#14B8A6]" /><span className="truncate">{specialization}</span></p>
                          <div className="mt-2.5 flex items-center justify-between rounded-lg bg-slate-50 px-2 py-1.5 transition-all group-hover:bg-[#252a67]/[0.06] dark:bg-slate-800 dark:group-hover:bg-slate-800/80 sm:mt-3 sm:px-3 sm:py-2">
                            <span className="truncate text-[8px] font-bold text-slate-600 transition-colors group-hover:text-[#252a67] dark:text-slate-400 dark:group-hover:text-blue-300 sm:text-[11px]">Select Doctor</span>
                            <ArrowRight className="h-3 w-3 shrink-0 text-slate-400 transition-all group-hover:translate-x-1 group-hover:text-[#252a67] dark:group-hover:text-blue-300 sm:h-3.5 sm:w-3.5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {filteredDoctors.length === 0 && (
              <div className="flex min-h-[280px] flex-col items-center justify-center px-4 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                  <Search className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No doctors found</p>
                <p className="mt-1 max-w-xs text-xs text-slate-400">No doctors match "{searchQuery}"</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}