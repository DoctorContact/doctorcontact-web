"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MapPin, Star, Heart, Building2 } from "lucide-react";
import { Link } from "@/i18n/routing";
import { usePublicFeaturedClinics, type PublicClinic } from "@/lib/hooks/usePublicDirectory";
import SectionHeader from "@/components/SectionHeader";

function initials(name?: string) {
  if (!name) return "CL";
  return name.split(" ").filter(Boolean).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

function ClinicImage({ src, name }: { src?: string | null; name?: string }) {
  const [broken, setBroken] = useState(false);
  const showImg = src && !broken;

  return (
    <div className="relative h-40 w-full overflow-hidden bg-slate-100">
      {showImg ? (
        <img
          src={src as string}
          alt={name || "Clinic"}
          onError={() => setBroken(true)}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1C63E7] to-[#3b82f6]">
          <Building2 className="h-10 w-10 text-white/70" />
          <span className="ml-2 text-2xl font-bold text-white">{initials(name)}</span>
        </div>
      )}
    </div>
  );
}

function FeaturedClinicCard({ clinic }: { clinic: PublicClinic }) {
  const [isFavorite, setIsFavorite] = useState(false);

  const name = clinic.clinicName || "Clinic";
  const location = clinic.city || clinic.address || null;
  const rating = (clinic as any).rating ?? null;
  const reviews = (clinic as any).reviewCount ?? null;
  const tags = clinic.specialties && clinic.specialties.length > 0 ? clinic.specialties.slice(0, 2) : [];

  return (
    <Link
      href={`/clinics/${clinic.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1 hover:border-[#1C63E7]/40 hover:shadow-[0_14px_30px_rgba(28,99,231,0.12)] dark:border-soft-300 dark:bg-surface"
    >
      <ClinicImage src={clinic.logo} name={name} />
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setIsFavorite(!isFavorite);
        }}
        aria-label="Favorite clinic"
        className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-slate-400 shadow-sm backdrop-blur-sm transition hover:bg-white hover:text-red-500"
      >
        <Heart className={`h-4 w-4 transition-colors ${isFavorite ? "fill-red-500 text-red-500" : "text-slate-400"}`} />
      </button>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="truncate text-[15px] font-bold text-[#0F1B33] dark:text-ink-900">{name}</h3>

        {location && (
          <p className="mt-1 flex items-center gap-1 truncate text-xs text-slate-500 dark:text-ink-500">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[#16A34A]" />
            <span className="truncate">{location}</span>
          </p>
        )}

        {rating != null && (
          <div className="mt-1.5 flex items-center gap-1 text-xs">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="font-bold text-slate-800 dark:text-ink-800">{rating}</span>
            {reviews != null && <span className="text-[11px] text-slate-400">({reviews} reviews)</span>}
          </div>
        )}

        {tags.length > 0 && (
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
        )}
      </div>
    </Link>
  );
}

export default function FeaturedClinics() {
  const t = useTranslations("HomePage");
  const { data, isLoading } = usePublicFeaturedClinics();
  const featured = (data ?? []).filter((c) => c?.id);

  if (isLoading) {
    return (
      <section className="mx-auto max-w-7xl px-5 py-3.5 sm:py-4.5 lg:px-8">
        <SectionHeader title={t("featuredClinics") || "Featured Clinics"} subtitle="Top rated and most trusted clinics near you" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-slate-100 dark:bg-surface" />
          ))}
        </div>
      </section>
    );
  }

  if (featured.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-5 py-3.5 sm:py-4.5 lg:px-8">
      <SectionHeader
        title={t("featuredClinics") || "Featured Clinics"}
        subtitle="Top rated and most trusted clinics near you"
        viewAllHref="/clinics/featured"
        viewAllLabel={t("viewAll") || "View All"}
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {featured.slice(0, 8).map((clinic) => (
          <FeaturedClinicCard key={clinic.id} clinic={clinic} />
        ))}
      </div>
    </section>
  );
}
