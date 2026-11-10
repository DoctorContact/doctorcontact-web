"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Building2,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import {
  usePublicAllClinics,
  type PublicClinic,
} from "@/lib/hooks/usePublicDirectory";
import SectionHeader from "@/components/SectionHeader";

function initials(name?: string) {
  if (!name) return "CL";

  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function ClinicCard({ clinic }: { clinic: PublicClinic }) {
  const [broken, setBroken] = useState(false);

  const name = clinic.clinicName || "Health Center";
  const city = clinic.city || null;
  const address = clinic.address || null;
  const location = [city, address].filter(Boolean).join(", ") || null;
  const image = clinic.logo;

  const doctorsCount =
    typeof clinic.doctorsCount === "number"
      ? clinic.doctorsCount
      : null;

  const specialties = clinic.specialties?.slice(0, 2) || [];

  return (
    <Link
      href={`/clinics/${clinic.id}`}
      className="
        group
        block
        w-[calc((100vw-58px)/2)]
        min-w-[calc((100vw-58px)/2)]
        shrink-0
        snap-start
        overflow-hidden
        rounded-[18px]
        border
        border-slate-200/80
        bg-white
        shadow-[0_4px_18px_rgba(15,27,51,0.06)]
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-[#1C63E7]/25
        hover:shadow-[0_12px_30px_rgba(28,99,231,0.12)]
        sm:w-[190px]
        sm:min-w-[190px]
        md:w-[205px]
        md:min-w-[205px]
        lg:w-[225px]
        lg:min-w-[225px]
        xl:w-[235px]
        xl:min-w-[235px]
      "
    >
      {/* ================= IMAGE ================= */}

      <div
        className="
          relative
          h-[135px]
          overflow-hidden
          bg-slate-100
          sm:h-[140px]
          lg:h-[145px]
        "
      >
        {image && !broken ? (
          <img loading="lazy" decoding="async"
            src={image}
            alt={name}
            onError={() => setBroken(true)}
            className="
              h-full
              w-full
              object-cover
              object-center
              transition-transform
              duration-700
              group-hover:scale-[1.05]
            "
          />
        ) : (
          <div
            className="
              flex
              h-full
              w-full
              flex-col
              items-center
              justify-center
              bg-gradient-to-br
              from-[#1C63E7]
              via-[#3156A5]
              to-[#14B8A6]
            "
          >
            <Building2 className="h-8 w-8 text-white/80" />

            <span className="mt-1 text-lg font-extrabold text-white">
              {initials(name)}
            </span>
          </div>
        )}

        {/* Image overlay */}
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-gradient-to-b
            from-black/5
            via-transparent
            to-black/25
          "
        />

        {/* Doctors badge */}
        {doctorsCount !== null && (
          <div
            className="
              absolute
              right-2.5
              top-2.5
              rounded-full
              border
              border-white/25
              bg-[#0F1B33]/70
              px-2.5
              py-1
              text-[9px]
              font-bold
              text-white
              shadow-sm
              backdrop-blur-md
            "
          >
            {doctorsCount} Doctors
          </div>
        )}
      </div>

      {/* ================= CLINIC INFO ================= */}

      <div className="relative bg-white px-3.5 pb-3.5 pt-3 dark:bg-surface">
        {/* Small accent */}
        <div
          className="
            absolute
            -top-[2px]
            left-3.5
            h-[3px]
            w-8
            rounded-full
            bg-gradient-to-r
            from-[#1C63E7]
            to-[#14B8A6]
          "
        />

        {/* Clinic name */}
        <h3
          className="
            truncate
            pt-0.5
            text-[13px]
            font-extrabold
            leading-tight
            tracking-[-0.01em]
            text-[#0F1B33]
            dark:text-ink-900
          "
        >
          {name}
        </h3>

        {/* Location */}
        {location && (
          <div className="mt-1.5 flex min-w-0 items-center gap-1">
            <MapPin
              className="
                h-3
                w-3
                shrink-0
                text-[#16A34A]
              "
            />

            <span
              className="
                truncate
                text-[9px]
                font-medium
                text-slate-500
                dark:text-ink-500
              "
            >
              {location}
            </span>
          </div>
        )}

        {/* Specialty tags */}
        {specialties.length > 0 && (
          <div className="mt-2 flex gap-1.5 overflow-hidden">
            {specialties.map((tag) => (
              <span
                key={tag}
                className="
                  max-w-[48%]
                  truncate
                  rounded-md
                  bg-slate-100
                  px-2
                  py-1
                  text-[8px]
                  font-semibold
                  text-slate-600
                  dark:bg-soft-100
                  dark:text-ink-600
                "
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

export default function AllClinics() {
  const t = useTranslations("HomePage");

  const { data, isLoading } = usePublicAllClinics();

  const clinics = ((data as PublicClinic[]) ?? []).filter(
    (clinic) => clinic?.id
  );

  const scrollRef = useRef<HTMLDivElement>(null);

  const [isPaused, setIsPaused] = useState(false);

  /*
   * ===============================
   * GET CARD WIDTH
   * ===============================
   */

  const getScrollAmount = () => {
    const width = window.innerWidth;

    if (width < 640) return 190;
    if (width < 768) return 205;
    if (width < 1024) return 220;
    if (width < 1280) return 240;

    return 250;
  };

  /*
   * ===============================
   * MANUAL SWIPE
   * ===============================
   */

  const scroll = (direction: "left" | "right") => {
    const container = scrollRef.current;

    if (!container) return;

    const amount = getScrollAmount();

    container.scrollBy({
      left: direction === "right" ? amount : -amount,
      behavior: "smooth",
    });
  };

  /*
   * ===============================
   * AUTO SWIPE
   * EVERY 3 SECONDS
   * ===============================
   */

  useEffect(() => {
    if (isLoading || clinics.length <= 2) return;

    const interval = window.setInterval(() => {
      if (isPaused) return;

      const container = scrollRef.current;

      if (!container) return;

      const maxScroll =
        container.scrollWidth - container.clientWidth;

      /*
       * When reaching the end,
       * smoothly return to the beginning.
       */
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

    return () => {
      window.clearInterval(interval);
    };
  }, [isLoading, clinics.length, isPaused]);

  /*
   * ===============================
   * PAUSE WHILE USER INTERACTS
   * ===============================
   */

  const handlePointerEnter = () => {
    setIsPaused(true);
  };

  const handlePointerLeave = () => {
    setIsPaused(false);
  };

  if (!isLoading && clinics.length === 0) {
    return null;
  }

  return (
    <section
      className="
        mx-auto
        max-w-7xl
        border-b
        border-slate-100
        px-5
        py-6
        lg:px-8
        dark:border-soft-200
      "
    >
      {/* ================= HEADER ================= */}

      <SectionHeader
        title={t("allClinics") || "All Clinics"}
        subtitle="Complete clinic directory near you"
        viewAllHref="/clinics"
        viewAllLabel={t("viewAll") || "View All"}
      />

      {/* ================= CAROUSEL ================= */}

      <div
        className="relative"
        onMouseEnter={handlePointerEnter}
        onMouseLeave={handlePointerLeave}
      >
        {/* LEFT BUTTON */}

        <button
          type="button"
          onClick={() => scroll("left")}
          aria-label="Previous clinics"
          className="
            absolute
            -left-3
            top-1/2
            z-30
            flex
            h-8
            w-8
            -translate-y-1/2
            items-center
            justify-center
            rounded-full
            border
            border-slate-200
            bg-white
            text-slate-600
            shadow-[0_5px_16px_rgba(15,27,51,0.14)]
            transition-all
            duration-200
            hover:scale-105
            hover:border-[#1C63E7]/30
            hover:text-[#1C63E7]
            active:scale-95
            dark:border-soft-300
            dark:bg-surface
          "
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* RIGHT BUTTON */}

        <button
          type="button"
          onClick={() => scroll("right")}
          aria-label="Next clinics"
          className="
            absolute
            -right-3
            top-1/2
            z-30
            flex
            h-8
            w-8
            -translate-y-1/2
            items-center
            justify-center
            rounded-full
            border
            border-slate-200
            bg-white
            text-slate-600
            shadow-[0_5px_16px_rgba(15,27,51,0.14)]
            transition-all
            duration-200
            hover:scale-105
            hover:border-[#1C63E7]/30
            hover:text-[#1C63E7]
            active:scale-95
            dark:border-soft-300
            dark:bg-surface
          "
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* ================= LOADING ================= */}

        {isLoading ? (
          <div className="flex gap-3 overflow-hidden px-1 py-2">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="
                  h-[220px]
                  w-[calc((100vw-58px)/2)]
                  shrink-0
                  animate-pulse
                  rounded-[18px]
                  bg-slate-100
                  sm:w-[190px]
                  md:w-[205px]
                  lg:w-[225px]
                  xl:w-[235px]
                  dark:bg-surface
                "
              />
            ))}
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="
              flex
              gap-3
              overflow-x-auto
              overflow-y-hidden
              px-1
              py-2
              no-scrollbar
              scroll-smooth
              snap-x
              snap-mandatory
              touch-pan-x
              overscroll-x-contain
              [-webkit-overflow-scrolling:touch]
            "
          >
            {clinics.map((clinic) => (
              <ClinicCard
                key={clinic.id}
                clinic={clinic}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}