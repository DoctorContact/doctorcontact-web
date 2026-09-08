"use client";

import React, { useMemo, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { usePublicAllDoctors } from "@/lib/hooks/usePublicDirectory";
import SectionHeader from "@/components/SectionHeader";
import { ExtendedDoctor } from "@/types/doctor";

function initials(name?: string) {
  if (!name) return "DR";
  return name
    .replace(/^dr\.?\s*/i, "")
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function Avatar({ src, name }: { src?: string | null; name?: string }) {
  const [broken, setBroken] = useState(false);
  const showImg = src && !broken;
  return (
    <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-slate-100 shadow-sm">
      {showImg ? (
        <img
          src={src as string}
          alt={name || "Doctor"}
          onError={() => setBroken(true)}
          className="h-full w-full object-cover object-top"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1C63E7] to-[#3b82f6] text-base font-bold text-white">
          {initials(name)}
        </div>
      )}
    </div>
  );
}

export default function AllDoctors() {
  const t = useTranslations("HomePage");
  const { data, isLoading } = usePublicAllDoctors();
  const doctors = ((data as ExtendedDoctor[]) ?? []).filter((d) => d?.id);
  const [active, setActive] = useState("All");
  const scrollRef = useRef<HTMLDivElement>(null);

  const specialties = useMemo(() => {
    const set = new Set<string>();
    doctors.forEach((d) => d.specialization && set.add(d.specialization));
    return ["All", ...Array.from(set).slice(0, 10)];
  }, [doctors]);

  const filtered =
    active === "All" ? doctors : doctors.filter((d) => d.specialization === active);

  const scroll = (dir: "left" | "right") =>
    scrollRef.current?.scrollBy({ left: dir === "left" ? -280 : 280, behavior: "smooth" });

  if (!isLoading && doctors.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl border-b border-slate-100 px-5 py-6 lg:px-8 dark:border-soft-200">
      <SectionHeader
        title={t("allDoctors") || "All Doctors"}
        subtitle="Browse doctors from various specialities"
        viewAllHref="/doctors"
        viewAllLabel={t("viewAll") || "View All"}
      />

      {specialties.length > 1 && (
        <div className="mb-3.5 sm:mb-4 flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {specialties.map((spec) => (
            <button
              key={spec}
              onClick={() => setActive(spec)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                active === spec
                  ? "bg-[#1C63E7] text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-[#1C63E7]/40 hover:text-[#1C63E7] dark:border-soft-300 dark:bg-surface dark:text-ink-600"
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      )}

      <div className="relative group">
        <button
          onClick={() => scroll("left")}
          aria-label="Previous"
          className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md transition hover:bg-slate-50 hover:text-[#1C63E7] active:scale-95 dark:border-soft-300 dark:bg-surface"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => scroll("right")}
          aria-label="Next"
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md transition hover:bg-slate-50 hover:text-[#1C63E7] active:scale-95 dark:border-soft-300 dark:bg-surface"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {isLoading ? (
          <div className="flex gap-4 px-1 py-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-[9.5rem] w-44 shrink-0 animate-pulse rounded-2xl bg-slate-100 dark:bg-surface" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="px-1 py-6 text-sm text-slate-500">No doctors in “{active}”.</p>
        ) : (
          <div ref={scrollRef} className="flex gap-4 overflow-x-auto px-1 py-2 no-scrollbar scroll-smooth">
            {filtered.map((doctor) => (
              <Link
                key={doctor.id}
                href={`/doctors/${doctor.id}`}
                className="flex w-44 shrink-0 flex-col items-center rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#1C63E7]/40 hover:shadow-md dark:border-soft-300 dark:bg-surface"
              >
                <Avatar src={(doctor as any).profilePhoto || doctor.user?.avatar} name={doctor.user?.name} />
                <h4 className="mt-2.5 truncate max-w-full text-center text-xs font-bold text-[#0F1B33] dark:text-ink-900">
                  {doctor.user?.name || "Doctor"}
                </h4>
                <p className="mt-0.5 truncate max-w-full text-center text-[11px] font-medium text-slate-500 dark:text-ink-500">
                  {doctor.specialization || "General Physician"}
                </p>
                {doctor.rating != null && (
                  <div className="mt-1 flex items-center gap-1 text-[11px]">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-slate-800 dark:text-ink-800">{doctor.rating}</span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
