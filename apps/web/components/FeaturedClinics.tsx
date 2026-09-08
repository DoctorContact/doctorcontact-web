"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MapPin, Star, Heart } from "lucide-react";
import { Link } from "@/i18n/routing";
import { usePublicFeaturedClinics, type PublicClinic } from "@/lib/hooks/usePublicDirectory";
import SectionHeader from "@/components/SectionHeader";

const FALLBACK_CLINICS = [
  {
    id: "clinic-1",
    clinicName: "City Care Clinic",
    city: "Dubrajpur",
    rating: 4.8,
    reviews: 320,
    tags: ["General Physician", "Diagnostics"],
    image: "/assets/home/clinic1.jpg",
  },
  {
    id: "clinic-2",
    clinicName: "LifeLine Health Clinic",
    city: "Suri Road",
    rating: 4.6,
    reviews: 190,
    tags: ["Cardiology", "Diabetes Care"],
    image: "/assets/home/clinic2.jpg",
  },
  {
    id: "clinic-3",
    clinicName: "WellCare Clinic",
    city: "Dubrajpur",
    rating: 4.7,
    reviews: 280,
    tags: ["Pediatrics", "Gynecology"],
    image: "/assets/home/clinic3.jpg",
  },
  {
    id: "clinic-4",
    clinicName: "Sunrise Clinic",
    city: "Santiniketan Road",
    rating: 4.5,
    reviews: 160,
    tags: ["Dermatology", "ENT"],
    image: "/assets/home/clinic4.jpg",
  },
];

function FeaturedClinicCard({
  clinic,
  fallback,
}: {
  clinic?: PublicClinic;
  fallback?: (typeof FALLBACK_CLINICS)[0];
}) {
  const [isFavorite, setIsFavorite] = useState(false);

  const id = clinic?.id || fallback?.id || "clinic";
  const name = clinic?.clinicName || fallback?.clinicName || "Care Clinic";
  const location = clinic?.city || clinic?.address || fallback?.city || "Dubrajpur";
  const rating = (clinic as any)?.rating ?? fallback?.rating ?? 4.7;
  const reviews = (clinic as any)?.reviewCount ?? fallback?.reviews ?? 220;
  const image =
    clinic?.logo || fallback?.image || "/assets/home/clinic1.jpg";
  const tags =
    clinic?.specialties && clinic.specialties.length > 0
      ? clinic.specialties.slice(0, 2)
      : fallback?.tags || ["General Physician", "Diagnostics"];

  return (
    <Link
      href={`/clinics/${id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1 hover:border-[#1C63E7]/40 hover:shadow-[0_14px_30px_rgba(28,99,231,0.12)] dark:border-soft-300 dark:bg-surface"
    >
      {/* Top Clinic Photo */}
      <div className="relative h-40 w-full overflow-hidden bg-slate-100">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Favorite Heart Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setIsFavorite(!isFavorite);
          }}
          aria-label="Favorite clinic"
          className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-slate-400 shadow-sm backdrop-blur-sm transition hover:bg-white hover:text-red-500"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              isFavorite ? "fill-red-500 text-red-500" : "text-slate-400"
            }`}
          />
        </button>
      </div>

      {/* Clinic Details */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="truncate text-[15px] font-bold text-[#0F1B33] dark:text-ink-900">
          {name}
        </h3>

        <p className="mt-1 flex items-center gap-1 truncate text-xs text-slate-500 dark:text-ink-500">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-[#16A34A]" />
          <span className="truncate">{location}</span>
        </p>

        {/* Rating */}
        <div className="mt-1.5 flex items-center gap-1 text-xs">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="font-bold text-slate-800 dark:text-ink-800">{rating}</span>
          <span className="text-[11px] text-slate-400">({reviews} reviews)</span>
        </div>

        {/* Tags */}
        <div className="mt-3 flex flex-wrap gap-1.5 pt-1">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-600 dark:bg-soft-100 dark:text-ink-600"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

export default function FeaturedClinics() {
  const t = useTranslations("HomePage");
  const { data } = usePublicFeaturedClinics();
  const rawFeatured = data ?? [];

  const items =
    rawFeatured.length >= 4
      ? rawFeatured.slice(0, 4).map((c) => ({ clinic: c }))
      : rawFeatured.length > 0
        ? [
            ...rawFeatured.map((c) => ({ clinic: c })),
            ...FALLBACK_CLINICS.slice(rawFeatured.length, 4).map((f) => ({ fallback: f })),
          ]
        : FALLBACK_CLINICS.map((f) => ({ fallback: f }));

  return (
    <section className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
      <SectionHeader
        title={t("featuredClinics") || "Featured Clinics"}
        subtitle="Top rated and most trusted clinics near you"
        viewAllHref="/clinics/featured"
        viewAllLabel={t("viewAll") || "View All"}
      />

      {/* 4 Cards Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item: any, idx) => (
          <FeaturedClinicCard
            key={item.clinic?.id || item.fallback?.id || idx}
            clinic={item.clinic}
            fallback={item.fallback}
          />
        ))}
      </div>
    </section>
  );
}
