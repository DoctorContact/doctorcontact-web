"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Calendar, Star, Heart, Clock, BadgeCheck, Stethoscope, Loader2, CalendarCheck, Building2, Radio, AlertTriangle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useRouter, Link } from "@/i18n/routing";
import { useDoctorSearch, useDoctorSchedules, useBookAppointment } from "@/lib/hooks/useDoctorSearch";
import { ExtendedDoctor } from "@/types/doctor";
import DoctorClinicInfo from "@/components/DoctorClinicInfo";

function scheduleLabel(startTime: string, endTime: string) {
  return `${startTime} – ${endTime}`;
}

function initials(name: string) {
  return name.split(" ").filter(Boolean).map((part) => part[0]).slice(0, 2).join("").toUpperCase();
}

function GradientBorderCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-2xl p-[2px] bg-gradient-to-br from-[#2563EB] via-[#0F766E] to-[#14B8A6] shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${className}`}>
      <div className="rounded-[calc(1rem-2px)] bg-white dark:bg-slate-900 h-full flex flex-col">
        {children}
      </div>
    </div>
  );
}

export default function DoctorGrid({
  query,
  city,
  liveNow,
  availableToday,
}: {
  query: string;
  city?: string;
  liveNow?: boolean;
  availableToday?: boolean;
}) {
  const t = useTranslations("DoctorSearch");
  const { data, isLoading } = useDoctorSearch(query, city, { liveNow, availableToday });
  const doctors = (data as ExtendedDoctor[]) ?? [];

  return (
    // 🟢 গ্রিড কলাম বাড়ানো হয়েছে যাতে কার্ডগুলো ছোট এবং সুন্দর দেখায়
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {isLoading && (
        <div className="col-span-full flex flex-col items-center justify-center py-16">
          <div className="relative">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#2563EB] border-t-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Stethoscope className="h-4 w-4 text-[#2563EB]" />
            </div>
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-500">{t("loading") || "Finding doctors..."}</p>
        </div>
      )}

      {!isLoading && doctors?.length === 0 && (
        <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
            <Clock className="h-6 w-6" />
          </div>
          <p className="mt-3 text-base font-bold text-slate-800">{t("noResults")}</p>
          <p className="mt-1 text-sm text-slate-500">{t("adjustFilters") || "Try adjusting your search or filters"}</p>
        </div>
      )}

      {doctors?.map((doctor) => (
        <DoctorCard key={doctor.id} doctor={doctor} />
      ))}
    </div>
  );
}

function DoctorCard({ doctor }: { doctor: ExtendedDoctor }) {
  const t = useTranslations("DoctorSearch");
  const { user } = useAuth();
  const router = useRouter();

  const [showBooking, setShowBooking] = useState(false);
  const [date, setDate] = useState("");
  const [scheduleId, setScheduleId] = useState("");

  const defaultClinicId = doctor.allClinics?.[0]?.id || (doctor as any).clinicId;
  const [selectedClinicId, setSelectedClinicId] = useState(defaultClinicId);

  const [isFavorite, setIsFavorite] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const bookMutation = useBookAppointment();
  const { data: schedules, isLoading: schedulesLoading } = useDoctorSchedules(
    showBooking ? doctor.id : undefined,
    showBooking ? selectedClinicId : undefined
  );
  const bookableSchedules = (schedules ?? []).filter((s) => s.isActive && s.onlineBookingEnabled !== false);

  function handleBookClick() {
    if (!user) {
      router.push("/login?redirect=/doctors");
      return;
    }
    setMessage(null);
    setShowBooking((v) => !v);
    if (!showBooking) {
      setDate("");
      setScheduleId("");
    }
  }

  function handleConfirmBooking() {
    if (!date || !scheduleId) {
      setMessage({ type: "error", text: t("pleaseSelectSchedule") || "Please select a session and date" });
      return;
    }

    bookMutation.mutate(
      { doctorId: doctor.id, clinicId: selectedClinicId, scheduleId, date },
      {
        onSuccess: (appointment) => {
          setMessage({ type: "success", text: `${t("bookSuccess")} #${appointment.token}` });
          setDate("");
          setScheduleId("");
          setTimeout(() => {
            setShowBooking(false);
            setMessage(null);
          }, 5000);
        },
        onError: (error: any) =>
          setMessage({ type: "error", text: error?.response?.data?.message || error.message || t("bookError") }),
      }
    );
  }

  const experienceYears = doctor.experience ?? 0;
  const rating = doctor.rating ?? 4.5;
  const reviews = doctor.reviewCount ?? 120;
  const liveStatus = doctor.liveStatus;
  
  const isLive = liveStatus?.isLive ?? false;
  const isAvailable = liveStatus ? liveStatus.isAvailable : doctor.isAvailable;
  
  const avatarSrc = (doctor as any).profilePhoto || doctor.user?.avatar;

  return (
    <GradientBorderCard className="h-full">
      <div className="flex flex-col p-3 relative h-full">
        {/* Favorite Button */}
        <button
          type="button"
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 text-slate-400 shadow-sm transition-all hover:scale-105 hover:text-red-500 active:scale-95 dark:bg-slate-800"
        >
          <Heart className={`h-3.5 w-3.5 transition-colors ${isFavorite ? "fill-red-500 text-red-500" : "text-slate-400"}`} />
        </button>

        {/* 🟢 COMPACT CIRCULAR AVATAR */}
        <div className="relative mx-auto mt-2 h-16 w-16 shrink-0">
          <div className="h-full w-full overflow-hidden rounded-full border-2 border-slate-100 shadow-sm dark:border-slate-700 bg-slate-50">
            {avatarSrc ? (
              <img src={avatarSrc} alt={doctor.user.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#2563EB] to-[#6a7583] text-lg font-bold text-white">
                {initials(doctor.user.name)}
              </div>
            )}
          </div>
          <BadgeCheck className="absolute bottom-0 right-0 h-5 w-5 rounded-full bg-white text-[#2563EB] shadow-sm ring-1 ring-white dark:bg-slate-800 dark:ring-slate-700" />
        </div>

        {/* 🟢 DOCTOR INFO */}
        <div className="mt-3 flex flex-col items-center text-center">
          <h3 className="truncate w-full text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100 px-2">
            {doctor.user.name}
          </h3>

          <p className="mt-0.5 w-full truncate text-[11px] font-medium text-slate-500 dark:text-slate-400 px-2">
            {doctor.specialization || "General Physician"} 
            {experienceYears > 0 && <span className="ml-1 text-slate-400">• {experienceYears}y exp</span>}
          </p>

          <div className="mt-1.5 flex items-center gap-1">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">{rating}</span>
            <span className="text-[10px] text-slate-400">({reviews})</span>
          </div>
        </div>

        <div className="my-3 h-px w-full bg-slate-100 dark:bg-slate-800" />

        {/* 🟢 COMPACT CLINIC INFO */}
        <div className="relative w-full">
           <DoctorClinicInfo doctor={doctor} />
        </div>

        {/* 🟢 STATUS & BUTTONS */}
        <div className="mt-auto pt-3">
          <div className="flex items-center justify-center gap-1 text-[11px] font-medium mb-3 h-4">
            {isLive ? (
              <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
                </span>
                <Radio className="h-3 w-3" />
                {t("liveNow") || "Live"}
                {liveStatus?.capacity && <span className="text-[10px] text-slate-400 ml-1">({liveStatus.capacity.booked}/{liveStatus.capacity.max})</span>}
              </div>
            ) : isAvailable ? (
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                {t("availableNow") || "Available"}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-slate-500">
                <span className="relative flex h-1.5 w-1.5 rounded-full bg-slate-400" />
                {t("currentlyUnavailable") || "Unavailable"}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href={`/doctors/${doctor.id}`}
              className="flex items-center justify-center rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-semibold text-slate-600 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Profile
            </Link>
            <button
              type="button"
              onClick={handleBookClick}
              className="flex items-center justify-center rounded-lg bg-gradient-to-r from-[#252a67] to-[#14B8A6] px-2 py-1.5 text-[11px] font-semibold text-white transition-all hover:opacity-90 active:scale-95"
            >
              {showBooking ? "Cancel" : "Book"}
            </button>
          </div>
        </div>

        {/* 🟢 COMPACT BOOKING MODAL */}
        {showBooking && user && (
          <div className="relative mt-2 animate-in slide-in-from-top-1 fade-in duration-200">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800/60">
              <div className="space-y-2">
                {doctor.allClinics && doctor.allClinics.length > 0 && (
                  <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2 py-1.5 dark:border-slate-600 dark:bg-slate-900">
                    <Building2 className="h-3 w-3 shrink-0 text-slate-400" />
                    <select
                      value={selectedClinicId}
                      onChange={(e) => setSelectedClinicId(e.target.value)}
                      className="w-full bg-transparent text-[10px] font-medium text-slate-700 outline-none dark:text-slate-200 cursor-pointer"
                    >
                      {doctor.allClinics.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.clinicName} - ₹{c.associationDetails?.fee || doctor.fee}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2 py-1.5 dark:border-slate-600 dark:bg-slate-900">
                  <Clock className="h-3 w-3 shrink-0 text-slate-400" />
                  {schedulesLoading ? (
                    <span className="text-[10px] text-slate-400">Loading...</span>
                  ) : bookableSchedules.length === 0 ? (
                    <span className="text-[10px] text-slate-400">No sessions</span>
                  ) : (
                    <select
                      value={scheduleId}
                      onChange={(e) => { setScheduleId(e.target.value); setMessage(null); }}
                      className="w-full bg-transparent text-[10px] font-medium text-slate-700 outline-none dark:text-slate-200 cursor-pointer"
                    >
                      <option value="">Select session</option>
                      {bookableSchedules.map((s) => (
                        <option key={s.id} value={s.id}>
                          {scheduleLabel(s.startTime, s.endTime)}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2 py-1.5 dark:border-slate-600 dark:bg-slate-900">
                  <Calendar className="h-3 w-3 shrink-0 text-slate-400" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => { setDate(e.target.value); setMessage(null); }}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full bg-transparent text-[10px] font-medium text-slate-700 outline-none dark:text-slate-200"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={!date || !scheduleId || bookMutation.isPending}
                className="mt-2 flex w-full items-center justify-center rounded-md bg-[#14B8A6] px-2 py-1.5 text-[11px] font-bold text-white transition-all hover:bg-[#0f9688] disabled:opacity-50"
              >
                {bookMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Confirm"}
              </button>

              {message && (
                <div className={`mt-1.5 p-1.5 rounded text-[10px] font-medium ${message.type === "success" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
                  {message.text}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </GradientBorderCard>
  );
}