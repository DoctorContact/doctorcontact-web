
"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Star,
  Heart,
  BadgeCheck,
  MapPin,
  ChevronLeft,
  ChevronRight,
  BriefcaseBusiness,
  Sparkles,
} from "lucide-react";

import { Link } from "@/i18n/routing";
import { usePublicFeaturedDoctors } from "@/lib/hooks/usePublicDirectory";
import SectionHeader from "@/components/SectionHeader";
import { ExtendedDoctor } from "@/types/doctor";

const parseEnglishName = (rawName: string = "") => {
  const parts = rawName.split(" | ");
  return parts[0]?.trim() || rawName;
};

function initials(name?: string) {
  if (!name) return "DR";

  return parseEnglishName(name)
    .replace(/^dr\.?\s*/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function MarqueeText({
  text,
  className,
  minChars = 18,
}: {
  text: string;
  className?: string;
  minChars?: number;
}) {
  const isLong = text.length > minChars;

  if (!isLong) {
    return (
      <div className={`truncate whitespace-nowrap ${className ?? ""}`}>
        {text}
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden">
      <div
        className="flex w-max whitespace-nowrap motion-reduce:animate-none"
        style={{ animation: "marqueeScroll 10s linear infinite" }}
      >
        <span className={className}>{text}</span>
        <span className={`mx-4 opacity-0 ${className ?? ""}`}>|</span>
        <span className={className}>{text}</span>
        <span className={`mx-4 opacity-0 ${className ?? ""}`}>|</span>
      </div>
    </div>
  );
}

function FeaturedDoctorCard({ doctor }: { doctor: ExtendedDoctor }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [broken, setBroken] = useState(false);

  const rawName = doctor.user?.name || "Doctor";
  const englishName = parseEnglishName(rawName);
  const displayFullname = /^dr\.?\s*/i.test(englishName)
    ? englishName
    : `Dr. ${englishName}`;

  const specialization = doctor.specialization || "General Physician";
  const experience = doctor.experience ?? 0;
  const rating = doctor.rating ?? null;
  const avatar = (doctor as any).profilePhoto || doctor.user?.avatar || null;

  const city = parseEnglishName(doctor.clinic?.city || "");
  const clinicName = parseEnglishName(doctor.clinic?.clinicName || "");

  return (
    <div
      className="group relative shrink-0 snap-start rounded-[24px] p-[2px] bg-gradient-to-br from-[#252a67] via-[#3b4a8f] to-[#14B8A6] shadow-[0_7px_24px_rgba(37,42,103,0.16)] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_18px_38px_rgba(37,42,103,0.24)] motion-reduce:transform-none motion-reduce:transition-none h-[340px] w-[240px] min-w-[240px] sm:w-[260px] sm:min-w-[260px] md:w-[280px] md:min-w-[280px] lg:w-[300px] lg:min-w-[300px] xl:w-[320px] xl:min-w-[320px]"
    >
      <Link
        href={`/doctors/${doctor.id}`}
        className="relative flex h-full flex-col overflow-hidden rounded-[22px] bg-white dark:bg-surface"
      >
        {/* Premium top accent */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-1 bg-gradient-to-r from-[#252a67] via-[#6474c8] to-[#14B8A6]" />

        {/* Doctor photo */}
        <div className="relative h-[125px] shrink-0 overflow-hidden bg-slate-100 sm:h-[130px] lg:h-[135px] dark:bg-slate-800">
          {avatar && !broken ? (
            <img
              src={avatar}
              alt={displayFullname}
              loading="lazy"
              onError={() => setBroken(true)}
              className="h-full w-full object-contain p-2 transition-transform duration-700 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#252a67] via-[#3b4a8f] to-[#14B8A6]">
              <span className="text-3xl font-extrabold text-white">
                {initials(rawName)}
              </span>
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#10162e]/55 via-transparent to-[#10162e]/10" />

          {/* Featured marker */}
          <div className="absolute left-3 top-3 z-20">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-gradient-to-r from-[#252a67] to-[#3b4a8f] px-2.5 py-1 text-[9px] font-extrabold tracking-[0.13em] text-white shadow-lg ring-1 ring-white/20 backdrop-blur-md">
              <Sparkles className="h-3 w-3 text-teal-200" />
              FEATURED DOCTOR
            </span>
          </div>

          {/* Favorite button */}
          <button
            type="button"
            aria-label={
              isFavorite ? "Remove from favorites" : "Add to favorites"
            }
            aria-pressed={isFavorite}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setIsFavorite((previous) => !previous);
            }}
            className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white/60 bg-white/95 text-slate-500 shadow-md backdrop-blur transition-all duration-200 hover:scale-110 hover:text-rose-500 active:scale-95 dark:bg-slate-900/90"
          >
            <Heart
              className={`h-4 w-4 transition-all ${
                isFavorite
                  ? "scale-110 fill-rose-500 text-rose-500"
                  : ""
              }`}
            />
          </button>

          {/* Experience */}
          {experience > 0 && (
            <div className="absolute bottom-3 left-3 z-20">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-[#111827]/75 px-2.5 py-1.5 text-[10px] font-bold text-white shadow-md backdrop-blur-md">
                <BriefcaseBusiness className="h-3 w-3 text-teal-300" />
                {experience}+ Yrs Experience
              </span>
            </div>
          )}

          {/* Rating */}
          {rating != null && (
            <div className="absolute bottom-3 right-3 z-20 inline-flex items-center gap-1 rounded-lg border border-amber-200/70 bg-amber-300 px-2 py-1.5 text-[10px] font-extrabold text-amber-950 shadow-md">
              <Star className="h-3 w-3 fill-amber-950" />
              {rating}
            </div>
          )}
        </div>

        {/* Doctor details */}
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden px-3.5 pb-2.5 pt-2.5">
          <div className="absolute left-4 top-0 h-[3px] w-12 rounded-full bg-gradient-to-r from-[#252a67] to-[#14B8A6]" />

          {/* Doctor name */}
          <div className="flex items-start gap-2 pt-1">
            <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#3b4a8f] dark:text-teal-300" />

            <h3 className="min-w-0 flex-1 whitespace-normal break-words text-[15px] font-extrabold leading-snug tracking-[-0.025em] text-[#0F1B33] dark:text-ink-900 sm:text-base">
              {displayFullname}
            </h3>
          </div>

          {/* Specialization */}
          <p className="mt-1 whitespace-normal break-words pl-6 text-[11px] font-bold leading-snug text-[#3b4a8f] dark:text-teal-300 sm:text-xs">
            {specialization}
          </p>

          {/* Improved location section */}
          {(city || clinicName) && (
            <div className="mt-2 space-y-1.5">
              {/* City */}
              {city && (
                <div className="relative flex min-w-0 items-center gap-2.5 overflow-hidden rounded-xl border border-teal-100 bg-gradient-to-r from-[#F0FDFA] via-white to-[#F0F9FF] px-2.5 py-1.5 shadow-[0_2px_8px_rgba(20,184,166,0.06)] dark:border-teal-900/40 dark:from-slate-800 dark:via-slate-800/90 dark:to-slate-800">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#252a67] to-[#14B8A6] text-white shadow-sm">
                    <MapPin className="h-3.5 w-3.5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
                        Primary Location
                      </span>
                      <span className="h-1 w-1 rounded-full bg-[#14B8A6]" />
                    </div>

                    <div className="mt-0.5 min-w-0 overflow-hidden">
                      <MarqueeText
                        text={city}
                        minChars={25}
                        className="text-[12px] font-extrabold tracking-tight text-[#252a67] dark:text-teal-300"
                      />
                    </div>
                  </div>

                  <span className="shrink-0 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-1 text-[8px] font-bold text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-400">
                    CITY
                  </span>
                </div>
              )}

              {/* Clinic name */}
              {clinicName && clinicName !== city && (
                <div className="flex min-w-0 items-center gap-2.5 overflow-hidden rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-white to-slate-50 px-2.5 py-1.5 shadow-[0_2px_8px_rgba(37,42,103,0.05)] dark:border-indigo-900/40 dark:from-slate-800 dark:via-slate-800/90 dark:to-slate-800">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#252a67] to-[#6474c8] text-white shadow-sm">
                    <MapPin className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
                      Clinic
                    </p>

                    <p className="mt-0.5 break-words text-[11px] font-bold leading-snug text-[#252a67] dark:text-indigo-300">
                      {clinicName}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full border border-indigo-100 bg-indigo-50 px-2 py-1 text-[8px] font-bold text-indigo-700 dark:border-indigo-900/40 dark:bg-indigo-950/30 dark:text-indigo-300">
                    CLINIC
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Profile footer */}
          <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 pt-2 dark:border-slate-800">
            <span className="text-[9px] font-bold uppercase tracking-[0.13em] text-slate-400">
              Featured profile
            </span>

            <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-bold text-[#252a67] transition-colors group-hover:text-[#14B8A6] dark:text-teal-300">
              View profile
              <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function FeaturedDoctors() {
  const t = useTranslations("HomePage");
  const { data, isLoading } = usePublicFeaturedDoctors();

  const featured = ((data as ExtendedDoctor[]) ?? []).filter(
    (doctor) => doctor?.id
  );

  const carouselRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  const getScrollAmount = () => {
    if (typeof window === "undefined") return 332;

    const width = window.innerWidth;

    if (width < 640) return 252;
    if (width < 768) return 272;
    if (width < 1024) return 292;
    if (width < 1280) return 312;

    return 332;
  };

  const scroll = (direction: "left" | "right") => {
    const container = carouselRef.current;
    if (!container) return;

    const amount = getScrollAmount();

    container.scrollBy({
      left: direction === "right" ? amount : -amount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (isLoading || featured.length <= 2) return;

    const interval = window.setInterval(() => {
      if (isPaused) return;

      const container = carouselRef.current;
      if (!container) return;

      const maxScroll = container.scrollWidth - container.clientWidth;

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

  if (!isLoading && featured.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl border-b border-slate-100 px-5 py-6 lg:px-8 dark:border-soft-200">
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

      <SectionHeader
        title={t("featuredDoctors") || "Featured Doctors"}
        subtitle="Discover trusted doctors, highlighted for easier access"
        viewAllHref="/doctors/featured"
        viewAllLabel={t("viewAll") || "View All"}
      />

      <div
        className="relative mt-5"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Previous button */}
        <button
          type="button"
          onClick={() => scroll("left")}
          aria-label="Previous doctors"
          className="absolute -left-4 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-[#252a67] shadow-lg transition-all duration-200 hover:scale-105 hover:border-teal-300 hover:text-teal-600 active:scale-95 dark:border-slate-800 dark:bg-surface max-md:hidden"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Next button */}
        <button
          type="button"
          onClick={() => scroll("right")}
          aria-label="Next doctors"
          className="absolute -right-4 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-[#252a67] shadow-lg transition-all duration-200 hover:scale-105 hover:border-teal-300 hover:text-teal-600 active:scale-95 dark:border-slate-800 dark:bg-surface max-md:hidden"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Loading skeleton */}
        {isLoading ? (
          <div className="flex gap-3 overflow-hidden px-1 py-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-[340px] shrink-0 animate-pulse rounded-[24px] bg-slate-100 dark:bg-surface sm:h-[340px] lg:h-[340px] w-[240px] sm:w-[260px] md:w-[280px] lg:w-[300px] xl:w-[320px]"
              />
            ))}
          </div>
        ) : (
          <div
            ref={carouselRef}
            className="no-scrollbar flex snap-x snap-mandatory touch-pan-x gap-3 overflow-x-auto overflow-y-hidden overscroll-x-contain px-1 py-3 scroll-smooth [-webkit-overflow-scrolling:touch]"
          >
            {featured.map((doctor) => (
              <FeaturedDoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
