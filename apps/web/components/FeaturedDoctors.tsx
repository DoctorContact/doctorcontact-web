"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Star, Heart } from "lucide-react";
import { Link } from "@/i18n/routing";
import { usePublicFeaturedDoctors } from "@/lib/hooks/usePublicDirectory";
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

function DoctorAvatar({ src, name }: { src?: string | null; name?: string }) {
  const [broken, setBroken] = useState(false);
  const showImg = src && !broken;

  return (
    <div className="mx-auto mt-2 h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-slate-100 shadow-sm">
      {showImg ? (
        <img
          src={src as string}
          alt={name || "Doctor"}
          onError={() => setBroken(true)}
          className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1C63E7] to-[#3b82f6] text-2xl font-bold text-white">
          {initials(name)}
        </div>
      )}
    </div>
  );
}

function FeaturedDoctorCard({ doctor }: { doctor: ExtendedDoctor }) {
  const [isFavorite, setIsFavorite] = useState(false);

  const name = doctor.user?.name || "Doctor";
  const specialization = doctor.specialization || "General Physician";
  const experience = doctor.experience ?? 0;
  const rating = doctor.rating ?? null;
  const reviews = doctor.reviewCount ?? null;
  const avatar = (doctor as any).profilePhoto || doctor.user?.avatar || null;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1 hover:border-[#1C63E7]/40 hover:shadow-[0_14px_30px_rgba(28,99,231,0.12)] dark:border-soft-300 dark:bg-surface">
      <button
        type="button"
        onClick={() => setIsFavorite(!isFavorite)}
        aria-label="Save to favorites"
        className="absolute right-3.5 top-3.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 text-slate-400 shadow-sm transition hover:bg-red-50 hover:text-red-500"
      >
        <Heart className={`h-4 w-4 transition-colors ${isFavorite ? "fill-red-500 text-red-500" : "text-slate-400"}`} />
      </button>

      <DoctorAvatar src={avatar} name={name} />

      <div className="mt-3 flex flex-col items-center text-center">
        <h3 className="truncate max-w-full text-[15px] font-bold text-[#0F1B33] dark:text-ink-900">{name}</h3>
        <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-ink-500">{specialization}</p>

        {experience > 0 && (
          <p className="mt-1 text-[11px] font-medium text-slate-400">{experience}+ Years Experience</p>
        )}

        {rating != null && (
          <div className="mt-1.5 flex items-center gap-1 text-xs">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="font-bold text-slate-800 dark:text-ink-800">{rating}</span>
            {reviews != null && <span className="text-[11px] text-slate-400">({reviews} reviews)</span>}
          </div>
        )}

        {(doctor as any).isAvailableToday !== false && (doctor as any).isAvailable !== false && (
          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-[#16A34A]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A] animate-pulse" />
            <span>Available Today</span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-1">
        <Link
          href={`/doctors/${doctor.id}`}
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
  const featured = ((data as ExtendedDoctor[]) ?? []).filter((d) => d?.id);

  if (isLoading) {
    return (
      <section className="mx-auto max-w-7xl px-5 py-3.5 sm:py-4.5 lg:px-8">
        <SectionHeader title={t("featuredDoctors") || "Featured Doctors"} subtitle="Top rated and most trusted doctors near you" />
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
        title={t("featuredDoctors") || "Featured Doctors"}
        subtitle="Top rated and most trusted doctors near you"
        viewAllHref="/doctors/featured"
        viewAllLabel={t("viewAll") || "View All"}
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {featured.slice(0, 8).map((doctor) => (
          <FeaturedDoctorCard key={doctor.id} doctor={doctor} />
        ))}
      </div>
    </section>
  );
}
