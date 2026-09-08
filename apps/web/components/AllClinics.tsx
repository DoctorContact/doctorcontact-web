"use client";

import React, { useRef } from "react";
import { useTranslations } from "next-intl";
import { MapPin, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { usePublicAllClinics, type PublicClinic } from "@/lib/hooks/usePublicDirectory";
import SectionHeader from "@/components/SectionHeader";

const FALLBACK_ALL_CLINICS = [
  {
    id: "all-c1",
    clinicName: "Hope Clinic",
    city: "Dubrajpur",
    rating: 4.6,
    image: "/assets/home/clinic1.jpg",
  },
  {
    id: "all-c2",
    clinicName: "Care & Cure Clinic",
    city: "Suri Road",
    rating: 4.4,
    image: "/assets/home/clinic2.jpg",
  },
  {
    id: "all-c3",
    clinicName: "MedLife Clinic",
    city: "Dubrajpur",
    rating: 4.5,
    image: "/assets/home/clinic3.jpg",
  },
  {
    id: "all-c4",
    clinicName: "Health Point Clinic",
    city: "Santiniketan Road",
    rating: 4.3,
    image: "/assets/home/clinic4.jpg",
  },
  {
    id: "all-c5",
    clinicName: "Apollo Clinic",
    city: "Dubrajpur",
    rating: 4.6,
    image: "/assets/home/clinic1.jpg",
  },
];

export default function AllClinics() {
  const t = useTranslations("HomePage");
  const { data } = usePublicAllClinics();
  const rawClinics = data ?? [];

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -280 : 280;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const displayClinics =
    rawClinics.length > 0
      ? rawClinics.map((c, i) => ({
          id: c.id,
          clinicName: c.clinicName,
          city: c.city || c.address || "Dubrajpur",
          rating: (c as any).rating || 4.5,
          image:
            c.logo ||
            FALLBACK_ALL_CLINICS[i % FALLBACK_ALL_CLINICS.length].image,
        }))
      : FALLBACK_ALL_CLINICS;

  return (
    <section className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
      <SectionHeader
        title={t("allClinics") || "All Clinics"}
        subtitle="Explore all clinics near you"
        viewAllHref="/clinics"
        viewAllLabel={t("viewAll") || "View All"}
      />

      {/* Carousel with Left & Right Arrows */}
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

        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto px-1 py-2 no-scrollbar scroll-smooth"
        >
          {displayClinics.map((clinic) => (
            <Link
              key={clinic.id}
              href={`/clinics/${clinic.id}`}
              className="group flex w-60 shrink-0 items-center gap-3 rounded-2xl border border-slate-200/90 bg-white p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#1C63E7]/40 hover:shadow-md dark:border-soft-300 dark:bg-surface"
            >
              {/* Thumbnail */}
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                <img
                  src={clinic.image}
                  alt={clinic.clinicName}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* Text Info */}
              <div className="min-w-0 flex-1">
                <h4 className="truncate text-xs font-bold text-[#0F1B33] dark:text-ink-900">
                  {clinic.clinicName}
                </h4>

                <p className="mt-0.5 flex items-center gap-0.5 truncate text-[11px] text-slate-500 dark:text-ink-500">
                  <MapPin className="h-3 w-3 shrink-0 text-[#16A34A]" />
                  <span className="truncate">{clinic.city}</span>
                </p>

                <div className="mt-1 flex items-center gap-1 text-[11px]">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-slate-800 dark:text-ink-800">
                    {clinic.rating}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
