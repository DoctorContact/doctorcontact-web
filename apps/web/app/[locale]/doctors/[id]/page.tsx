"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "@/i18n/routing";
import { ExtendedDoctor } from "@/types/doctor";
import { useBookAppointment } from "@/lib/hooks/useDoctorSearch";
import { api } from "@/lib/api";
import {
  MapPin,
  Building2,
  Calendar,
  Clock,
  X,
  PhoneCall,
  Loader2,
  Mail,
  Sparkles,
  BadgeCheck,
  Stethoscope,
  IndianRupee,
} from "lucide-react";

// ============================================================
// WHATSAPP ICON (Official SVG)
// ============================================================
function WhatsAppIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.305-.885-.653-1.482-1.46-1.656-1.758-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
    </svg>
  );
}

export default function DoctorProfilePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const doctorId = params.id as string;

  const [doctor, setDoctor] = useState<ExtendedDoctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal & Booking States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<any>(null);
  const [date, setDate] = useState("");
  const [schedules, setSchedules] = useState<any[]>([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState("");
  const [isFetchingSchedules, setIsFetchingSchedules] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Date-strip state — replaces the old full month calendar. Only real,
  // actually-bookable dates (from the backend's availability engine) are
  // ever shown here, so there's no way to land on an empty day.
  type AvailableDateEntry = { date: string; sessions: any[] };
  const [availableDates, setAvailableDates] = useState<AvailableDateEntry[]>([]);
  const [isFetchingDates, setIsFetchingDates] = useState(false);

  const bookMutation = useBookAppointment();

  useEffect(() => {
    async function fetchDoctor() {
      try {
        const res = await api.get(`/doctors/${doctorId}`);
        if (res.data?.success) setDoctor(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    if (doctorId) fetchDoctor();
  }, [doctorId]);

  // Completes the Clinic -> Doctor -> Appointment flow: if the patient
  // arrived here from a specific clinic's page (?clinicId=...), jump
  // straight into that clinic's booking flow instead of making them find
  // and re-click the same clinic again from the chamber list below. Reuses
  // the exact same date-strip / availability fetch as opening the modal
  // manually — no separate code path, so it can't drift out of sync.
  useEffect(() => {
    if (!doctor) return;
    const requestedClinicId = searchParams.get("clinicId");
    if (!requestedClinicId) return;
    const match = (doctor as any).allClinics?.find((c: any) => c.id === requestedClinicId);
    if (match) openBookingModal(match);
  }, [doctor, searchParams]);

  // Step 1: once a clinic is chosen, fetch the doctor's next real available
  // dates AT THAT EXACT CLINIC — never a shared/merged list across clinics.
  useEffect(() => {
    async function fetchAvailableDates() {
      if (!selectedClinic) return;
      setIsFetchingDates(true);
      setAvailableDates([]);
      setDate("");
      setSchedules([]);
      setSelectedScheduleId("");
      try {
        const res = await api.get(`/doctors/${doctorId}/clinics/${selectedClinic.id}/schedules/available-dates?limit=10`);
        if (res.data?.success) {
          const dates: AvailableDateEntry[] = res.data.data.dates || [];
          setAvailableDates(dates);
          // Auto-select the very next available date so the patient sees
          // sessions immediately instead of an empty "pick a date" state.
          if (dates.length > 0) setDate(dates[0].date);
        }
      } catch (err) {
        setAvailableDates([]);
      } finally {
        setIsFetchingDates(false);
      }
    }
    fetchAvailableDates();
  }, [selectedClinic, doctorId]);

  // Step 2: once a specific date is picked from the strip, fetch that
  // date's sessions (still the backend's live capacity — the frontend
  // never assumes a slot is open just because it appeared in the date list).
  useEffect(() => {
    async function fetchClinicSchedules() {
      if (!selectedClinic || !date) return;
      setIsFetchingSchedules(true);
      setSelectedScheduleId("");
      try {
        const res = await api.get(`/doctors/${doctorId}/clinics/${selectedClinic.id}/schedules?date=${date}`);
        if (res.data?.success) {
          setSchedules(res.data.data.schedules || []);
        }
      } catch (err) {
        setSchedules([]);
      } finally {
        setIsFetchingSchedules(false);
      }
    }
    fetchClinicSchedules();
  }, [selectedClinic, date, doctorId]);

  const openBookingModal = (clinic: any) => {
    setSelectedClinic(clinic);
    setDate("");
    setSchedules([]);
    setSelectedScheduleId("");
    setMessage(null);
    setIsModalOpen(true);
    setAvailableDates([]);
  };

  // Formats a "YYYY-MM-DD" into the "Today" / "13 Sep" label the date-strip
  // shows, entirely from the string (no timezone re-derivation needed since
  // the backend already resolved it against IST).
  const formatDateStripLabel = (dateStr: string) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    const todayStr = new Date();
    const isToday =
      dt.getFullYear() === todayStr.getFullYear() &&
      dt.getMonth() === todayStr.getMonth() &&
      dt.getDate() === todayStr.getDate();
    if (isToday) return { top: "Today", bottom: dt.toLocaleDateString("en-US", { day: "numeric", month: "short" }) };
    return {
      top: dt.toLocaleDateString("en-US", { weekday: "short" }),
      bottom: dt.toLocaleDateString("en-US", { day: "numeric", month: "short" }),
    };
  };

  const handleConfirmBooking = () => {
    if (!user) {
      router.push(`/login?redirect=/doctors/${doctorId}`);
      return;
    }
    if (!date || !selectedScheduleId) {
      setMessage({ type: "error", text: "Please select a date and time slot." });
      return;
    }

    bookMutation.mutate(
      {
        doctorId: doctor!.id,
        clinicId: selectedClinic.id,
        date: date,
        scheduleId: selectedScheduleId,
      },
      {
        onSuccess: (appointment) => {
          setMessage({ type: "success", text: `Booking confirmed! Token #${appointment.token || appointment.id}` });
          setSchedules(prev => prev.map(s => s.id === selectedScheduleId ? { ...s, slotsLeft: s.slotsLeft - 1, currentBookings: s.currentBookings + 1 } : s));
          setTimeout(() => setIsModalOpen(false), 3000);
        },
        onError: (err: any) => {
  const errorMessage =
    err?.response?.data?.message ||
    err?.message ||
    "Failed to book appointment";

  setMessage({
    type: "error",
    text: errorMessage,
  });
},
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-[#252a67] dark:text-teal-400" />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center px-4 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-500/10">
          <Stethoscope className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Doctor Not Found</h2>
        <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
          This profile may have been removed or the link is incorrect.
        </p>
      </div>
    );
  }

  const avatarSrc = (doctor as any).profilePhoto || doctor.user?.avatar || "https://via.placeholder.com/150";

  const generatedBio = `Dr. ${doctor.user?.name} is a verified medical professional with ${doctor.experience || 0}+ years of experience, specializing in ${doctor.specialization || "general medicine"}. They are highly rated with an average consultation time of ${doctor.avgConsultationMinutes || 15} minutes.`;

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* ================= Left Sidebar ================= */}
        <div className="flex flex-col gap-5 lg:col-span-4">
          {/* Identity card */}
          <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.05)] dark:border-slate-800 dark:bg-slate-900">
            <div className="relative h-16 w-full bg-gradient-to-r from-slate-50 via-blue-50 to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.35]"
                style={{
                  backgroundImage: "radial-gradient(circle, rgba(59,74,143,0.15) 1px, transparent 1px)",
                  backgroundSize: "14px 14px",
                }}
              />
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#3B4A8F]/20 to-transparent" />
            </div>

            <div className="flex flex-col items-center px-6 pb-6 text-center">
              <div className="relative -mt-12 h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-slate-100 shadow-[0_6px_20px_rgba(15,23,42,0.12)] dark:border-slate-900 dark:bg-slate-800">
                <img src={avatarSrc} alt={doctor.user?.name} className="h-full w-full object-cover" />
              </div>

              <h1 className="mt-3 flex items-center gap-1.5 text-xl font-extrabold tracking-tight text-[#0F1B33] dark:text-white">
                {doctor.user?.name}
                <BadgeCheck className="h-4 w-4 shrink-0 text-[#2563EB]" />
              </h1>
              <p className="mt-0.5 text-[13px] font-semibold text-slate-500 dark:text-slate-400">
                {doctor.qualification || "MBBS"}
              </p>

              <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-[#14B8A6]/10 px-2.5 py-1 text-[11px] font-bold text-[#0F766E] dark:bg-teal-500/10 dark:text-teal-400">
                <Stethoscope className="h-3 w-3" />
                {doctor.specialization || "General Physician"}
              </div>
            </div>
          </div>

          {/* Contact card */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_12px_rgba(15,23,42,0.05)] dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#14B8A6]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#3B4A8F] dark:text-teal-400">
                Contact &amp; Location
              </span>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
                  <PhoneCall className="h-4 w-4 text-[#2563EB] dark:text-blue-400" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Doctor's Contact</p>
                  <p className="mt-0.5 text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                    {doctor.user?.phone || "Not Provided"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#14B8A6]/10 dark:bg-teal-500/10">
                  <Mail className="h-4 w-4 text-[#0F766E] dark:text-teal-400" />
                </span>
                <div className="min-w-0 overflow-hidden">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Email Address</p>
                  <p className="mt-0.5 truncate text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                    {doctor.user?.email || "Not Provided"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#252a67]/8 dark:bg-blue-500/10">
                  <Building2 className="h-4 w-4 text-[#252a67] dark:text-blue-400" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Primary City</p>
                  <p className="mt-0.5 text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                    {doctor.clinic?.city || "Not Specified"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= Right Content ================= */}
        <div className="flex flex-col gap-5 lg:col-span-8">
          {/* Overview card */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_12px_rgba(15,23,42,0.05)] dark:border-slate-800 dark:bg-slate-900 sm:p-7">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {doctor.experience || 0}+ Years Experience
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#14B8A6]/10 px-3 py-1.5 text-[11px] font-bold text-[#0F766E] dark:bg-teal-500/10 dark:text-teal-400">
                <Clock className="h-3 w-3" />
                Avg. {doctor.avgConsultationMinutes || 15} Min Consultation
              </span>
            </div>

            <div className="mb-5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">About</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{generatedBio}</p>
            </div>

            <div className="flex items-start gap-2 rounded-2xl border border-blue-100 bg-blue-50/70 p-3.5 text-xs text-[#1D4ED8] dark:border-blue-900/40 dark:bg-blue-500/10 dark:text-blue-300">
              <BadgeCheck className="h-4 w-4 shrink-0" />
              <p>This is a verified doctor on the platform. Please check available timings before booking.</p>
            </div>
          </div>

          {/* Chamber Information card */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_12px_rgba(15,23,42,0.05)] dark:border-slate-800 dark:bg-slate-900 sm:p-7">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="mb-1 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-[#14B8A6]" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#3B4A8F] dark:text-teal-400">
                    Practice Locations
                  </span>
                </div>
                <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white sm:text-xl">
                  Chamber Information
                </h2>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {doctor.allClinics?.length || 0} Chambers
              </span>
            </div>

            <div className="space-y-4">
              {doctor.allClinics?.map((clinic) => (
                <div
                  key={clinic.id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-slate-700 sm:flex-row"
                >
                  <div className="h-32 w-full shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 sm:w-32">
                    {clinic.logo ? (
                      <img src={clinic.logo} alt={clinic.clinicName} className="h-full w-full object-contain p-2" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#252a67] via-[#3B4A8F] to-[#14B8A6]">
                        <Building2 className="h-8 w-8 text-white/80" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col justify-center">
                    <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">{clinic.clinicName}</h3>
                    <p className="mt-1.5 flex items-start gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#16A34A]" />
                      {clinic.address ? `${clinic.address}, ` : ""}{clinic.city ? clinic.city : "Address not provided"}
                    </p>
                    <p className="mt-3 inline-flex w-fit items-center gap-1 rounded-full bg-[#14B8A6]/10 px-2.5 py-1 text-[12px] font-bold text-[#0F766E] dark:bg-teal-500/10 dark:text-teal-400">
                      <IndianRupee className="h-3 w-3" />
                      {clinic.associationDetails?.fee || doctor.fee} Consultation Fee
                    </p>
                  </div>

                  <div className="flex w-full shrink-0 flex-col justify-center gap-2 sm:w-48">
                    <button
                      onClick={() => openBookingModal(clinic)}
                      className="flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#252a67] to-[#3B4A8F] text-xs font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <Calendar className="h-4 w-4" /> Book Appointment
                    </button>

                    <div className="grid w-full grid-cols-3 gap-2">
                      {clinic.phone ? (
                        <a href={`tel:${clinic.phone}`} className="flex items-center justify-center rounded-lg border border-blue-100 bg-blue-50 py-2 text-blue-600 transition-colors hover:bg-blue-100 dark:border-blue-900/40 dark:bg-blue-500/10 dark:text-blue-400" title="Call Clinic">
                          <PhoneCall className="h-4 w-4" />
                        </a>
                      ) : (
                        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 opacity-40 dark:border-slate-700 dark:bg-slate-800" />
                      )}

                      {clinic.whatsapp ? (
                        <a href={`https://wa.me/${clinic.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center rounded-lg border border-emerald-100 bg-[#25D366]/10 py-2 text-[#25D366] transition-colors hover:bg-[#25D366]/20 dark:border-emerald-900/40" title="WhatsApp">
                          <WhatsAppIcon className="h-4 w-4" />
                        </a>
                      ) : (
                        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 opacity-40 dark:border-slate-700 dark:bg-slate-800" />
                      )}

                      {(clinic as any).googleMapsUrl ? (
                        <a href={(clinic as any).googleMapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center rounded-lg border border-red-100 bg-red-50 py-2 text-red-600 transition-colors hover:bg-red-100 dark:border-red-900/40 dark:bg-red-500/10 dark:text-red-400" title="Google Maps">
                          <MapPin className="h-4 w-4" />
                        </a>
                      ) : (
                        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 opacity-40 dark:border-slate-700 dark:bg-slate-800" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ================= Booking Modal ================= */}
      {isModalOpen && selectedClinic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200 dark:bg-slate-900">
            <div className="flex items-start justify-between bg-gradient-to-r from-[#252a67] to-[#3B4A8F] p-5 text-white">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-white/15 p-2"><Calendar className="h-6 w-6" /></div>
                <div>
                  <h3 className="font-bold text-lg">Book Appointment</h3>
                  <p className="text-xs text-blue-100">at {selectedClinic.clinicName}</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-white/70 hover:text-white"><X className="h-5 w-5" /></button>
            </div>

            <div className="p-6">
              {/* Date strip — only real, actually-bookable dates ever appear here */}
              <div className="mb-6">
                <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Step 1: Choose Date</p>
                {isFetchingDates ? (
                  <p className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin" /> Finding next available dates...
                  </p>
                ) : availableDates.length === 0 ? (
                  <p className="rounded-lg border border-red-100 bg-red-50 p-3 text-xs font-bold text-red-500 dark:border-red-900/40 dark:bg-red-500/10">
                    No upcoming availability found for this doctor at this clinic.
                  </p>
                ) : (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {availableDates.map((entry) => {
                      const isSelected = date === entry.date;
                      const label = formatDateStripLabel(entry.date);
                      return (
                        <button
                          key={entry.date}
                          onClick={() => { setDate(entry.date); setMessage(null); }}
                          className={`flex shrink-0 flex-col items-center rounded-xl border-2 px-4 py-2.5 transition-all ${
                            isSelected
                              ? 'border-[#252a67] bg-[#252a67]/5 dark:border-teal-500 dark:bg-teal-500/10'
                              : 'border-slate-100 hover:border-[#252a67]/30 dark:border-slate-800 dark:hover:border-teal-500/40'
                          }`}
                        >
                          <span className={`text-[10px] font-bold uppercase tracking-wide ${isSelected ? 'text-[#252a67] dark:text-teal-400' : 'text-slate-400'}`}>
                            {label.top}
                          </span>
                          <span className={`mt-0.5 text-sm font-bold ${isSelected ? 'text-[#252a67] dark:text-teal-400' : 'text-slate-700 dark:text-slate-300'}`}>
                            {label.bottom}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Time Slots Section */}
              <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Step 2: Choose Timing</p>
              {!date ? (
                <p className="mb-4 text-xs italic text-slate-400">Please select a date first.</p>
              ) : isFetchingSchedules ? (
                <p className="mb-4 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400"><Loader2 className="h-4 w-4 animate-spin"/> Checking slots...</p>
              ) : schedules.length > 0 ? (
                <div className="mb-4 space-y-3">
                  {schedules.map((s) => {
                    const isFull = s.slotsLeft <= 0;
                    const isSelected = selectedScheduleId === s.id;
                    return (
                      <button
                        key={s.id}
                        disabled={isFull}
                        onClick={() => { setSelectedScheduleId(s.id); setMessage(null); }}
                        className={`flex w-full items-center justify-between rounded-xl border-2 p-4 text-left transition-all ${
                          isFull ? 'cursor-not-allowed border-slate-100 bg-slate-50 opacity-60 dark:border-slate-800 dark:bg-slate-800/50' :
                          isSelected ? 'border-[#252a67] bg-[#252a67]/5 dark:border-teal-500 dark:bg-teal-500/10' : 'border-slate-100 hover:border-[#252a67]/30 dark:border-slate-800 dark:hover:border-teal-500/40'
                        }`}
                      >
                        <div>
                          <p className={`font-bold ${isSelected ? 'text-[#252a67] dark:text-teal-400' : 'text-slate-800 dark:text-slate-200'}`}>
                            {s.startTime < "12:00" ? "Morning Session" : s.startTime < "17:00" ? "Afternoon Session" : "Evening Session"}
                          </p>
                          <p className="mt-1 flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                            <Clock className="h-3 w-3" /> {s.startTime} - {s.endTime}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-[10px] font-bold uppercase tracking-wide ${isFull ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            {isFull ? 'Full' : 'Available'}
                          </p>
                          <p className="mt-0.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                            {s.slotsLeft} Slots Left
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="mb-4 rounded-lg border border-red-100 bg-red-50 p-3 text-xs font-bold text-red-500 dark:border-red-900/40 dark:bg-red-500/10">No sessions available on this date.</p>
              )}

              {message && (
                <div className={`mb-4 rounded-lg border p-3 text-xs font-bold ${message.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-500/10 dark:text-emerald-400' : 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-500/10 dark:text-red-400'}`}>
                  {message.text}
                </div>
              )}

              <button
                onClick={handleConfirmBooking}
                disabled={bookMutation.isPending || !date || !selectedScheduleId}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#252a67] to-[#3B4A8F] py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              >
                {bookMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Booking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}