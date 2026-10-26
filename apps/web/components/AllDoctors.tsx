"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Star,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { usePublicAllDoctors } from "@/lib/hooks/usePublicDirectory";
import SectionHeader from "@/components/SectionHeader";
import { ExtendedDoctor } from "@/types/doctor";

/* =========================================================
   HELPERS
========================================================= */

// ছবির ইনিশিয়ালের জন্য শুধু ইংরেজি নামটা বের করার হেল্পার
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
   AUTO SCROLLING TEXT COMPONENT (MARQUEE)
========================================================= */
const MarqueeText = ({ 
  text, 
  className, 
  minChars = 18 
}: { 
  text: string; 
  className?: string; 
  minChars?: number 
}) => {
  const isLong = text.length > minChars;

  if (!isLong) {
    return <div className={`truncate whitespace-nowrap ${className}`}>{text}</div>;
  }

  return (
    <div className="w-full overflow-hidden">
      <div 
        className="flex w-max whitespace-nowrap" 
        style={{ animation: 'marqueeScroll 10s linear infinite' }}
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
   DOCTOR CARD (Now exactly matches ClinicCard dimensions)
========================================================= */

function AllDoctorCard({ doctor }: { doctor: ExtendedDoctor }) {
  // পুরো ৩ ভাষার নামটাই নেব, যাতে স্ক্রল করার সময় পুরোটাই দেখায়
  const rawName = doctor.user?.name || "Doctor";
  const displayFullname = rawName.toLowerCase().startsWith("dr") ? rawName : `Dr. ${rawName}`;
  
  const specialization = doctor.specialization || "General Physician";
  const avatar = (doctor as any).profilePhoto || doctor.user?.avatar || null;
  const rating = doctor.rating ?? null;
  const location = doctor.clinic?.city || parseEnglishName(doctor.clinic?.clinicName) || null;
  const fee = (doctor as any).consultationFee ?? (doctor as any).consultationFees ?? (doctor as any).fee ?? null;

  const [broken, setBroken] = useState(false);

  return (
    <Link
      href={`/doctors/${doctor.id}`}
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
        dark:bg-surface
        dark:border-soft-200
      "
    >
      {/* ================= IMAGE ================= */}
      <div className="relative h-[135px] overflow-hidden bg-slate-100 sm:h-[140px] lg:h-[145px]">
        {avatar && !broken ? (
          <img
            src={avatar}
            alt={rawName}
            onError={() => setBroken(true)}
            className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.05]"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#1C63E7] via-[#3156A5] to-[#14B8A6]">
            <span className="text-2xl font-extrabold text-white">{initials(rawName)}</span>
          </div>
        )}
        
        {/* Image overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/30" />
        
        {/* Rating Badge */}
        {rating != null && (
          <div className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full border border-white/25 bg-[#0F1B33]/70 px-2 py-1 text-[9px] font-bold text-white shadow-sm backdrop-blur-md">
            <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" /> {rating}
          </div>
        )}
      </div>

      {/* ================= DOCTOR INFO ================= */}
      <div className="relative bg-white px-3.5 pb-3.5 pt-3 dark:bg-surface">
        {/* Small accent */}
        <div className="absolute -top-[2px] left-3.5 h-[3px] w-8 rounded-full bg-gradient-to-r from-[#1C63E7] to-[#14B8A6]" />
        
        {/* Doctor Name - 🟢 Marquee (Auto Scrolls if Long) */}
        <div className="w-full overflow-hidden pt-0.5">
          <MarqueeText 
            text={displayFullname} 
            minChars={18}
            className="text-[13px] font-extrabold leading-tight tracking-[-0.01em] text-[#0F1B33] dark:text-ink-900" 
          />
        </div>

        {/* Specialization */}
        <p className="mt-1 text-[10px] font-bold text-[#1C63E7] dark:text-indigo-500 truncate">
          {specialization}
        </p>

        {/* Location */}
        {location && (
          <div className="mt-1.5 flex min-w-0 items-center gap-1">
            <MapPin className="h-3 w-3 shrink-0 text-[#16A34A]" />
            <span className="truncate text-[9px] font-medium text-slate-500 dark:text-ink-500">{location}</span>
          </div>
        )}

        {/* Fee Section (replaces specialties tags from ClinicCard) */}
        {fee != null && (
          <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 dark:border-soft-200">
            <span className="text-[10px] font-medium text-slate-500 dark:text-ink-500">Consultation</span>
            <span className="text-[11px] font-extrabold text-[#0F1B33] dark:text-ink-900">₹{fee}</span>
          </div>
        )}
      </div>
    </Link>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function AllDoctors() {
  const t = useTranslations("HomePage");

  const { data, isLoading } = usePublicAllDoctors();
  const doctors = ((data as ExtendedDoctor[]) ?? []).filter((doctor) => doctor?.id);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState("All");
  const [isPaused, setIsPaused] = useState(false);

  /* ===============================
     SPECIALTIES
  =============================== */
  const specialties = useMemo(() => {
    const set = new Set<string>();
    doctors.forEach((doctor) => {
      if (doctor.specialization) set.add(doctor.specialization);
    });
    return ["All", ...Array.from(set).slice(0, 10)];
  }, [doctors]);

  /* ===============================
     FILTER
  =============================== */
  const filteredDoctors = useMemo(() => {
    if (active === "All") return doctors;
    return doctors.filter((doctor) => doctor.specialization === active);
  }, [doctors, active]);

  /* ===============================
     GET CARD WIDTH
  =============================== */
  const getScrollAmount = () => {
    const width = window.innerWidth;
    if (width < 640) return 190;
    if (width < 768) return 205;
    if (width < 1024) return 220;
    if (width < 1280) return 240;
    return 250;
  };

  /* ===============================
     MANUAL SWIPE
  =============================== */
  const scroll = (direction: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;
    const amount = getScrollAmount();
    container.scrollBy({
      left: direction === "right" ? amount : -amount,
      behavior: "smooth",
    });
  };

  /* ===============================
     AUTO SWIPE
  =============================== */
  useEffect(() => {
    if (isLoading || filteredDoctors.length <= 2) return;

    const interval = window.setInterval(() => {
      if (isPaused) return;

      const container = scrollRef.current;
      if (!container) return;

      const maxScroll = container.scrollWidth - container.clientWidth;

      if (container.scrollLeft >= maxScroll - 10) {
        container.scrollTo({ left: 0, behavior: "smooth" });
        return;
      }

      container.scrollBy({
        left: getScrollAmount(),
        behavior: "smooth",
      });
    }, 3000);

    return () => window.clearInterval(interval);
  }, [isLoading, filteredDoctors.length, isPaused]);

  if (!isLoading && doctors.length === 0) {
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
      {/* 🟢 CSS Animation block added globally for the marquee text */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marqueeScroll {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}} />

      {/* ================= HEADER ================= */}
      <SectionHeader
        title={t("allDoctors") || "All Doctors"}
        subtitle="Browse doctors across specialities"
        viewAllHref="/doctors"
        viewAllLabel={t("viewAll") || "View All"}
      />

      {/* ================= SPECIALTY FILTER ================= */}
      {specialties.length > 1 && (
        <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {specialties.map((specialty) => {
            const selected = active === specialty;
            return (
              <button
                key={specialty}
                type="button"
                onClick={() => {
                  setActive(specialty);
                  requestAnimationFrame(() => {
                    scrollRef.current?.scrollTo({ left: 0, behavior: "smooth" });
                  });
                }}
                className={`
                  shrink-0 rounded-full px-4 py-2 text-[11px] font-bold transition-all duration-200
                  ${
                    selected
                      ? "bg-[#1C63E7] text-white shadow-[0_5px_14px_rgba(28,99,231,0.20)]"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-[#1C63E7]/40 hover:text-[#1C63E7] dark:border-soft-300 dark:bg-surface dark:text-ink-600"
                  }
                `}
              >
                {specialty}
              </button>
            );
          })}
        </div>
      )}

      {/* ================= CAROUSEL ================= */}
      <div
        className="relative"
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
          aria-label="Next doctors"
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
            {filteredDoctors.map((doctor) => (
              <AllDoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}