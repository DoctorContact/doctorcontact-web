"use client";

import React, { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { usePublicAllDoctors } from "@/lib/hooks/usePublicDirectory";
import SectionHeader from "@/components/SectionHeader";
import { ExtendedDoctor } from "@/types/doctor";

const SPECIALTIES = [
  "All",
  "General Physician",
  "Cardiologist",
  "Dermatologist",
  "Pediatrician",
  "Gynecologist",
  "Orthopedic",
  "ENT",
];

const FALLBACK_DOCTORS = [
  {
    id: "all-1",
    name: "Dr. Rahul Mehta",
    specialization: "General Physician",
    rating: 4.8,
    avatar: "/assets/home/doc1.jpg",
  },
  {
    id: "all-2",
    name: "Dr. Neha Kapoor",
    specialization: "Dermatologist",
    rating: 4.6,
    avatar: "/assets/home/doc2.jpg",
  },
  {
    id: "all-3",
    name: "Dr. Ayan Ghosh",
    specialization: "Orthopedic",
    rating: 4.7,
    avatar: "/assets/home/doc3.jpg",
  },
  {
    id: "all-4",
    name: "Dr. Ritu Singh",
    specialization: "Gynecologist",
    rating: 4.5,
    avatar: "/assets/home/doc4.jpg",
  },
  {
    id: "all-5",
    name: "Dr. Karan Patel",
    specialization: "ENT",
    rating: 4.4,
    avatar: "/assets/home/doc1.jpg",
  },
  {
    id: "all-6",
    name: "Dr. Ishita Roy",
    specialization: "Pediatrician",
    rating: 4.6,
    avatar: "/assets/home/doc2.jpg",
  },
];

export default function AllDoctors() {
  const t = useTranslations("HomePage");
  const { data } = usePublicAllDoctors();
  const rawDoctors = (data as ExtendedDoctor[]) ?? [];
  const [activeSpecialty, setActiveSpecialty] = useState("All");

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -280 : 280;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Merge live doctors with fallbacks to guarantee high aesthetic fidelity
  const displayDoctors =
    rawDoctors.length > 0
      ? rawDoctors.map((d, i) => ({
          id: d.id,
          name: d.user?.name || "Doctor",
          specialization: d.specialization || "General Physician",
          rating: d.rating || 4.7,
          avatar:
            (d as any).profilePhoto ||
            d.user?.avatar ||
            FALLBACK_DOCTORS[i % FALLBACK_DOCTORS.length].avatar,
        }))
      : FALLBACK_DOCTORS;

  const filtered =
    activeSpecialty === "All"
      ? displayDoctors
      : displayDoctors.filter(
          (d) => d.specialization.toLowerCase() === activeSpecialty.toLowerCase()
        );

  return (
    <section className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
      <SectionHeader
        title={t("allDoctors") || "All Doctors"}
        subtitle="Browse doctors from various specialities"
        viewAllHref="/doctors"
        viewAllLabel={t("viewAll") || "View All"}
      />

      {/* Specialty Filter Pills */}
      <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {SPECIALTIES.map((spec) => {
          const isActive = activeSpecialty === spec;
          return (
            <button
              key={spec}
              onClick={() => setActiveSpecialty(spec)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                isActive
                  ? "bg-[#1C63E7] text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-[#1C63E7]/40 hover:text-[#1C63E7] dark:border-soft-300 dark:bg-surface dark:text-ink-600"
              }`}
            >
              {spec}
            </button>
          );
        })}
      </div>

      {/* Carousel with Navigation Buttons */}
      <div className="relative group">
        {/* Left Arrow */}
        <button
          onClick={() => scroll("left")}
          aria-label="Previous"
          className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md transition hover:bg-slate-50 hover:text-[#1C63E7] active:scale-95 dark:border-soft-300 dark:bg-surface"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Right Arrow */}
        <button
          onClick={() => scroll("right")}
          aria-label="Next"
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md transition hover:bg-slate-50 hover:text-[#1C63E7] active:scale-95 dark:border-soft-300 dark:bg-surface"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Doctors Row */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto px-1 py-2 no-scrollbar scroll-smooth"
        >
          {filtered.map((doctor) => (
            <Link
              key={doctor.id}
              href={`/doctors/${doctor.id}`}
              className="flex w-44 shrink-0 flex-col items-center rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#1C63E7]/40 hover:shadow-md dark:border-soft-300 dark:bg-surface"
            >
              <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-slate-100 shadow-sm">
                <img
                  src={doctor.avatar}
                  alt={doctor.name}
                  className="h-full w-full object-cover object-top"
                />
              </div>

              <h4 className="mt-2.5 truncate max-w-full text-center text-xs font-bold text-[#0F1B33] dark:text-ink-900">
                {doctor.name}
              </h4>

              <p className="mt-0.5 truncate max-w-full text-center text-[11px] font-medium text-slate-500 dark:text-ink-500">
                {doctor.specialization}
              </p>

              <div className="mt-1 flex items-center gap-1 text-[11px]">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span className="font-bold text-slate-800 dark:text-ink-800">{doctor.rating}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
