"use client";

import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";

export default function HomeQuickLinks() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
      {/* Grid: মোবাইলে 1 কলাম, md+ এ 2 কলাম */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Doctors Card - Medium size */}
        <Link
          href="/doctors"
          className="group flex items-center gap-4 rounded-2xl border border-[#CDE1FF] bg-[#EAF2FF]/80 p-4 transition-all hover:border-[#1C63E7]/40 hover:bg-[#EAF2FF] hover:shadow-md dark:border-soft-300 dark:bg-surface"
        >
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white bg-white shadow-sm">
            <img
              src="/assets/home/quick-doctor.jpg"
              alt="Find Doctors"
              className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-[#0F1B33] dark:text-ink-900">
              Find <span className="text-[#1C63E7]">Doctors</span>
            </h3>
            <p className="mt-0.5 truncate text-xs text-slate-600 dark:text-ink-600">
              Consult verified doctors
            </p>
          </div>

          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1C63E7] text-white shadow-sm transition-transform group-hover:scale-105 group-hover:translate-x-0.5">
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>

        {/* Clinics Card - Medium size */}
        <Link
          href="/clinics"
          className="group flex items-center gap-4 rounded-2xl border border-[#C6EFE7] bg-[#E8F8F5]/80 p-4 transition-all hover:border-[#0D9488]/40 hover:bg-[#E8F8F5] hover:shadow-md dark:border-soft-300 dark:bg-surface"
        >
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white bg-white shadow-sm">
            <img
              src="/assets/home/clinic-3d.jpg"
              alt="Explore Clinics"
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-[#0F1B33] dark:text-ink-900">
              Explore <span className="text-[#0D9488]">Clinics</span>
            </h3>
            <p className="mt-0.5 truncate text-xs text-slate-600 dark:text-ink-600">
              Modern facilities nearby
            </p>
          </div>

          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0D9488] text-white shadow-sm transition-transform group-hover:scale-105 group-hover:translate-x-0.5">
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>
      </div>
    </section>
  );
}