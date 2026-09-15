"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Star,
  Heart,
  BadgeCheck,
  Stethoscope,
  Award,
  CalendarCheck,
  Sparkles,
  MapPin,
} from "lucide-react";
import { ExtendedDoctor } from "@/types/doctor";
import DoctorClinicInfo from "@/components/DoctorClinicInfo";
import { usePublicFeaturedDoctors } from "@/lib/hooks/usePublicDirectory";
import { Link } from "@/i18n/routing";

/* =========================================================
   HELPERS
========================================================= */

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/* =========================================================
   EXPERIENCE BADGE
========================================================= */

function ExperienceBadge({ years }: { years: number }) {
  if (!years || years <= 0) return null;

  return (
    <div className="absolute bottom-3 left-3 z-20">
      <div
        className="
          flex items-center gap-1.5
          rounded-full
          border border-white/20
          bg-slate-950/80
          px-2.5 py-1.5
          shadow-lg
          backdrop-blur-xl
        "
      >
        <Award
          className="h-3.5 w-3.5 text-amber-300"
          strokeWidth={2.5}
        />

        <span className="text-[10px] font-bold tracking-wide text-white">
          {years}+ yrs experience
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   VERIFIED BADGE
========================================================= */

function VerifiedBadge() {
  return (
    <div
      className="
        absolute right-3 top-3 z-20
        flex h-8 w-8
        items-center justify-center
        rounded-full
        border border-white/70
        bg-white/95
        shadow-[0_5px_18px_rgba(15,23,42,0.18)]
        backdrop-blur-xl
        dark:border-slate-700
        dark:bg-slate-900/95
      "
      title="Verified Doctor"
    >
      <BadgeCheck
        className="h-4.5 w-4.5 text-blue-600"
        strokeWidth={2.5}
      />
    </div>
  );
}

/* =========================================================
   DOCTOR CARD
========================================================= */

function DoctorCard({ doctor }: { doctor: ExtendedDoctor }) {
  const t = useTranslations("DoctorSearch");

  const [isFavorite, setIsFavorite] = useState(false);

  const experienceYears = doctor.experience ?? 0;
  const rating = doctor.rating ?? 4.5;
  const reviews = doctor.reviewCount ?? 120;
  const isAvailable = doctor.isAvailable;

  const avatarSrc =
    (doctor as any).profilePhoto || doctor.user?.avatar;

  return (
    <article
      className="
        group relative h-full
        overflow-hidden
        rounded-[26px]
        border border-slate-200/80
        bg-white
        shadow-[0_8px_35px_rgba(15,23,42,0.055)]
        transition-all duration-500
        hover:-translate-y-1.5
        hover:border-slate-300
        hover:shadow-[0_22px_55px_rgba(37,42,103,0.13)]
        dark:border-slate-800
        dark:bg-slate-950
        dark:hover:border-slate-700
      "
    >
      {/* =====================================================
          TOP GRADIENT ACCENT
      ====================================================== */}
      <div
        className="
          absolute inset-x-0 top-0 h-[3px]
          bg-gradient-to-r
          from-[#252a67]
          via-[#4f63b5]
          to-[#14B8A6]
          opacity-90
        "
      />

      {/* =====================================================
          SOFT BACKGROUND GLOW
      ====================================================== */}
      <div
        className="
          pointer-events-none
          absolute -right-20 -top-20
          h-48 w-48
          rounded-full
          bg-gradient-to-br
          from-[#252a67]/[0.07]
          via-blue-400/[0.04]
          to-[#14B8A6]/[0.08]
          blur-3xl
        "
      />

      {/* =====================================================
          DOCTOR PHOTO
      ====================================================== */}
      <div className="relative px-4 pt-4 sm:px-5 sm:pt-5">
        <div
          className="
            relative mx-auto
            aspect-[4/4.8]
            w-full
            max-w-[190px]
            overflow-hidden
            rounded-[20px]
            bg-slate-100
            ring-1 ring-slate-200/80
            shadow-[0_12px_35px_rgba(15,23,42,0.10)]
            dark:bg-slate-900
            dark:ring-slate-800
          "
        >
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt={doctor.user.name}
              className="
                h-full w-full
                object-cover
                transition-transform
                duration-700
                ease-out
                group-hover:scale-[1.035]
              "
            />
          ) : (
            <div
              className="
                flex h-full w-full
                items-center justify-center
                bg-gradient-to-br
                from-[#252a67]
                via-[#3b4a8f]
                to-[#14B8A6]
                text-4xl
                font-extrabold
                text-white
              "
            >
              {initials(doctor.user.name)}
            </div>
          )}

          {/* Bottom image gradient */}
          <div
            className="
              pointer-events-none
              absolute inset-x-0 bottom-0
              h-28
              bg-gradient-to-t
              from-black/30
              via-black/5
              to-transparent
            "
          />

          {/* Experience */}
          <ExperienceBadge years={experienceYears} />

          {/* Verified */}
          <VerifiedBadge />

          {/* Favorite */}
          <button
            type="button"
            aria-label={
              isFavorite
                ? "Remove from favorites"
                : "Add to favorites"
            }
            onClick={() => setIsFavorite((value) => !value)}
            className="
              absolute left-3 top-3 z-20
              flex h-8 w-8
              items-center justify-center
              rounded-full
              border border-white/70
              bg-white/95
              text-slate-400
              shadow-[0_5px_18px_rgba(15,23,42,0.15)]
              backdrop-blur-xl
              transition-all duration-200
              hover:scale-105
              hover:text-rose-500
              active:scale-95
              dark:border-slate-700
              dark:bg-slate-900/95
            "
          >
            <Heart
              className={`
                h-4 w-4
                transition-all duration-200
                ${
                  isFavorite
                    ? "fill-rose-500 text-rose-500"
                    : "text-slate-400"
                }
              `}
              strokeWidth={2}
            />
          </button>
        </div>
      </div>

      {/* =====================================================
          CONTENT
      ====================================================== */}
      <div className="relative flex h-full flex-col px-4 pb-4 pt-4 sm:px-5 sm:pb-5">
        {/* ===================================================
            DOCTOR NAME
        ==================================================== */}
        <div className="text-center">
          <h3
            className="
              truncate
              text-[17px]
              font-extrabold
              tracking-[-0.025em]
              text-slate-900
              dark:text-white
            "
          >
            {doctor.user.name}
          </h3>

          {/* Qualification */}
          {doctor.qualification && (
            <p
              className="
                mt-1
                truncate
                text-[11px]
                font-semibold
                text-slate-500
                dark:text-slate-400
              "
            >
              {doctor.qualification}
            </p>
          )}

          {/* Specialization */}
          {doctor.specialization && (
            <div
              className="
                mt-2
                flex
                items-center
                justify-center
                gap-1.5
              "
            >
              <Stethoscope
                className="h-3.5 w-3.5 shrink-0 text-[#14B8A6]"
                strokeWidth={2.2}
              />

              <span
                className="
                  truncate
                  text-[11px]
                  font-semibold
                  text-slate-600
                  dark:text-slate-300
                "
              >
                {doctor.specialization}
              </span>
            </div>
          )}
        </div>

        {/* ===================================================
            RATING
        ==================================================== */}
        <div className="mt-3 flex items-center justify-center gap-2">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`
                  h-3.5 w-3.5
                  ${
                    star <= Math.round(rating)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700"
                  }
                `}
                strokeWidth={1.5}
              />
            ))}
          </div>

          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
            {rating.toFixed(1)}
          </span>

          <span className="text-[10px] text-slate-400">
            ({reviews} reviews)
          </span>
        </div>

        {/* ===================================================
            DIVIDER
        ==================================================== */}
        <div className="my-4 h-px bg-slate-100 dark:bg-slate-800" />

        {/* ===================================================
            CLINIC INFORMATION
        ==================================================== */}
        <div className="min-h-[60px] w-full">
          <DoctorClinicInfo doctor={doctor} />
        </div>

        {/* ===================================================
            AVAILABILITY
        ==================================================== */}
        <div className="mt-3 flex justify-center">
          {isAvailable ? (
            <div
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-emerald-100
                bg-emerald-50
                px-3 py-1.5
                dark:border-emerald-500/20
                dark:bg-emerald-500/10
              "
            >
              <span className="relative flex h-2 w-2">
                <span
                  className="
                    absolute
                    inline-flex
                    h-full w-full
                    animate-ping
                    rounded-full
                    bg-emerald-400
                    opacity-60
                  "
                />

                <span
                  className="
                    relative
                    inline-flex
                    h-2 w-2
                    rounded-full
                    bg-emerald-500
                  "
                />
              </span>

              <span
                className="
                  text-[10px]
                  font-bold
                  text-emerald-700
                  dark:text-emerald-400
                "
              >
                {t("availableNow") || "Available Now"}
              </span>
            </div>
          ) : (
            <div
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-slate-200
                bg-slate-50
                px-3 py-1.5
                dark:border-slate-700
                dark:bg-slate-900
              "
            >
              <span className="h-2 w-2 rounded-full bg-slate-400" />

              <span
                className="
                  text-[10px]
                  font-semibold
                  text-slate-500
                  dark:text-slate-400
                "
              >
                {t("currentlyUnavailable") ||
                  "Currently Unavailable"}
              </span>
            </div>
          )}
        </div>

        {/* ===================================================
            SINGLE PRIMARY ACTION

            IMPORTANT:
            This opens exactly the same doctor view page
            that the old "View Profile" button opened.
        ==================================================== */}
        <div className="mt-5">
          <Link
            href={`/doctors/${doctor.id}`}
            className="
              group/button
              relative
              flex
              w-full
              items-center
              justify-center
              gap-2
              overflow-hidden
              rounded-xl
              bg-gradient-to-r
              from-[#252a67]
              via-[#354a94]
              to-[#0F766E]
              px-4
              py-3
              text-[11px]
              font-extrabold
              tracking-[0.01em]
              text-white
              shadow-[0_8px_22px_rgba(37,42,103,0.20)]
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:shadow-[0_14px_30px_rgba(37,42,103,0.27)]
              active:translate-y-0
              dark:shadow-[0_8px_22px_rgba(0,0,0,0.30)]
            "
          >
            {/* Shine animation */}
            <span
              className="
                pointer-events-none
                absolute
                inset-y-0
                -left-24
                w-20
                rotate-[18deg]
                bg-white/20
                blur-sm
                transition-all
                duration-700
                group-hover/button:left-[120%]
              "
            />

            <CalendarCheck
              className="
                relative z-10
                h-4 w-4
                transition-transform
                duration-300
                group-hover/button:scale-110
              "
              strokeWidth={2.3}
            />

            <span className="relative z-10">
              {t("bookButton") || "Book Appointment"}
            </span>

            <span
              className="
                relative z-10
                ml-0.5
                text-white/60
                transition-transform
                duration-300
                group-hover/button:translate-x-1
              "
            >
              →
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function FeaturedDoctorsPage() {
  const { data: doctors, isLoading } =
    usePublicFeaturedDoctors();

  const featuredDoctors =
    (doctors as ExtendedDoctor[]) ?? [];

  return (
    <main
      className="
        mx-auto
        max-w-7xl
        px-4
        py-8
        sm:px-6
        lg:px-8
      "
    >
      {/* =====================================================
          PREMIUM PAGE HEADER
      ====================================================== */}
      <section
        className="
          relative
          mb-8
          overflow-hidden
          rounded-[26px]
          border
          border-slate-200/80
          bg-white
          shadow-[0_8px_35px_rgba(15,23,42,0.05)]
          dark:border-slate-800
          dark:bg-slate-950
        "
      >
        {/* Top gradient */}
        <div
          className="
            absolute inset-x-0 top-0 h-[3px]
            bg-gradient-to-r
            from-[#252a67]
            via-[#4f63b5]
            to-[#14B8A6]
          "
        />

        {/* Background glow */}
        <div
          className="
            pointer-events-none
            absolute
            -right-20
            -top-24
            h-64
            w-64
            rounded-full
            bg-gradient-to-br
            from-[#252a67]/10
            to-[#14B8A6]/10
            blur-3xl
          "
        />

        <div
          className="
            relative
            px-5
            py-7
            sm:px-8
            sm:py-8
          "
        >
          {/* Eyebrow */}
          <div className="mb-3 flex items-center gap-2.5">
            <div
              className="
                flex h-9 w-9
                items-center justify-center
                rounded-xl
                bg-gradient-to-br
                from-[#252a67]
                to-[#0F766E]
                text-white
                shadow-[0_6px_18px_rgba(37,42,103,0.18)]
              "
            >
              <Sparkles
                className="h-4 w-4"
                strokeWidth={2.2}
              />
            </div>

            <span
              className="
                text-[10px]
                font-extrabold
                uppercase
                tracking-[0.18em]
                text-[#252a67]
                dark:text-blue-300
              "
            >
              Featured Directory
            </span>
          </div>

          {/* Title */}
          <h1
            className="
              text-2xl
              font-extrabold
              tracking-[-0.04em]
              text-slate-900
              sm:text-3xl
              dark:text-white
            "
          >
            Featured Doctors
          </h1>

          {/* Description */}
          <p
            className="
              mt-1.5
              max-w-2xl
              text-sm
              leading-6
              text-slate-500
              dark:text-slate-400
            "
          >
            Connect with highly rated healthcare
            professionals and book your appointment
            with confidence.
          </p>

          {/* Small trust indicators */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <div
              className="
                inline-flex
                items-center
                gap-1.5
                rounded-full
                border
                border-slate-200
                bg-slate-50
                px-3 py-1.5
                dark:border-slate-800
                dark:bg-slate-900
              "
            >
              <BadgeCheck
                className="h-3.5 w-3.5 text-blue-600"
              />

              <span
                className="
                  text-[10px]
                  font-bold
                  text-slate-600
                  dark:text-slate-300
                "
              >
                Verified Doctors
              </span>
            </div>

            <div
              className="
                inline-flex
                items-center
                gap-1.5
                rounded-full
                border
                border-slate-200
                bg-slate-50
                px-3 py-1.5
                dark:border-slate-800
                dark:bg-slate-900
              "
            >
              <Star
                className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
              />

              <span
                className="
                  text-[10px]
                  font-bold
                  text-slate-600
                  dark:text-slate-300
                "
              >
                Highly Rated
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          DOCTOR GRID
      ====================================================== */}
      <section
        className="
          grid
          grid-cols-2
          gap-3
          sm:grid-cols-3
          sm:gap-5
          lg:grid-cols-4
          xl:grid-cols-5
        "
      >
        {/* ===================================================
            LOADING
        ==================================================== */}
        {isLoading && (
          <div
            className="
              col-span-full
              flex
              flex-col
              items-center
              justify-center
              py-24
            "
          >
            <div className="relative">
              <div
                className="
                  h-12
                  w-12
                  animate-spin
                  rounded-full
                  border-[3px]
                  border-slate-200
                  border-t-[#252a67]
                  dark:border-slate-700
                  dark:border-t-[#14B8A6]
                "
              />

              <div
                className="
                  absolute
                  inset-0
                  flex
                  items-center
                  justify-center
                "
              >
                <Stethoscope
                  className="h-4 w-4 text-[#252a67]"
                  strokeWidth={2}
                />
              </div>
            </div>

            <p
              className="
                mt-4
                text-sm
                font-semibold
                text-slate-500
                dark:text-slate-400
              "
            >
              Loading featured doctors...
            </p>
          </div>
        )}

        {/* ===================================================
            EMPTY STATE
        ==================================================== */}
        {!isLoading &&
          featuredDoctors.length === 0 && (
            <div
              className="
                col-span-full
                flex
                flex-col
                items-center
                justify-center
                rounded-[26px]
                border
                border-dashed
                border-slate-200
                bg-slate-50/70
                px-6
                py-20
                text-center
                dark:border-slate-800
                dark:bg-slate-900/50
              "
            >
              <div
                className="
                  flex h-16 w-16
                  items-center justify-center
                  rounded-2xl
                  bg-white
                  text-slate-400
                  shadow-sm
                  dark:bg-slate-800
                "
              >
                <Stethoscope
                  className="h-7 w-7"
                  strokeWidth={1.7}
                />
              </div>

              <p
                className="
                  mt-5
                  text-base
                  font-bold
                  text-slate-800
                  dark:text-slate-200
                "
              >
                No Featured Doctors
              </p>

              <p
                className="
                  mt-1
                  max-w-sm
                  text-sm
                  leading-6
                  text-slate-500
                  dark:text-slate-400
                "
              >
                We couldn't find any featured doctors
                at the moment.
              </p>
            </div>
          )}

        {/* ===================================================
            DOCTORS
        ==================================================== */}
        {!isLoading &&
          featuredDoctors.map((doctor) => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
            />
          ))}
      </section>
    </main>
  );
}