"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Star, Heart } from "lucide-react";
import { Link } from "@/i18n/routing";
import { usePublicFeaturedDoctors } from "@/lib/hooks/usePublicDirectory";
import SectionHeader from "@/components/SectionHeader";
import { ExtendedDoctor } from "@/types/doctor";

// High-fidelity fallback sample data matching Image 1
const FALLBACK_FEATURED = [
  {
    id: "sample-1",
    name: "Dr. Arindam Sen",
    specialization: "Cardiologist",
    experience: 10,
    rating: 4.8,
    reviews: 320,
    avatar: "/assets/home/doc1.jpg",
    available: true,
  },
  {
    id: "sample-2",
    name: "Dr. Priya Sharma",
    specialization: "Dermatologist",
    experience: 8,
    rating: 4.7,
    reviews: 280,
    avatar: "/assets/home/doc2.jpg",
    available: true,
  },
  {
    id: "sample-3",
    name: "Dr. Souvik Roy",
    specialization: "Pediatrician",
    experience: 12,
    rating: 4.9,
    reviews: 410,
    avatar: "/assets/home/doc3.jpg",
    available: true,
  },
  {
    id: "sample-4",
    name: "Dr. Ananya Das",
    specialization: "Gynecologist",
    experience: 9,
    rating: 4.6,
    reviews: 190,
    avatar: "/assets/home/doc4.jpg",
    available: true,
  },
];

function FeaturedDoctorCard({
  doctor,
  fallback,
}: {
  doctor?: ExtendedDoctor;
  fallback?: (typeof FALLBACK_FEATURED)[0];
}) {
  const [isFavorite, setIsFavorite] = useState(false);

  const id = doctor?.id || fallback?.id || "doc";
  const name = doctor?.user?.name || fallback?.name || "Dr. Medical Expert";
  const specialization = doctor?.specialization || fallback?.specialization || "General Physician";
  const experience = doctor?.experience ?? fallback?.experience ?? 8;
  const rating = doctor?.rating ?? fallback?.rating ?? 4.8;
  const reviews = doctor?.reviewCount ?? fallback?.reviews ?? 250;
  const avatar =
    (doctor as any)?.profilePhoto ||
    doctor?.user?.avatar ||
    fallback?.avatar ||
    "/assets/home/doc1.jpg";

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1 hover:border-[#1C63E7]/40 hover:shadow-[0_14px_30px_rgba(28,99,231,0.12)] dark:border-soft-300 dark:bg-surface">
      {/* Top Favorite Heart Button */}
      <button
        type="button"
        onClick={() => setIsFavorite(!isFavorite)}
        aria-label="Save to favorites"
        className="absolute right-3.5 top-3.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 text-slate-400 shadow-sm transition hover:bg-red-50 hover:text-red-500"
      >
        <Heart
          className={`h-4 w-4 transition-colors ${
            isFavorite ? "fill-red-500 text-red-500" : "text-slate-400"
          }`}
        />
      </button>

      {/* Doctor Photo */}
      <div className="mx-auto mt-2 h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-slate-100 shadow-sm">
        <img
          src={avatar}
          alt={name}
          className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Doctor Info */}
      <div className="mt-3 flex flex-col items-center text-center">
        <h3 className="truncate max-w-full text-[15px] font-bold text-[#0F1B33] dark:text-ink-900">
          {name}
        </h3>
        <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-ink-500">
          {specialization}
        </p>

        <p className="mt-1 text-[11px] font-medium text-slate-400">
          {experience}+ Years Experience
        </p>

        {/* Rating */}
        <div className="mt-1.5 flex items-center gap-1 text-xs">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="font-bold text-slate-800 dark:text-ink-800">{rating}</span>
          <span className="text-[11px] text-slate-400">({reviews} reviews)</span>
        </div>

        {/* Availability Badge */}
        <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-[#16A34A]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A] animate-pulse" />
          <span>Available Today</span>
        </div>
      </div>

      {/* Book Appointment Button */}
      <div className="mt-4 pt-1">
        <Link
          href={`/doctors/${id}`}
          className="block w-full rounded-xl bg-[#1C63E7] py-2.5 text-center text-xs font-bold text-white shadow-sm transition hover:bg-[#1550c4]"
        >
          Book Appointment
        </Link>
      </div>
    </div>
  );
}

export default function FeaturedDoctors() {
  const t = useTranslations("HomePage");
  const { data, isLoading } = usePublicFeaturedDoctors();
  const rawFeatured = (data as ExtendedDoctor[]) ?? [];

  // If live doctors are returned, use them. If less than 4, pad with high-res sample items
  const items =
    rawFeatured.length >= 4
      ? rawFeatured.slice(0, 4).map((d) => ({ doctor: d }))
      : rawFeatured.length > 0
        ? [
            ...rawFeatured.map((d) => ({ doctor: d })),
            ...FALLBACK_FEATURED.slice(rawFeatured.length, 4).map((f) => ({ fallback: f })),
          ]
        : FALLBACK_FEATURED.map((f) => ({ fallback: f }));

  return (
    <section className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
      <SectionHeader
        title={t("featuredDoctors") || "Featured Doctors"}
        subtitle="Top rated and most trusted doctors near you"
        viewAllHref="/doctors/featured"
        viewAllLabel={t("viewAll") || "View All"}
      />

      {/* 4 Cards Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item: any, idx) => (
          <FeaturedDoctorCard
            key={item.doctor?.id || item.fallback?.id || idx}
            doctor={item.doctor}
            fallback={item.fallback}
          />
        ))}
      </div>
    </section>
  );
}
