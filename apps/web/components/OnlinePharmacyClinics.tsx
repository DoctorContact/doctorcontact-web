"use client";

import React, { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, Building2, Pill } from "lucide-react";
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

function PharmacyCard({ clinic }: { clinic: PublicClinic }) {
  const [broken, setBroken] = useState(false);
  const name = clinic.clinicName || "Health Center";
  const location =
    [clinic.city, clinic.address].filter(Boolean).join(", ") || null;

  return (
    <Link
      href={`/clinics/${clinic.id}`}
      className="group block w-[calc((100vw-58px)/2)] min-w-[calc((100vw-58px)/2)] shrink-0 snap-start overflow-hidden rounded-[18px] border border-teal-100 bg-white shadow-[0_4px_18px_rgba(15,27,51,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(20,184,166,0.15)] sm:w-[190px] sm:min-w-[190px] md:w-[205px] md:min-w-[205px] lg:w-[225px] lg:min-w-[225px] xl:w-[235px] xl:min-w-[235px] dark:border-teal-900/40"
    >
      <div className="relative h-[135px] overflow-hidden bg-slate-100 sm:h-[140px] lg:h-[145px]">
        {clinic.logo && !broken ? (
          <img loading="lazy" decoding="async"
            src={clinic.logo}
            alt={name}
            onError={() => setBroken(true)}
            className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.05]"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#0F766E] via-[#14B8A6] to-[#1C63E7]">
            <Building2 className="h-8 w-8 text-white/80" />
            <span className="mt-1 text-lg font-extrabold text-white">
              {initials(name)}
            </span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/25" />
        <div className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full bg-[#0F766E]/95 px-2.5 py-1 text-[9px] font-bold text-white shadow-sm">
          <Pill className="h-3 w-3" />
          Delivery
        </div>
      </div>

      <div className="relative bg-white px-3.5 pb-3.5 pt-3 dark:bg-surface">
        <div className="absolute -top-[2px] left-3.5 h-[3px] w-8 rounded-full bg-gradient-to-r from-[#0F766E] to-[#14B8A6]" />
        <h3 className="truncate pt-0.5 text-[13px] font-extrabold leading-tight tracking-[-0.01em] text-[#0F1B33] dark:text-ink-900">
          {name}
        </h3>
        {location && (
          <div className="mt-1.5 flex min-w-0 items-center gap-1">
            <MapPin className="h-3 w-3 shrink-0 text-[#16A34A]" />
            <span className="truncate text-[9px] font-medium text-slate-500 dark:text-ink-500">
              {location}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

export default function OnlinePharmacyClinics() {
  const { data, isLoading } = usePublicAllClinics();
  const scrollRef = useRef<HTMLDivElement>(null);

  const clinics = ((data as PublicClinic[]) ?? []).filter(
    (clinic) => clinic?.id && clinic.onlinePharmacyEnabled,
  );

  const scroll = (direction: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollBy({
      left: direction === "right" ? 240 : -240,
      behavior: "smooth",
    });
  };

  if (isLoading || clinics.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl border-b border-slate-100 px-5 py-6 lg:px-8 dark:border-soft-200">
      <SectionHeader
        title="Online Pharmacy Delivery"
        subtitle="Clinics that deliver medicines to your home"
        viewAllHref="/clinics"
        viewAllLabel="View All"
      />

      <div className="relative">
        <button
          type="button"
          onClick={() => scroll("left")}
          aria-label="Previous"
          className="absolute -left-3 top-1/2 z-30 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-[0_5px_16px_rgba(15,27,51,0.14)] transition-all duration-200 hover:scale-105 hover:text-[#0F766E] active:scale-95 dark:border-soft-300 dark:bg-surface"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => scroll("right")}
          aria-label="Next"
          className="absolute -right-3 top-1/2 z-30 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-[0_5px_16px_rgba(15,27,51,0.14)] transition-all duration-200 hover:scale-105 hover:text-[#0F766E] active:scale-95 dark:border-soft-300 dark:bg-surface"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <div
          ref={scrollRef}
          className="no-scrollbar flex touch-pan-x snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-smooth px-1 py-2 [-webkit-overflow-scrolling:touch]"
        >
          {clinics.map((clinic) => (
            <PharmacyCard key={clinic.id} clinic={clinic} />
          ))}
        </div>
      </div>
    </section>
  );
}
