"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Calendar, Star, Heart, Clock, BadgeCheck, Stethoscope, Award, Loader2, CalendarCheck, Building2, Radio, AlertTriangle } from "lucide-react";
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
    <div className={`relative rounded-[24px] p-[3px] bg-gradient-to-br from-[#2563EB] via-[#0F766E] to-[#14B8A6] shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(37,99,235,0.12)] ${className}`}>
      <div className="rounded-[calc(24px-2.5px)] bg-white dark:bg-slate-900 h-full">
        {children}
      </div>
    </div>
  );
}

function ExperienceBadge({ years }: { years: number }) {
  if (!years || years <= 0) return null;
  return (
    <div className="absolute bottom-1.5 left-1.5 z-10">
      <div className="flex items-center gap-1 rounded-full border border-white/80 bg-[#252a67]/95 px-2 py-0.5 shadow-sm backdrop-blur-sm">
        <Award className="h-2.5 w-2.5 text-amber-300" strokeWidth={2.5} />
        <span className="whitespace-nowrap text-[9px] font-bold tracking-wide text-white">
          {years}+ yrs
        </span>
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
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-5">
      {isLoading && (
        <div className="col-span-full flex flex-col items-center justify-center py-16">
          <div className="relative">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#2563EB] border-t-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Stethoscope className="h-4 w-4 text-[#2563EB]" />
            </div>
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-500">{t("loading") || "Finding the best doctors..."}</p>
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

  // ================= Clinic Selection State =================
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
      <div className="flex h-full flex-col p-4 relative overflow-hidden">
        <div className="pointer-events-none absolute -top-10 -right-10 h-20 w-20 rounded-full bg-gradient-to-br from-[#2563EB]/5 to-[#0F766E]/10 blur-2xl" />

        <div className="relative mx-auto w-full max-w-[150px] sm:max-w-[150px] aspect-[3/4] overflow-hidden rounded-xl border-2 border-[#252a67]">
          {avatarSrc ? (
            <img src={avatarSrc} alt={doctor.user.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#2563EB] to-[#6a7583] text-2xl font-bold text-white">
              {initials(doctor.user.name)}
            </div>
          )}
          <ExperienceBadge years={experienceYears} />
          <BadgeCheck className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-white text-[#2563EB] shadow-sm ring-1 ring-white dark:bg-slate-800 dark:ring-slate-700" />
          <button
            type="button"
            onClick={() => setIsFavorite(!isFavorite)}
            className="absolute right-1.5 top-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-slate-400 shadow-sm backdrop-blur-sm transition-all hover:scale-105 hover:text-red-500 active:scale-95"
          >
            <Heart className={`h-3.5 w-3.5 transition-colors ${isFavorite ? "fill-red-500 text-red-500" : "text-slate-400"}`} />
          </button>
        </div>

        <div className="relative mt-3 flex flex-col items-center text-center">
          <h3 className="truncate text-base font-bold tracking-tight">
            <span className="bg-gradient-to-r from-[#422995] to-[#4a9860] bg-clip-text text-transparent">
              {doctor.user.name}
            </span>
          </h3>

          {doctor.qualification && (
            <p className="mt-0.5 truncate text-xs font-medium text-slate-600 dark:text-slate-300">
              {doctor.qualification}
            </p>
          )}

          {doctor.specialization && (
            <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-500 dark:text-slate-400">
              <Stethoscope className="h-3 w-3 shrink-0 text-[#14B8A6]" />
              {doctor.specialization}
            </p>
          )}

          <div className="mt-1.5 flex items-center gap-1">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className={`h-3 w-3 ${star <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}`} />
              ))}
            </div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{rating}</span>
            <span className="text-[10px] text-slate-400">· {reviews}</span>
          </div>
        </div>

        <div className="my-3 h-px w-full bg-slate-100 dark:bg-slate-800" />

        <div className="relative w-full">
           <DoctorClinicInfo doctor={doctor} />
        </div>

        <div className="relative mt-3 flex flex-col items-center gap-1 text-xs font-medium">
          {isLive && (
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
              <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                <Radio className="h-3 w-3" />
                {t("liveNow") || "Live Now"}
              </span>
              {liveStatus?.capacity && (
                <span className="text-[10px] text-slate-400">
                  · {liveStatus.capacity.booked}/{liveStatus.capacity.max}
                </span>
              )}
            </div>
          )}

          {liveStatus?.operationalStatus === "RUNNING_LATE" && (
            <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-3 w-3" />
              <span className="text-[11px]">
                {t("runningLate") || "Running late"}
                {liveStatus.delayMinutes ? ` · ~${liveStatus.delayMinutes} min` : ""}
              </span>
            </div>
          )}

          {isAvailable ? (
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-emerald-600 dark:text-emerald-400">{t("availableNow") || "Available Now"}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex h-2 w-2 rounded-full bg-slate-400" />
              </span>
              <span className="text-slate-500 dark:text-slate-400">{t("currentlyUnavailable") || "Currently Unavailable"}</span>
            </div>
          )}
        </div>

        <div className="relative mt-4 grid grid-cols-2 gap-2">
          <Link
            href={`/doctors/${doctor.id}`}
            className="flex items-center justify-center rounded-lg border border-slate-200 bg-white px-2 py-2 text-[11px] font-semibold text-slate-600 transition-all hover:border-slate-300 hover:text-slate-800 active:scale-[0.98] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-slate-100"
          >
            {t("viewProfile") || "View Profile"}
          </Link>
          <button
            type="button"
            onClick={handleBookClick}
            className="flex items-center justify-center rounded-lg bg-gradient-to-r from-[#252a67] to-[#14B8A6] px-2 py-2 text-[11px] font-semibold text-white shadow-sm shadow-[#14B8A6]/20 transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
          >
            {showBooking ? t("cancel") || "Cancel" : t("bookButton")}
          </button>
        </div>

        {/* ================= BOOKING MODAL ================= */}
        {showBooking && user && (
          <div className="relative mt-3 animate-in slide-in-from-top-2 fade-in duration-300">
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-700 dark:bg-slate-800/40">
              <div className="mb-2">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{t("bookAppointment") || "Book an appointment"}</p>
                <p className="mt-0.5 text-[10px] text-slate-500">{t("selectDatePrompt") || "Select your preferred date and time."}</p>
              </div>

              <div className="space-y-2">
                {/* Clinic Selector Dropdown */}
                {doctor.allClinics && doctor.allClinics.length > 0 && (
                  <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 transition-all focus-within:border-[#252a67] focus-within:ring-2 focus-within:ring-[#252a67]/20 dark:border-slate-700 dark:bg-slate-900">
                    <Building2 className="h-3.5 w-3.5 shrink-0 text-[#252a67]" />
                    <select
                      value={selectedClinicId}
                      onChange={(e) => setSelectedClinicId(e.target.value)}
                      className="w-full bg-transparent text-xs font-medium text-slate-700 outline-none dark:text-slate-200 cursor-pointer appearance-none"
                    >
                      {doctor.allClinics.map((c) => (
                        <option key={c.id} value={c.id} className="text-slate-800 dark:text-slate-200">
                          {c.clinicName} {c.city ? `(${c.city})` : ""} - ₹{c.associationDetails?.fee || doctor.fee}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 transition-all focus-within:border-[#252a67] focus-within:ring-2 focus-within:ring-[#252a67]/20 dark:border-slate-700 dark:bg-slate-900">
                  <Clock className="h-3.5 w-3.5 shrink-0 text-[#252a67]" />
                  {schedulesLoading ? (
                    <span className="text-xs text-slate-400">{t("loadingSessions") || "Loading sessions..."}</span>
                  ) : bookableSchedules.length === 0 ? (
                    <span className="text-xs text-slate-400">{t("noSessionsAvailable") || "No online sessions available"}</span>
                  ) : (
                    <select
                      value={scheduleId}
                      onChange={(e) => { setScheduleId(e.target.value); setMessage(null); }}
                      className="w-full cursor-pointer appearance-none bg-transparent text-xs font-medium text-slate-700 outline-none dark:text-slate-200"
                    >
                      <option value="">{t("selectSession") || "Select a session"}</option>
                      {bookableSchedules.map((s) => (
                        <option key={s.id} value={s.id} className="text-slate-800 dark:text-slate-200">
                          {scheduleLabel(s.startTime, s.endTime)} (max {s.maxPatients})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 transition-all focus-within:border-[#252a67] focus-within:ring-2 focus-within:ring-[#252a67]/20 dark:border-slate-700 dark:bg-slate-900">
                  <Calendar className="h-3.5 w-3.5 shrink-0 text-[#252a67]" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => { setDate(e.target.value); setMessage(null); }}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full bg-transparent text-xs font-medium text-slate-700 outline-none dark:text-slate-200"
                  />
                </div>
                <p className="px-0.5 text-[10px] text-slate-400">
                  {t("dateMustMatchSession") || "Pick a date this session actually runs on — you'll get a clear error otherwise."}
                </p>
              </div>

              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={!date || !scheduleId || bookMutation.isPending}
                className="mt-3 flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-[#0F766E] to-[#14B8A6] px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-teal-500/20 transition-all hover:shadow-md hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-md"
              >
                {bookMutation.isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span className="ml-1.5">{t("bookingLoading")}</span>
                  </>
                ) : (
                  t("confirmBooking") || "Confirm Booking"
                )}
              </button>

              {message && (
                <div
                  className={`mt-2 flex items-start gap-1.5 rounded-lg border p-2 text-[11px] font-medium ${
                    message.type === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
                      : "border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
                  }`}
                >
                  {message.type === "success" ? (
                    <CalendarCheck className="h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                  )}
                  <span>{message.text}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </GradientBorderCard>
  );
}