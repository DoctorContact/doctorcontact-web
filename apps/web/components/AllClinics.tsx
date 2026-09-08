"use client";

import React, { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { MapPin, Star, ChevronLeft, ChevronRight, Building2 } from "lucide-react";
import { Link } from "@/i18n/routing";
import { usePublicAllClinics, type PublicClinic } from "@/lib/hooks/usePublicDirectory";
import SectionHeader from "@/components/SectionHeader";

function initials(name?: string) {
  if (!name) return "CL";
  return name.split(" ").filter(Boolean).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

function Thumb({ src, name }: { src?: string | null; name?: string }) {
  const [broken, setBroken] = useState(false);
  const showImg = src && !broken;
  return (
    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
      {showImg ? (
        <img
          src={src as string}
          alt={name || "Clinic"}
          onError={() => setBroken(true)}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1C63E7] to-[#3b82f6] text-xs font-bold text-white">
          {initials(name)}
        </div>
      )}
    </div>
  );
}

export default function AllClinics() {
  const t = useTranslations("HomePage");
  const { data, isLoading } = usePublicAllClinics();
  const clinics = ((data as PublicClinic[]) ?? []).filter((c) => c?.id);

  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: "left" | "right") =>
    scrollRef.current?.scrollBy({ left: dir === "left" ? -280 : 280, behavior: "smooth" });

  if (!isLoading && clinics.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-5 py-3.5 sm:py-4.5 lg:px-8">
      <SectionHeader
        title={t("allClinics") || "All Clinics"}
        subtitle="Explore all clinics near you"
        viewAllHref="/clinics"
        viewAllLabel={t("viewAll") || "View All"}
      />

      <div className="relative group">
        <button
          onClick={() => scroll("left")}
          aria-label="Previous clinics"
          className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md transition hover:bg-slate-50 hover:text-[#1C63E7] active:scale-95 dark:border-soft-300 dark:bg-surface"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => scroll("right")}
          aria-label="Next clinics"
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md transition hover:bg-slate-50 hover:text-[#1C63E7] active:scale-95 dark:border-soft-300 dark:bg-surface"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {isLoading ? (
          <div className="flex gap-4 px-1 py-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-[5.75rem] w-60 shrink-0 animate-pulse rounded-2xl bg-slate-100 dark:bg-surface" />
            ))}
          </div>
        ) : (
          <div ref={scrollRef} className="flex gap-4 overflow-x-auto px-1 py-2 no-scrollbar scroll-smooth">
            {clinics.map((clinic) => {
              const city = clinic.city || clinic.address || null;
              const rating = (clinic as any).rating ?? null;
              return (
                <Link
                  key={clinic.id}
                  href={`/clinics/${clinic.id}`}
                  className="group flex w-60 shrink-0 items-center gap-3 rounded-2xl border border-slate-200/90 bg-white p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#1C63E7]/40 hover:shadow-md dark:border-soft-300 dark:bg-surface"
                >
                  <Thumb src={clinic.logo} name={clinic.clinicName} />
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate text-xs font-bold text-[#0F1B33] dark:text-ink-900">{clinic.clinicName}</h4>
                    {city && (
                      <p className="mt-0.5 flex items-center gap-0.5 truncate text-[11px] text-slate-500 dark:text-ink-500">
                        <MapPin className="h-3 w-3 shrink-0 text-[#16A34A]" />
                        <span className="truncate">{city}</span>
                      </p>
                    )}
                    {rating != null ? (
                      <div className="mt-1 flex items-center gap-1 text-[11px]">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-slate-800 dark:text-ink-800">{rating}</span>
                      </div>
                    ) : (
                      typeof clinic.doctorsCount === "number" && (
                        <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
                          <Building2 className="h-3 w-3" />
                          {clinic.doctorsCount} doctor{clinic.doctorsCount === 1 ? "" : "s"}
                        </p>
                      )
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
