"use client";

import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";

export default function HomeQuickLinks() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-2.5 sm:py-3.5 lg:px-8">
      <div className="grid gap-5 md:grid-cols-2">
        {/* Doctors Card */}
        <Link
          href="/doctors"
          className="group flex items-center gap-4 rounded-2xl border border-[#CDE1FF] bg-[#EAF2FF]/80 p-5 transition-all duration-300 hover:border-[#1C63E7]/40 hover:bg-[#EAF2FF] hover:shadow-md dark:border-soft-300 dark:bg-surface"
        >
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-white bg-white shadow-sm">
            <img
              src="/assets/home/quick-doctor.jpg"
              alt="Find Doctors"
              className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold text-[#0F1B33] dark:text-ink-900">
              Find the Right <span className="text-[#1C63E7]">Doctors</span>
            </h3>
            <p className="mt-0.5 text-xs sm:text-sm text-slate-600 dark:text-ink-600">
              Consult with experienced and verified doctors across specialities.
            </p>
          </div>

          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1C63E7] text-white shadow-sm transition-transform duration-300 group-hover:scale-105 group-hover:translate-x-0.5">
            <ArrowRight className="h-4 w-4" />
          </span>
        </Link>

        {/* Clinics Card */}
        <Link
          href="/clinics"
          className="group flex items-center gap-4 rounded-2xl border border-[#C6EFE7] bg-[#E8F8F5]/80 p-5 transition-all duration-300 hover:border-[#0D9488]/40 hover:bg-[#E8F8F5] hover:shadow-md dark:border-soft-300 dark:bg-surface"
        >
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-white bg-white shadow-sm">
            <img
              src="/assets/home/clinic-3d.jpg"
              alt="Explore Clinics"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold text-[#0F1B33] dark:text-ink-900">
              Explore Nearby <span className="text-[#0D9488]">Clinics</span>
            </h3>
            <p className="mt-0.5 text-xs sm:text-sm text-slate-600 dark:text-ink-600">
              Find best clinics near you with modern facilities.
            </p>
          </div>

          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0D9488] text-white shadow-sm transition-transform duration-300 group-hover:scale-105 group-hover:translate-x-0.5">
            <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      </div>
    </section>
  );
}
