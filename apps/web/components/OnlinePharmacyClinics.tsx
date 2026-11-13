
"use client";

import { ArrowRight, Pill, Truck } from "lucide-react";
import { Link } from "@/i18n/routing";

export default function OnlinePharmacyClinics() {
  return (
    <section className="mx-auto max-w-7xl px-3 py-4 sm:px-5 lg:px-8">
      <Link
        href="/online-pharmacies"
        className="
          group relative grid w-full grid-cols-[minmax(0,1fr)_105px]
          items-center overflow-hidden rounded-2xl
          border border-teal-100
          bg-gradient-to-r from-[#EAF9F7] to-[#EFF6FF]
          shadow-sm transition-all duration-300 hover:shadow-lg
          min-h-[185px]
          sm:grid-cols-[minmax(0,1fr)_150px] sm:min-h-[220px]
          md:h-[250px] md:grid-cols-[minmax(0,1fr)_280px]
          lg:h-[280px] lg:grid-cols-[minmax(0,1fr)_310px]
          dark:border-soft-300 dark:bg-surface
        "
      >
        {/* LEFT CONTENT */}
        <div className="relative z-10 min-w-0 py-4 pl-4 pr-1 sm:px-7 md:py-4 lg:px-10">
          <span className="flex w-fit items-center gap-1 rounded-full bg-teal-100 px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-teal-800 sm:gap-1.5 sm:px-3 sm:text-[10px]">
            <Pill className="h-3 w-3" />
            DoctorContact
          </span>

          <h2 className="mt-2 text-xl font-extrabold leading-tight text-[#0F1B33] sm:text-2xl md:text-3xl dark:text-ink-900">
            Online Medicine
            <span className="block text-[#0F8B83]">
              Delivery
            </span>
          </h2>

          <p className="mt-2 max-w-md text-[10px] leading-relaxed text-slate-600 sm:text-xs md:text-sm dark:text-ink-600">
            Find trusted pharmacies and clinics offering online
            medicine delivery near you.
          </p>

          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[9px] font-semibold text-slate-600 sm:mt-3 sm:text-[10px] md:text-xs">
            <span className="flex items-center gap-1">
              <Pill className="h-3 w-3 shrink-0 text-teal-600" />
              Trusted Medicines
            </span>

            <span className="flex items-center gap-1">
              <Truck className="h-3 w-3 shrink-0 text-teal-600" />
              Home Delivery
            </span>
          </div>

          <span className="mt-3 inline-flex max-w-full items-center gap-1 rounded-lg bg-[#0F766E] px-2.5 py-2 text-[9px] font-bold text-white transition-all group-hover:bg-[#0D625B] sm:mt-4 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-[11px] md:text-xs">
            <span>Explore Online Pharmacies</span>
            <ArrowRight className="h-3 w-3 shrink-0 transition-transform group-hover:translate-x-1" />
          </span>
        </div>

        {/* RIGHT TOP IMAGE ON MOBILE */}
        <div className="
          relative flex h-full min-h-[140px] w-full
          items-center justify-center overflow-hidden
          bg-transparent
          sm:min-h-[170px]
          md:min-h-0
        ">
          <img
            src="/ss.png"
            alt="DoctorContact Online Medicine Delivery"
            loading="lazy"
            decoding="async"
            className="
              h-[105px] w-full max-w-[105px]
              object-contain object-center p-1
              sm:h-[145px] sm:max-w-[150px] sm:p-2
              md:h-full md:max-w-none md:p-3
              lg:p-4
              transition-transform duration-500
              group-hover:scale-[1.03]
            "
          />
        </div>
      </Link>
    </section>
  );
}
