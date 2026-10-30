
"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Star,
  Heart,
  BadgeCheck,
  CalendarCheck,
  Sparkles,
  MapPin,
  Radio,
  Check,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { ExtendedDoctor } from "@/types/doctor";
import { usePublicFeaturedDoctors } from "@/lib/hooks/usePublicDirectory";
import { Link, useRouter } from "@/i18n/routing";
import { useAuth } from "@/lib/auth-context";

/* =========================================================
   HELPERS
========================================================= */

const parseEnglishName = (rawName: string = "") => {
  const parts = rawName.split(" | ");
  return parts[0]?.trim() || rawName;
};

function initials(name?: string) {
  if (!name) return "DR";

  const englishPart = parseEnglishName(name);

  return englishPart
    .replace(/^dr\.?\s*/i, "")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/* =========================================================
   MARQUEE TEXT
========================================================= */

const MarqueeText = ({
  text,
  className,
  minChars = 15,
}: {
  text: string;
  className?: string;
  minChars?: number;
}) => {
  const isLong = text.length > minChars;

  if (!isLong) {
    return (
      <div className={`truncate whitespace-nowrap ${className}`}>
        {text}
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden">
      <div
        className="flex w-max whitespace-nowrap"
        style={{ animation: "marqueeScroll 10s linear infinite" }}
      >
        <span className={className}>{text}</span>
        <span className={`mx-4 opacity-0 ${className}`}>|</span>
        <span className={className}>{text}</span>
        <span className={`mx-4 opacity-0 ${className}`}>|</span>
      </div>
    </div>
  );
};

/* =========================================================
   FEATURED DOCTOR CARD
========================================================= */

function FeaturedDoctorCard({
  doctor,
}: {
  doctor: ExtendedDoctor;
}) {
  const t = useTranslations("DoctorSearch");
  const { user } = useAuth();
  const router = useRouter();

  const [isFavorite, setIsFavorite] = useState(false);

  function handleBookClick() {
    if (!user) {
      router.push(`/login?redirect=/doctors/${doctor.id}`);
      return;
    }

    router.push(`/doctors/${doctor.id}`);
  }

  const experienceYears = doctor.experience ?? 0;
  const rating = doctor.rating ?? 4.5;
  const reviews = doctor.reviewCount ?? 120;

  const liveStatus = doctor.liveStatus;
  const isLive = liveStatus?.isLive ?? false;
  const isAvailable = liveStatus
    ? liveStatus.isAvailable
    : doctor.isAvailable;

  const avatarSrc =
    (doctor as any).profilePhoto ||
    doctor.user?.avatar ||
    null;

  const rawName = doctor.user?.name || "Doctor";

  const displayFullname = rawName.toLowerCase().startsWith("dr")
    ? rawName
    : `Dr. ${rawName}`;

  const specialization =
    doctor.specialization || "General Physician";

  const clinicCity =
    doctor.clinic?.city ||
    parseEnglishName(doctor.clinic?.clinicName) ||
    null;

  const qualification = doctor.qualification || "MBBS";

  const rawMedicalSystem = String(
    (doctor as any).medicalSystem || "ALLOPATHY"
  ).toUpperCase();

  const medicalSystem =
    rawMedicalSystem.charAt(0) +
    rawMedicalSystem.slice(1).toLowerCase();

  const hasClinic =
    !!doctor.clinic ||
    (Array.isArray(doctor.allClinics) &&
      doctor.allClinics.length > 0);

  return (
    <div
      className="
        group relative
        h-[340px]
        shrink-0 snap-start
        overflow-hidden
        rounded-[22px]
        p-[2px]
        bg-gradient-to-br
        from-[#252a67]
        via-[#3b4a8f]
        to-[#14B8A6]
        shadow-[0_6px_20px_rgba(37,42,103,0.15)]
        transition-all duration-300
        hover:-translate-y-1.5
        hover:shadow-[0_15px_35px_rgba(20,184,166,0.30)]
        w-[240px]
        sm:w-[260px]
        md:w-[280px]
        lg:w-[300px]
        xl:w-[320px]
      "
    >
      {/* VIP Glow */}

      <div
        className="
          absolute -inset-1 -z-10
          rounded-[24px]
          bg-gradient-to-br
          from-[#252a67]
          via-[#3b4a8f]
          to-[#14B8A6]
          opacity-0 blur-lg
          transition-opacity duration-500
          group-hover:opacity-50
        "
      />

      {/* Inner Card */}

      <div
        className="
          relative flex h-full flex-col
          rounded-[20px]
          bg-white
          px-4 pb-4 pt-5
          sm:px-5
          dark:bg-slate-900
        "
      >
        {/* Favorite Button */}

        <button
          type="button"
          aria-label="Add to favorites"
          onClick={(e) => {
            e.preventDefault();
            setIsFavorite((value) => !value);
          }}
          className="
            absolute right-3 top-4 z-20
            text-slate-300
            transition-colors
            hover:text-red-500
            dark:text-slate-600
            dark:hover:text-red-500
          "
        >
          <Heart
            className={`
              h-[18px] w-[18px] transition-transform
              ${
                isFavorite
                  ? "fill-red-500 text-red-500 scale-110"
                  : ""
              }
            `}
          />
        </button>

        {/* TOP SECTION */}

        <div className="flex items-start gap-3.5">

          {/* Doctor Image */}

          <div className="relative h-[85px] w-[85px] shrink-0">

            <div
              className="
                h-full w-full overflow-hidden
                rounded-[16px]
                border border-slate-100
                bg-slate-50
                dark:border-slate-800
                dark:bg-slate-800/50
              "
            >
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={rawName}
                  loading="lazy"
                  className="
                    h-full w-full object-cover object-top
                    transition-transform duration-500
                    group-hover:scale-[1.05]
                  "
                  onError={(event) => {
                    const image = event.currentTarget;
                    image.style.display = "none";

                    const parent = image.parentElement;

                    if (parent) {
                      parent.innerHTML = `
                        <div class="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#252a67] to-[#14B8A6] text-2xl font-bold text-white">
                          ${initials(rawName)}
                        </div>
                      `;
                    }
                  }}
                />
              ) : (
                <div
                  className="
                    flex h-full w-full items-center justify-center
                    bg-gradient-to-br
                    from-[#252a67] to-[#14B8A6]
                    text-2xl font-bold text-white
                  "
                >
                  {initials(rawName)}
                </div>
              )}
            </div>

            {/* Verified Badge */}

            <div
              className="
                absolute -bottom-1 -right-1
                flex h-6 w-6 items-center justify-center
                rounded-full border-2
                border-white bg-[#14B8A6]
                shadow-sm dark:border-slate-900
              "
            >
              <BadgeCheck className="h-3 w-3 text-white" />
            </div>
          </div>

          {/* Doctor Details */}

          <div className="min-w-0 flex-1 pt-1 pr-6">

            <div className="mb-0.5 w-full overflow-hidden">
              <MarqueeText
                text={displayFullname}
                minChars={14}
                className="
                  text-[16px] font-extrabold
                  tracking-tight text-slate-900
                  dark:text-white
                "
              />
            </div>

            <p
              className="
                truncate text-[12px]
                font-semibold text-teal-600
                dark:text-teal-400
              "
            >
              {specialization}
            </p>

            <p
              className="
                mt-1 truncate text-[11px]
                font-medium text-slate-500
                dark:text-slate-400
              "
            >
              {qualification}
              <span className="mx-0.5 text-slate-300">•</span>
              {medicalSystem}
            </p>
          </div>
        </div>

        {/* STATS ROW */}

        <div
          className="
            mt-4 flex min-h-[27px]
            items-center gap-3
            text-[11px] font-semibold
            text-slate-600 dark:text-slate-300
          "
        >
          <div
            className="
              flex items-center gap-1
              rounded-md border border-slate-100
              bg-slate-50 px-2 py-1
              dark:border-slate-800
              dark:bg-slate-800/50
            "
          >
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />

            <span>
              {rating}
              <span className="font-normal text-slate-400">
                {" "}({reviews})
              </span>
            </span>
          </div>

          {experienceYears > 0 && (
            <div
              className="
                flex items-center gap-1
                rounded-md border border-slate-100
                bg-slate-50 px-2 py-1
                dark:border-slate-800
                dark:bg-slate-800/50
              "
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>{experienceYears}+ Yrs</span>
            </div>
          )}
        </div>

        {/* DIVIDER */}

        <div
          className="
            my-3 h-px w-full shrink-0
            bg-slate-100 dark:bg-slate-800
          "
        />

        {/* CLINIC INFO */}

        <div className="mb-4 min-h-[53px]">

          <div className="mb-1.5 flex items-center gap-1.5 text-slate-400">
            <MapPin className="h-3.5 w-3.5" />

            <span
              className="
                text-[10px] font-bold
                uppercase tracking-wider
              "
            >
              Primary Location
            </span>
          </div>

          {hasClinic && clinicCity ? (
            <div className="flex items-center gap-2 pl-5">
              <div className="min-w-0 flex-1 overflow-hidden">
                <MarqueeText
                  text={clinicCity}
                  minChars={25}
                  className="
                    text-[13px] font-bold
                    text-slate-700 dark:text-slate-200
                  "
                />
              </div>
            </div>
          ) : (
            <div className="pl-5 text-[11px] font-medium text-slate-400">
              {t.has("noClinic")
                ? t("noClinic")
                : "Location unavailable"}
            </div>
          )}
        </div>

        {/* STATUS & BUTTONS */}

        <div className="mt-auto flex flex-col gap-3">

          {/* FIXED STATUS HEIGHT */}

          <div
            className="
              flex h-[28px] shrink-0
              items-center justify-start
            "
          >
            {isLive ? (
              <div
                className="
                  inline-flex items-center gap-1.5
                  rounded-md border border-red-100
                  bg-red-50 px-2 py-1
                  text-[10px] font-bold text-red-600
                  dark:border-red-900/30
                  dark:bg-red-950/20
                  dark:text-red-400
                "
              >
                <Radio className="h-3 w-3 animate-pulse" />
                {t("liveNow") || "Live Now"}
              </div>
            ) : isAvailable ? (
              <div
                className="
                  inline-flex items-center gap-1.5
                  rounded-md border border-emerald-100
                  bg-emerald-50 px-2 py-1
                  text-[10px] font-bold text-emerald-600
                  dark:border-emerald-900/30
                  dark:bg-emerald-950/20
                  dark:text-emerald-400
                "
              >
                <Check className="h-3 w-3" />
                {t("availableNow") || "Available Today"}
              </div>
            ) : null}
          </div>

          {/* ACTION BUTTONS */}

          <div className="grid grid-cols-2 gap-2">

            <Link
              href={`/doctors/${doctor.id}`}
              className="
                flex h-10 items-center justify-center
                rounded-[10px]
                border border-slate-200
                bg-white px-3
                text-[12px] font-bold text-slate-600
                transition-colors
                hover:bg-slate-50 hover:text-slate-900
                dark:border-slate-700
                dark:bg-slate-800
                dark:text-slate-300
                dark:hover:bg-slate-700
              "
            >
              View Profile
            </Link>

            <button
              type="button"
              onClick={handleBookClick}
              className="
                flex h-10 items-center justify-center
                gap-1.5 rounded-[10px]
                bg-gradient-to-r
                from-[#252a67] to-[#14B8A6]
                px-3 text-[12px] font-bold text-white
                shadow-sm transition-all
                hover:shadow-md active:scale-95
              "
            >
              <CalendarCheck className="h-3.5 w-3.5" />
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function FeaturedDoctors() {
  const t = useTranslations("HomePage");

  const { data, isLoading } = usePublicFeaturedDoctors();

  const featured = ((data as ExtendedDoctor[]) ?? []).filter(
    (doctor) => doctor?.id
  );

  const carouselRef = useRef<HTMLDivElement>(null);

  const [isPaused, setIsPaused] = useState(false);

  /* GET CARD WIDTH */

  const getScrollAmount = () => {
    const width = window.innerWidth;

    if (width < 640) return 256;
    if (width < 768) return 276;
    if (width < 1024) return 296;
    if (width < 1280) return 316;

    return 336;
  };

  /* MANUAL SCROLL */

  const scroll = (direction: "left" | "right") => {
    const container = carouselRef.current;

    if (!container) return;

    const amount = getScrollAmount();

    container.scrollBy({
      left: direction === "right" ? amount : -amount,
      behavior: "smooth",
    });
  };

  /* AUTO SCROLL */

  useEffect(() => {
    if (isLoading || featured.length <= 2) return;

    const interval = window.setInterval(() => {
      if (isPaused) return;

      const container = carouselRef.current;

      if (!container) return;

      const maxScroll =
        container.scrollWidth - container.clientWidth;

      if (container.scrollLeft >= maxScroll - 10) {
        container.scrollTo({
          left: 0,
          behavior: "smooth",
        });

        return;
      }

      container.scrollBy({
        left: getScrollAmount(),
        behavior: "smooth",
      });
    }, 3000);

    return () => window.clearInterval(interval);
  }, [isLoading, featured.length, isPaused]);

  if (!isLoading && featured.length === 0) {
    return null;
  }

  return (
    <section
      className="
        mx-auto max-w-7xl
        border-b border-slate-100
        px-5 py-6
        lg:px-8
        dark:border-soft-200
      "
    >
      {/* MARQUEE ANIMATION */}

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes marqueeScroll {
              0% { transform: translateX(0%); }
              100% { transform: translateX(-50%); }
            }
          `,
        }}
      />

      {/* HEADER */}

      <div className="mb-4 flex items-center justify-between">

        <div>
          <h2
            className="
              text-2xl font-extrabold
              tracking-tight text-slate-900
              dark:text-white
            "
          >
            {t("featuredDoctors") || "Featured Doctors"}
          </h2>

          <p
            className="
              mt-1 text-sm font-medium
              text-slate-500 dark:text-slate-400
            "
          >
            Top rated and most trusted doctors near you
          </p>
        </div>

        <Link
          href="/doctors/featured"
          className="
            hidden text-sm font-bold
            text-[#14B8A6]
            hover:text-[#0f8a7c]
            sm:block
          "
        >
          {t("viewAll") || "View All"}
          <ArrowRight className="ml-1 inline-block h-4 w-4" />
        </Link>
      </div>

      {/* CAROUSEL */}

      <div
        className="relative mt-5"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >

        {/* LEFT BUTTON */}

        <button
          type="button"
          onClick={() => scroll("left")}
          aria-label="Previous doctors"
          className="
            absolute -left-4 top-1/2 z-30
            hidden h-10 w-10
            -translate-y-1/2
            items-center justify-center
            rounded-full border border-slate-200
            bg-white text-slate-600
            shadow-[0_5px_16px_rgba(15,23,42,0.1)]
            transition-all duration-200
            hover:scale-105
            hover:border-[#14B8A6]
            hover:text-[#14B8A6]
            active:scale-95
            md:flex
            dark:border-slate-700
            dark:bg-slate-800
            dark:text-slate-300
          "
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* RIGHT BUTTON */}

        <button
          type="button"
          onClick={() => scroll("right")}
          aria-label="Next doctors"
          className="
            absolute -right-4 top-1/2 z-30
            hidden h-10 w-10
            -translate-y-1/2
            items-center justify-center
            rounded-full border border-slate-200
            bg-white text-slate-600
            shadow-[0_5px_16px_rgba(15,23,42,0.1)]
            transition-all duration-200
            hover:scale-105
            hover:border-[#14B8A6]
            hover:text-[#14B8A6]
            active:scale-95
            md:flex
            dark:border-slate-700
            dark:bg-slate-800
            dark:text-slate-300
          "
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* LOADING */}

        {isLoading ? (
          <div className="flex gap-4 overflow-hidden px-1 py-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="
                  h-[340px] shrink-0 animate-pulse
                  rounded-[22px] bg-slate-100
                  w-[240px]
                  sm:w-[260px]
                  md:w-[280px]
                  lg:w-[300px]
                  xl:w-[320px]
                  dark:bg-slate-800
                "
              />
            ))}
          </div>
        ) : (
          <div
            ref={carouselRef}
            className="
              flex gap-4
              overflow-x-auto overflow-y-hidden
              px-1 py-3
              no-scrollbar
              scroll-smooth
              snap-x snap-mandatory
              touch-pan-x
              overscroll-x-contain
              [-webkit-overflow-scrolling:touch]
            "
          >
            {featured.map((doctor) => (
              <FeaturedDoctorCard
                key={doctor.id}
                doctor={doctor}
              />
            ))}
          </div>
        )}
      </div>

      {/* MOBILE VIEW ALL */}

      <div className="mt-4 text-center sm:hidden">
        <Link
          href="/doctors/featured"
          className="
            text-sm font-bold
            text-[#14B8A6]
            hover:text-[#0f8a7c]
          "
        >
          {t("viewAll") || "View All"}
          <ArrowRight className="ml-1 inline-block h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
