
"use client";

import { useState } from "react";
import {
  Star,
  Heart,
  BadgeCheck,
  MapPin,
  BriefcaseBusiness,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

import { Link } from "@/i18n/routing";
import { usePublicFeaturedDoctors } from "@/lib/hooks/usePublicDirectory";
import { ExtendedDoctor } from "@/types/doctor";

const cleanText = (value: string = "") =>
  value.split(" | ")[0]?.trim() || value;

function DoctorCard({ doctor }: { doctor: ExtendedDoctor }) {
  const [favorite, setFavorite] = useState(false);
  const [imageError, setImageError] = useState(false);

  const rawName = cleanText(doctor.user?.name || "Doctor");
  const name = /^dr\.?\s*/i.test(rawName)
    ? rawName
    : `Dr. ${rawName}`;

  const specialization = doctor.specialization || "General Physician";
  const experience = doctor.experience ?? 0;
  const rating = doctor.rating;
  const city = cleanText(doctor.clinic?.city || "");

  const avatar =
    (doctor as any).profilePhoto || doctor.user?.avatar || null;

  const initials =
    rawName
      .replace(/^dr\.?\s*/i, "")
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "DR";

  return (
    <article className="group flex min-w-0 flex-col rounded-[20px] bg-gradient-to-br from-[#252a67] via-[#3b4a8f] to-[#14B8A6] p-[2px] shadow-[0_5px_20px_rgba(37,42,103,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(37,42,103,0.16)]">
      <div className="flex h-full min-w-0 flex-col overflow-hidden rounded-[18px] bg-white dark:bg-slate-950">

        {/* Doctor Photo */}
        <div className="relative h-[132px] overflow-hidden bg-gradient-to-br from-[#edf1ff] via-[#f7f9ff] to-[#e4f8f4] sm:h-[170px] lg:h-[185px]">
          {avatar && !imageError ? (
            <img
              src={avatar}
              alt={name}
              loading="lazy"
              onError={() => setImageError(true)}
              className="h-full w-full object-contain p-1.5 transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#252a67] via-[#4c5e9f] to-[#14B8A6]">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/40 bg-white/15 text-xl font-extrabold text-white shadow-md sm:h-16 sm:w-16 sm:text-2xl">
                {initials}
              </div>
            </div>
          )}

          {/* Featured Badge */}
          <div className="absolute left-2 top-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-white/80 bg-white/95 px-2 py-1 text-[8px] font-extrabold uppercase tracking-wide text-[#252a67] shadow-sm sm:text-[9px]">
              <Sparkles className="h-3 w-3 text-teal-600" />
              Featured
            </span>
          </div>

          {/* Favorite */}
          <button
            type="button"
            aria-label={favorite ? "Remove favorite" : "Add favorite"}
            aria-pressed={favorite}
            onClick={() => setFavorite((previous) => !previous)}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-slate-500 shadow-sm transition hover:text-rose-500 sm:h-8 sm:w-8"
          >
            <Heart
              className={`h-4 w-4 ${
                favorite ? "fill-rose-500 text-rose-500" : ""
              }`}
            />
          </button>

          {/* Rating */}
          {rating != null && (
            <div className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-lg bg-white/95 px-2 py-1 text-[10px] font-extrabold text-[#252a67] shadow-sm">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
              {rating}
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-4">

          {/* Doctor Name */}
          <div className="flex min-w-0 items-start gap-1.5">
            <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#5362a4]" />

            <h3 className="min-w-0 break-words text-[13px] font-extrabold leading-5 tracking-[-0.3px] text-[#171d46] [overflow-wrap:anywhere] sm:text-[16px] dark:text-white">
              {name}
            </h3>
          </div>

          {/* Specialization */}
          <p className="mt-1.5 min-w-0 break-words text-[11px] font-semibold leading-relaxed text-[#5362a4] [overflow-wrap:anywhere] sm:text-[13px] dark:text-teal-300">
            {specialization}
          </p>

          {/* City & Experience */}
          <div className="mt-3 flex min-w-0 flex-wrap items-start gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">

            {/* City */}
            {city && (
              <div className="inline-flex min-w-0 max-w-full items-start gap-1.5 rounded-lg border border-teal-100 bg-[#f0faf8] px-2.5 py-2 dark:border-teal-900 dark:bg-teal-950/40">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-600" />
                <span className="min-w-0 break-words text-[11px] font-bold leading-4 text-[#176b65] [overflow-wrap:anywhere] sm:text-xs dark:text-teal-300">
                  {city}
                </span>
              </div>
            )}

            {/* Experience */}
            {experience > 0 && (
              <div className="inline-flex min-w-0 max-w-full items-start gap-1.5 rounded-lg border border-indigo-100 bg-[#f3f4fc] px-2.5 py-2 dark:border-indigo-900 dark:bg-indigo-950/40">
                <BriefcaseBusiness className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#5362a4]" />
                <span className="min-w-0 break-words text-[11px] font-bold leading-4 text-[#3b4a8f] sm:text-xs dark:text-indigo-300">
                  {experience}+ Years Exp.
                </span>
              </div>
            )}
          </div>

          {/* Profile Button */}
          <Link
            href={`/doctors/${doctor.id}`}
            className="mt-auto flex min-w-0 items-center justify-between gap-2 border-t border-slate-100 pt-3 text-[11px] font-extrabold text-[#252a67] transition-colors hover:text-[#0d9e91] sm:mt-4 sm:text-[13px] dark:border-slate-800 dark:text-teal-300"
          >
            <span>View Profile</span>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f0f2fb] transition-colors group-hover:bg-teal-50 dark:bg-slate-800">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function FeaturedDoctors() {
  const { data, isLoading } = usePublicFeaturedDoctors();

  const doctors = ((data as ExtendedDoctor[]) ?? []).filter(
    (doctor) => doctor?.id
  );

  if (!isLoading && doctors.length === 0) return null;

  return (
    <section className="relative min-h-screen bg-[#f8faff] pb-10 pt-5 sm:pt-7 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Compact Premium Heading */}
        <div className="mb-5 flex flex-col gap-2 border-b border-indigo-100 pb-4 sm:mb-6 sm:flex-row sm:items-end sm:justify-between dark:border-slate-800">
          <div className="min-w-0">
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#eaf8f5] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[1px] text-[#0d8e84] dark:bg-teal-950 dark:text-teal-300">
              <Sparkles className="h-3 w-3" />
              Featured Selection
            </div>

            <h1 className="text-[25px] font-black leading-tight tracking-[-0.8px] text-[#171d46] sm:text-[32px] dark:text-white">
              Featured{" "}
              <span className="bg-gradient-to-r from-[#3b4a8f] to-[#14B8A6] bg-clip-text text-transparent">
                Doctors
              </span>
            </h1>

            <p className="mt-1 text-[12px] leading-5 text-slate-500 sm:text-[13px] dark:text-slate-400">
              Explore featured healthcare professionals.
            </p>
          </div>

          {!isLoading && doctors.length > 0 && (
            <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-indigo-100 bg-white px-3 py-1.5 text-[11px] font-bold text-[#3b4a8f] dark:border-slate-700 dark:bg-slate-900 dark:text-teal-300">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
              {doctors.length} Featured Doctors
            </div>
          )}
        </div>

        {/* Doctor Grid */}
        <div className="grid grid-cols-2 items-stretch gap-3 sm:gap-4 lg:grid-cols-4">
          {isLoading
            ? [1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="min-w-0 overflow-hidden rounded-[20px] border border-indigo-100 bg-white p-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="h-[132px] animate-pulse rounded-xl bg-slate-100 sm:h-[170px] lg:h-[185px] dark:bg-slate-800" />
                  <div className="space-y-3 p-3">
                    <div className="h-4 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                    <div className="h-3 w-3/4 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                    <div className="h-8 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                  </div>
                </div>
              ))
            : doctors.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
        </div>
      </div>
    </section>
  );
}
