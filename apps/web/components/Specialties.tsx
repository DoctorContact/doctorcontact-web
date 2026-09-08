"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { Link } from "@/i18n/routing";
import { api } from "@/lib/api";

export default function Specialties() {
  const t = useTranslations("Specialties");
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Specializations are managed by the Super Admin and stored in the DB
  // (master requirement #9/#51 — the list must NOT be hardcoded in the frontend).
  useEffect(() => {
    async function fetchSpecialties() {
      try {
        const res = await api.get("/specializations");
        const list = res.data?.data?.specializations;
        setSpecialties(Array.isArray(list) ? list : []);
      } catch {
        setSpecialties([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSpecialties();
  }, []);

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#2563EB]" />
        </div>
      </section>
    );
  }

  if (specialties.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      {/* Section Header */}
      <div className="mx-auto mb-10 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl dark:text-slate-100">
          {t("title") || "Search by Specialty"}
        </h2>
        <div className="mx-auto mt-3 h-1 w-24 rounded-full bg-gradient-to-r from-[#2563EB] to-[#0F766E]" />
      </div>

      {/* Category Grid - Follow exact structure but premium */}
      <div
        id="categories"
        className="flex flex-wrap justify-center gap-3 md:gap-6"
      >
        {specialties.map((spec) => (
          <Link
            key={spec.id}
            href={`/doctors?specialty=${encodeURIComponent(spec.name)}`}
            className="
              group relative block w-[7rem] h-[7rem] md:w-40 md:h-40
              rounded-2xl
              border border-slate-200
              bg-white
              p-2 pt-3 md:p-4 md:pt-4
              text-center
              cursor-pointer
              shadow-sm
              transition-all duration-300
              hover:-translate-y-1
              hover:shadow-lg
              hover:border-[#2563EB]/40
              dark:border-slate-700
              dark:bg-slate-900
              dark:hover:border-[#2563EB]/50
            "
          >
            {/* Icon */}
            <div className="mb-2 flex justify-center">
              {spec.iconUrl ? (
                <img
                  className="w-16 h-16 md:w-20 md:h-20 object-contain"
                  src={spec.iconUrl}
                  alt={spec.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://via.placeholder.com/80?text=Icon";
                  }}
                />
              ) : (
                <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#0F766E] text-2xl font-bold text-white">
                  {spec.name?.charAt(0)?.toUpperCase()}
                </div>
              )}
            </div>

            {/* Name */}
            <h3 className="font-medium text-slate-700 text-xs md:text-sm px-1 truncate dark:text-slate-200">
              {spec.name}
            </h3>
          </Link>
        ))}
      </div>
    </section>
  );
}