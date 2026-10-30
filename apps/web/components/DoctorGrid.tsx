"use client";

import React, { useMemo, useState } from "react";
import {
  Calendar,
  Star,
  Heart,
  BadgeCheck,
  Stethoscope,
  Radio,
  MapPin,
  Sparkles,
} from "lucide-react";

import { useLocale, useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth-context";
import { useRouter, Link } from "@/i18n/routing";
import { useDoctorSearch } from "@/lib/hooks/useDoctorSearch";
import { ExtendedDoctor } from "@/types/doctor";

/* ---------- Helpers ---------- */

function initials(name?: string) {
  if (!name) return "DR";

  return name
    .replace(/^dr\.?\s*/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// "Dr. Biswajit De | ডাঃ বিশ্বজিৎ দে |" -> shudhu ekta name
function cleanDoctorName(raw: string | undefined, locale: string) {
  if (!raw) return "Doctor";

  const parts = raw
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) return "Doctor";

  const bengali = /[\u0980-\u09FF]/;
  const devanagari = /[\u0900-\u097F]/;
  const latin = /[A-Za-z]/;

  let match: string | undefined;

  if (locale === "bn") match = parts.find((p) => bengali.test(p));
  else if (locale === "hi") match = parts.find((p) => devanagari.test(p));
  else match = parts.find((p) => latin.test(p));

  return match || parts[0];
}

// "DUBRAJPUR" -> "Dubrajpur"
function toTitleCase(value?: string | null) {
  if (!value) return "";

  return value
    .trim()
    .toLowerCase()
    .replace(/(^|[\s-])\S/g, (match) => match.toUpperCase());
}

// Doctor er sob clinic theke unique city list (Title Case, duplicate chhara)
function getDoctorCities(doctor: ExtendedDoctor): string[] {
  const d = doctor as any;

  const clinics: any[] = [
    d.clinic,
    ...(Array.isArray(d.allClinics) ? d.allClinics : []),
  ].filter(Boolean);

  const rawCities: string[] = clinics
    .map((clinic) => clinic?.city)
    .filter((city): city is string => typeof city === "string");

  if (rawCities.length === 0) {
    [d.city, d.clinicCity].forEach((city) => {
      if (typeof city === "string") rawCities.push(city);
    });
  }

  const seen = new Set<string>();
  const result: string[] = [];

  rawCities.forEach((city) => {
    const clean = toTitleCase(city);
    const key = clean.toLowerCase();

    if (!clean || seen.has(key)) return;

    seen.add(key);
    result.push(clean);
  });

  return result;
}

function normalizeSearchValue(value: unknown): string {
  if (value == null) return "";

  if (typeof value === "string" || typeof value === "number") {
    return String(value).toLowerCase();
  }

  if (Array.isArray(value)) {
    return value.map(normalizeSearchValue).join(" ");
  }

  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>)
      .map(normalizeSearchValue)
      .join(" ");
  }

  return "";
}

function getDoctorSearchText(doctor: ExtendedDoctor): string {
  const d = doctor as any;

  return normalizeSearchValue([
    d.medicalSystem,
    d.user?.name,
    d.name,
    d.fullName,
    d.displayName,
    d.specialization,
    d.specialty,
    d.speciality,
    d.specialties,
    d.specialisations,
    d.specializations,
    d.treatment,
    d.treatments,
    d.treatmentTypes,
    d.qualification,
    d.qualifications,
    d.degree,
    d.degrees,
    d.department,
    d.departments,
    d.clinicName,
    d.clinic?.clinicName,
    d.clinic?.name,
    d.clinic?.city,
    d.clinic?.address,
    d.allClinics,
    d.bio,
    d.about,
    d.expertise,
    d.expertises,
    d.services,
    d.languages,
  ]);
}

function matchesDoctorSearch(doctor: ExtendedDoctor, query: string) {
  const search = query.trim().toLowerCase();
  if (!search) return true;

  const searchText = getDoctorSearchText(doctor);
  if (searchText.includes(search)) return true;

  const words = search.split(/\s+/).filter(Boolean);
  return (
    words.length > 1 && words.every((word) => searchText.includes(word))
  );
}

/* ---------- Card shell: gradient border (p-[2px]) ---------- */

function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full rounded-[22px] bg-gradient-to-br from-[#252a67] via-[#3b4a8f] to-[#14B8A6] p-[2px] shadow-sm transition-shadow duration-200 hover:shadow-lg hover:shadow-indigo-900/15">
      <div className="flex h-full flex-col overflow-hidden rounded-[20px] bg-white dark:bg-slate-950">
        {children}
      </div>
    </div>
  );
}

/* ---------- Loading skeleton ---------- */

function DoctorCardSkeleton() {
  return (
    <div className="h-full rounded-[22px] bg-slate-200 p-[2px] dark:bg-slate-800">
      <div className="animate-pulse rounded-[20px] bg-white p-5 dark:bg-slate-950">
        <div className="flex gap-4">
          <div className="h-20 w-20 rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="flex-1 space-y-3 pt-1">
            <div className="h-5 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
        <div className="mt-5 h-6 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="mt-4 h-16 rounded-xl bg-slate-100 dark:bg-slate-900" />
        <div className="mt-5 flex gap-3">
          <div className="h-11 flex-1 rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-11 flex-[1.6] rounded-xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    </div>
  );
}

/* ---------- Grid ---------- */

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
  const tr = (key: string, fallback: string) =>
    t.has(key as any) ? t(key as any) : fallback;

  const { data, isLoading } = useDoctorSearch("", city, {
    liveNow,
    availableToday,
  });

  const doctors = useMemo(() => (data as ExtendedDoctor[]) ?? [], [data]);

  const filteredDoctors = useMemo(() => {
    if (!query.trim()) return doctors;
    return doctors.filter((doctor) => matchesDoctorSearch(doctor, query));
  }, [doctors, query]);

  return (
    <section aria-live="polite">
      {!isLoading && filteredDoctors.length > 0 && (
        <p className="mb-4 text-base font-medium text-slate-600 dark:text-slate-300">
          {filteredDoctors.length}{" "}
          {filteredDoctors.length === 1
            ? tr("doctorFound", "doctor found")
            : tr("doctorsFound", "doctors found")}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {isLoading &&
          Array.from({ length: 6 }).map((_, index) => (
            <DoctorCardSkeleton key={index} />
          ))}

        {!isLoading && filteredDoctors.length === 0 && (
          <div className="col-span-full flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center dark:border-slate-800 dark:bg-slate-900/40">
            <Stethoscope className="h-10 w-10 text-slate-400" />
            <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
              {query.trim()
                ? `${tr("noDoctorsFor", "No doctors found for")} "${query}"`
                : tr("noResults", "No doctors found")}
            </h3>
            <p className="mt-2 max-w-md text-base text-slate-500 dark:text-slate-400">
              {tr(
                "searchHint",
                "Try searching by doctor name, city, specialization or clinic."
              )}
            </p>
          </div>
        )}

        {!isLoading &&
          filteredDoctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
      </div>
    </section>
  );
}

/* ---------- Single doctor card ---------- */

function DoctorCard({ doctor }: { doctor: ExtendedDoctor }) {
  const t = useTranslations("DoctorSearch");
  const locale = useLocale();
  const tr = (key: string, fallback: string) =>
    t.has(key as any) ? t(key as any) : fallback;

  const { user } = useAuth();
  const router = useRouter();

  const [isFavorite, setIsFavorite] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const doctorData = doctor as any;

  function handleBookClick() {
    if (!user) {
      router.push(`/login?redirect=/doctors/${doctor.id}`);
      return;
    }
    router.push(`/doctors/${doctor.id}`);
  }

  const experienceYears = doctor.experience ?? 0;
  const rating = doctor.rating;
  const reviews = doctor.reviewCount;

  const liveStatus = doctor.liveStatus;
  const isLive = liveStatus?.isLive ?? false;
  const isAvailable = liveStatus ? liveStatus.isAvailable : doctor.isAvailable;

  const avatarSrc = doctorData.profilePhoto || doctor.user?.avatar || null;
  const showImage = !!avatarSrc && !imageFailed;

  const rawName = doctor.user?.name;
  const doctorName = cleanDoctorName(rawName, locale);
  const initialsName = cleanDoctorName(rawName, "en");

  const specialization = doctor.specialization || "General Physician";

  const rawMedicalSystem = String(
    doctorData.medicalSystem || "ALLOPATHY"
  ).toUpperCase();

  const medicalSystem =
    rawMedicalSystem.charAt(0) + rawMedicalSystem.slice(1).toLowerCase();

  const systemColor =
    rawMedicalSystem === "AYURVEDA"
      ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
      : rawMedicalSystem === "HOMEOPATHY"
      ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
      : "bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400";

  /* Cities: unique, Title Case. Max 3 dekhabe, baki +N */
  const cities = useMemo(() => getDoctorCities(doctor), [doctor]);
  const MAX_CITIES = 3;
  const visibleCities = cities.slice(0, MAX_CITIES);
  const hiddenCities = Math.max(cities.length - MAX_CITIES, 0);

  return (
    <CardShell>
      <div className="relative flex h-full flex-col p-5">
        {/* Favorite */}
        <button
          type="button"
          aria-label={
            isFavorite ? "Remove from favorites" : "Add to favorites"
          }
          aria-pressed={isFavorite}
          onClick={() => setIsFavorite((value) => !value)}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition-colors duration-200 hover:bg-rose-50 hover:text-rose-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 dark:bg-slate-900"
        >
          <Heart
            className={`h-5 w-5 ${
              isFavorite ? "fill-rose-500 text-rose-500" : ""
            }`}
          />
        </button>

        {/* Photo + name */}
        <div className="flex items-start gap-4">
          <div className="relative h-20 w-20 shrink-0">
            <div className="h-full w-full overflow-hidden rounded-xl bg-gradient-to-br from-indigo-100 to-teal-50 dark:from-indigo-950 dark:to-teal-950">
              {showImage ? (
                <img
                  src={avatarSrc}
                  alt={doctorName}
                  loading="lazy"
                  className="h-full w-full object-cover"
                  onError={() => setImageFailed(true)}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-700 to-teal-500 text-2xl font-bold text-white">
                  {initials(initialsName)}
                </div>
              )}
            </div>

            <div
              className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-700 text-white ring-2 ring-white dark:ring-slate-950"
              title="Verified doctor"
            >
              <BadgeCheck className="h-3.5 w-3.5" />
            </div>
          </div>

          <div className="min-w-0 flex-1 pr-10">
            <h3
              title={doctorName}
              className="line-clamp-2 text-base font-bold leading-snug text-slate-900 dark:text-white"
            >
              {doctorName}
            </h3>

            <p className="mt-1 truncate text-sm text-slate-600 dark:text-slate-300">
              {specialization}
            </p>

            <span
              className={`mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${systemColor}`}
            >
              {medicalSystem}
            </span>
          </div>
        </div>

        {/* Rating + experience + availability */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {rating != null && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-slate-900 dark:bg-amber-950/40 dark:text-slate-100">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {Number(rating).toFixed(1)}
              {reviews != null && (
                <span className="font-medium text-slate-500 dark:text-slate-400">
                  ({reviews})
                </span>
              )}
            </span>
          )}

          {experienceYears > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-300">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
              {experienceYears}+ {tr("yearsExperience", "years experience")}
            </span>
          )}

          {isLive ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute h-full w-full animate-ping rounded-full bg-rose-400 opacity-70" />
                <span className="relative h-2 w-2 rounded-full bg-rose-500" />
              </span>
              <Radio className="h-3.5 w-3.5" />
              {tr("liveNow", "Live now")}
            </span>
          ) : isAvailable ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {tr("availableNow", "Available now")}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-900 dark:text-slate-400">
              <span className="h-2 w-2 rounded-full bg-slate-400" />
              {tr("currentlyUnavailable", "Currently unavailable")}
            </span>
          )}
        </div>

        {/* City box: shudhu city, multiple hole pasha pashi */}
        <div className="mt-4 flex min-h-[72px] items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 dark:border-indigo-900/50 dark:bg-indigo-950/20">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400">
            <MapPin className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {cities.length > 1 ? tr("cities", "Cities") : tr("city", "City")}
            </p>

            {cities.length === 0 ? (
              <p className="text-base font-semibold text-slate-500 dark:text-slate-400">
                {tr("locationNotSpecified", "Location not specified")}
              </p>
            ) : (
              <p
                title={cities.join(" / ")}
                className="flex flex-wrap items-center gap-x-1.5 text-base font-bold leading-snug text-slate-900 dark:text-slate-100"
              >
                {visibleCities.map((cityName, index) => (
                  <React.Fragment key={cityName}>
                    {index > 0 && (
                      <span className="font-normal text-slate-400">/</span>
                    )}
                    <span>{cityName}</span>
                  </React.Fragment>
                ))}

                {hiddenCities > 0 && (
                  <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                    +{hiddenCities}
                  </span>
                )}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-auto grid grid-cols-[1fr_1.6fr] gap-3 pt-5">
          <Link
            href={`/doctors/${doctor.id}`}
            className="flex h-11 items-center justify-center rounded-xl bg-slate-100 px-3 text-sm font-bold text-slate-700 transition-colors duration-200 hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {tr("profile", "Profile")}
          </Link>

          <button
            type="button"
            onClick={handleBookClick}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#252a67] px-3 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#3b4a8f] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6] focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            <Calendar className="h-4 w-4" />
            {tr("bookAppointment", "Book appointment")}
          </button>
        </div>
      </div>
    </CardShell>
  );
}