"use client";

import { useEffect, useRef, useState } from "react";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Star,
  Stethoscope,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import {
  usePublicFeaturedClinics,
  type PublicClinic,
} from "@/lib/hooks/usePublicDirectory";
import SectionHeader from "@/components/SectionHeader";

function getInitials(name?: string) {
  if (!name) return "CL";

  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/* =========================================================
   CLINIC IMAGE
========================================================= */

function ClinicImage({
  src,
  name,
}: {
  src?: string | null;
  name?: string;
}) {
  const [broken, setBroken] = useState(false);

  const showImage =
    typeof src === "string" &&
    src.trim().length > 0 &&
    !broken;

  return (
    <div className="relative h-[120px] w-full overflow-hidden bg-[#F1F5F9] sm:h-[145px] lg:h-[175px]">
      {showImage ? (
        <img loading="lazy" decoding="async"
          src={src as string}
          alt={name || "Clinic"}
          onError={() => setBroken(true)}
          className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#14B8A6] to-[#0D9488]">
          <Building2 className="h-7 w-7 text-white/90 sm:h-8 sm:w-8 lg:h-9 lg:w-9" />

          <span className="mt-1.5 text-[18px] font-extrabold tracking-wide text-white sm:text-[20px] lg:text-[24px]">
            {getInitials(name)}
          </span>
        </div>
      )}

      {/* Small image shade for better badge visibility */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/15 to-transparent sm:h-20" />
    </div>
  );
}

/* =========================================================
   FEATURED CLINIC CARD
========================================================= */

function FeaturedClinicCard({
  clinic,
}: {
  clinic: PublicClinic;
}) {
  const name = clinic.clinicName || "Clinic Center";

  const location =
    clinic.city || clinic.address
      ? `${clinic.city || "Dubrajpur"}${
          clinic.address ? `, ${clinic.address}` : ""
        }`
      : "Dubrajpur, Birbhum";

  const rating = (clinic as any).rating ?? 4.8;

  const doctorsCount =
    (clinic as any).doctorsCount ??
    (clinic as any).doctorCount ??
    8;

  const specialties =
    Array.isArray(clinic.specialties) &&
    clinic.specialties.length > 0
      ? clinic.specialties.slice(0, 2)
      : [];

  return (
    <Link
      href={`/clinics/${clinic.id}`}
      className="
        group
        block
        w-[224px]
        min-w-[224px]
        shrink-0
        rounded-[22px]
        bg-gradient-to-br
        from-[#252A67]
        via-[#3B4A8F]
        to-[#14B8A6]
        p-[3px]
        shadow-[0_6px_20px_rgba(15,27,51,0.08)]
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-[0_14px_32px_rgba(28,99,231,0.14)]
        active:scale-[0.995]
        sm:w-[270px]
        sm:min-w-[270px]
        sm:rounded-[24px]
        lg:w-[320px]
        lg:min-w-[320px]
        lg:rounded-[26px]
      "
    >
      {/* =================================================
          INNER CARD
         ================================================= */}

      <div className="overflow-hidden rounded-[19px] bg-white dark:bg-surface sm:rounded-[21px] lg:rounded-[23px]">
        {/* IMAGE */}
        <div className="relative">
          <ClinicImage src={clinic.logo} name={name} />

          {/* Doctors Badge — only here, no duplicates */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-lg bg-[#0D9488]/95 px-2 py-[4px] shadow-[0_2px_8px_rgba(0,0,0,0.12)] backdrop-blur-sm sm:bottom-2.5 sm:right-2.5 sm:px-2.5 sm:py-[5px]">
            <Stethoscope className="h-[10px] w-[10px] text-white sm:h-[12px] sm:w-[12px]" />

            <span className="text-[9px] font-extrabold leading-none text-white sm:text-[11px]">
              {doctorsCount} Doctors
            </span>
          </div>
        </div>

        {/* =================================================
            CONTENT
           ================================================= */}

        <div className="p-3 sm:p-3.5 lg:p-4">
          {/* Clinic Name */}
          <h3 className="truncate text-[13px] font-extrabold leading-[18px] text-[#0F1B33] dark:text-ink-900 sm:text-[14px] sm:leading-[20px] lg:text-[16px] lg:leading-[23px]">
            {name}
          </h3>

          {/* Location */}
          <div className="mt-1 flex min-w-0 items-center gap-[3px] sm:mt-1.5 sm:gap-[4px]">
            <MapPin className="h-[11px] w-[11px] shrink-0 text-[#16A34A] sm:h-[12px] sm:w-[12px] lg:h-[14px] lg:w-[14px]" />

            <span className="truncate text-[10px] leading-[15px] text-slate-500 dark:text-ink-500 sm:text-[11px] sm:leading-[16px] lg:text-[13px] lg:leading-[18px]">
              {location}
            </span>
          </div>

          {/* Specialty Tags */}
          {specialties.length > 0 && (
            <div className="mt-1.5 flex gap-1 overflow-hidden sm:mt-2 sm:gap-1.5">
              {specialties.map((tag) => (
                <span
                  key={tag}
                  className="
                    max-w-[96px]
                    truncate
                    rounded-[5px]
                    bg-[#F1F5F9]
                    px-1.5
                    py-[3px]
                    text-[9px]
                    font-semibold
                    leading-none
                    text-[#475569]
                    dark:bg-soft-100
                    dark:text-ink-600
                    sm:max-w-[120px]
                    sm:rounded-[6px]
                    sm:px-2
                    sm:py-1
                    sm:text-[10px]
                    lg:text-[11px]
                  "
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Divider + Footer */}
          <div className="mt-2.5 flex items-center justify-between border-t border-[#F1F5F9] pt-2 dark:border-soft-200 sm:mt-3 sm:pt-3">
            {/* Rating */}
            <div className="flex items-center gap-1 rounded-full bg-[#FEF9C3] px-1.5 py-[3px] sm:px-2 sm:py-1">
              <Star className="h-[11px] w-[11px] fill-[#EAB308] text-[#EAB308] sm:h-[13px] sm:w-[13px]" />

              <span className="text-[9px] font-extrabold leading-none text-[#A16207] sm:text-[11px]">
                {rating}
              </span>
            </div>

            {/* View */}
            <span className="flex items-center gap-[2px] text-[11px] font-bold leading-none text-[#1C63E7] sm:gap-[3px] sm:text-[13px]">
              View
              <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function FeaturedClinics() {
  const t = useTranslations("HomePage");

  const { data, isLoading } = usePublicFeaturedClinics();

  const featured = (data ?? []).filter((clinic) => clinic?.id);

  const scrollRef = useRef<HTMLDivElement>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  /* =======================================================
     UPDATE ARROW STATE
  ======================================================= */

  const updateScrollState = () => {
    const element = scrollRef.current;

    if (!element) return;

    const maxScroll = element.scrollWidth - element.clientWidth;

    setCanScrollLeft(element.scrollLeft > 5);
    setCanScrollRight(element.scrollLeft < maxScroll - 5);
  };

  /* =======================================================
     GET SCROLL STEP BASED ON SCREEN
  ======================================================= */

  const getScrollStep = () => {
    if (typeof window === "undefined") return 240;

    const width = window.innerWidth;

    if (width >= 1024) return 335; // lg — 320px card + 15px gap
    if (width >= 640) return 285; // sm — 270px card + 15px gap
    return 240; // mobile — 224px card + 16px gap
  };

  /* =======================================================
     MANUAL SCROLL
  ======================================================= */

  const scroll = (direction: "left" | "right") => {
    const element = scrollRef.current;

    if (!element) return;

    const amount = getScrollStep();

    element.scrollBy({
      left: direction === "right" ? amount : -amount,
      behavior: "smooth",
    });

    window.setTimeout(updateScrollState, 350);
  };

  /* =======================================================
     AUTO SWIPE — every 3s, pauses on hover (FIXED)
  ======================================================= */

  useEffect(() => {
    if (featured.length <= 1 || isHovered) return;

    const interval = setInterval(() => {
      if (!scrollRef.current) return;

      const current = scrollRef.current;
      const maxScroll = current.scrollWidth - current.clientWidth;
      const step = getScrollStep();
      const nextPosition = current.scrollLeft + step;

      if (nextPosition >= maxScroll - 10) {
        current.scrollTo({
          left: 0,
          behavior: "smooth",
        });
      } else {
        current.scrollBy({
          left: step,
          behavior: "smooth",
        });
      }

      window.setTimeout(updateScrollState, 400);
    }, 3000);

    return () => clearInterval(interval);
  }, [featured.length, isHovered]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (isLoading) {
    return (
      <section className="mx-auto max-w-7xl border-b border-slate-100 px-5 py-6 dark:border-soft-200 lg:px-8">
        <SectionHeader
          title={t("featuredClinics") || "Featured Clinics"}
          subtitle="Modern facilities & live token queues"
          viewAllHref="/clinics/featured"
          viewAllLabel={t("viewAll") || "View All"}
        />

        <div className="relative">
          <div className="flex gap-4 overflow-hidden px-1 py-1">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="
                  h-[235px]
                  w-[224px]
                  min-w-[224px]
                  animate-pulse
                  rounded-[22px]
                  bg-slate-100
                  dark:bg-surface
                  sm:h-[280px]
                  sm:w-[270px]
                  sm:min-w-[270px]
                  sm:rounded-[24px]
                  lg:h-[330px]
                  lg:w-[320px]
                  lg:min-w-[320px]
                  lg:rounded-[26px]
                "
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (featured.length === 0) {
    return null;
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section
      className="
        mx-auto
        max-w-7xl
        border-b
        border-slate-100
        px-5
        py-6
        dark:border-soft-200
        lg:px-8
      "
    >
      {/* SECTION HEADER */}

      <SectionHeader
        title={t("featuredClinics") || "Featured Clinics"}
        subtitle="Modern facilities & live token queues"
        viewAllHref="/clinics/featured"
        viewAllLabel={t("viewAll") || "View All"}
      />

      {/* =================================================
          CAROUSEL
         ================================================= */}

      <div
        className="group relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* LEFT BUTTON */}

        <button
          type="button"
          aria-label="Previous clinics"
          onClick={() => scroll("left")}
          disabled={!canScrollLeft}
          className="
            absolute
            left-0
            top-1/2
            z-20
            hidden
            h-10
            w-10
            -translate-x-1/2
            -translate-y-1/2
            items-center
            justify-center
            rounded-full
            border
            border-slate-200
            bg-white
            text-[#0F1B33]
            shadow-[0_6px_18px_rgba(15,23,42,0.12)]
            transition-all
            duration-200
            hover:scale-105
            hover:border-[#1C63E7]/30
            hover:text-[#1C63E7]
            disabled:pointer-events-none
            disabled:opacity-30
            md:flex
            dark:border-soft-300
            dark:bg-surface
            dark:text-ink-800
          "
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* RIGHT BUTTON */}

        <button
          type="button"
          aria-label="Next clinics"
          onClick={() => scroll("right")}
          disabled={!canScrollRight}
          className="
            absolute
            right-0
            top-1/2
            z-20
            hidden
            h-10
            w-10
            translate-x-1/2
            -translate-y-1/2
            items-center
            justify-center
            rounded-full
            border
            border-slate-200
            bg-white
            text-[#0F1B33]
            shadow-[0_6px_18px_rgba(15,23,42,0.12)]
            transition-all
            duration-200
            hover:scale-105
            hover:border-[#1C63E7]/30
            hover:text-[#1C63E7]
            disabled:pointer-events-none
            disabled:opacity-30
            md:flex
            dark:border-soft-300
            dark:bg-surface
            dark:text-ink-800
          "
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* SCROLL AREA */}

        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className="
            flex
            gap-4
            overflow-x-auto
            px-1
            py-2
            scroll-smooth
            no-scrollbar
            snap-x
            snap-mandatory
          "
        >
          {featured.slice(0, 12).map((clinic) => (
            <div key={clinic.id} className="snap-start">
              <FeaturedClinicCard clinic={clinic} />
            </div>
          ))}
        </div>

        {/* MOBILE SWIPE HINT */}

        {featured.length > 1 && (
          <div className="mt-1 flex justify-center md:hidden">
            <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 dark:bg-soft-100">
              <span className="text-[9px] font-semibold text-slate-400">
                Swipe to explore
              </span>

              <ChevronRight className="h-3 w-3 text-slate-400" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}