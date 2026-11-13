
"use client";

import { ArrowRight, Pill, Truck } from "lucide-react";
import { Link } from "@/i18n/routing";

export default function OnlinePharmacyClinics() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-4 lg:px-8">
      <Link
        href="/online-pharmacies"
        className="group grid h-[220px] overflow-hidden rounded-2xl border border-teal-100 bg-gradient-to-r from-[#EAF9F7] to-[#EFF6FF] shadow-sm transition-all duration-300 hover:shadow-lg sm:h-[250px] md:grid-cols-2 lg:h-[280px] dark:border-soft-300 dark:bg-surface"
      >
        {/* LEFT CONTENT */}
        <div className="flex min-w-0 flex-col justify-center px-5 py-4 sm:px-8 lg:px-10">
          <span className="flex w-fit items-center gap-1.5 rounded-full bg-teal-100 px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-teal-800">
            <Pill className="h-3 w-3" />
            DoctorContact
          </span>

          <h2 className="mt-2 text-2xl font-extrabold leading-tight text-[#0F1B33] sm:text-3xl dark:text-ink-900">
            Online Medicine
            <span className="block text-[#0F8B83]">
              Delivery
            </span>
          </h2>

          <p className="mt-2 max-w-md text-xs leading-relaxed text-slate-600 sm:text-sm dark:text-ink-600">
            Find trusted pharmacies and clinics offering online
            medicine delivery near you.
          </p>

          <div className="mt-3 flex flex-wrap gap-3 text-[10px] font-semibold text-slate-600 sm:text-xs">
            <span className="flex items-center gap-1">
              <Pill className="h-3.5 w-3.5 text-teal-600" />
              Trusted Medicines
            </span>

            <span className="flex items-center gap-1">
              <Truck className="h-3.5 w-3.5 text-teal-600" />
              Home Delivery
            </span>
          </div>

          <span className="mt-4 inline-flex w-fit items-center gap-2 rounded-lg bg-[#0F766E] px-4 py-2.5 text-[11px] font-bold text-white transition-all group-hover:bg-[#0D625B] sm:text-xs">
            Explore Online Pharmacies
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </span>
        </div>

        {/* RIGHT IMAGE */}
        <div className="relative hidden h-full min-h-[220px] overflow-hidden bg-[#EFF8FC] md:block">
          <img
            src="/ss.png"
            alt="DoctorContact Online Medicine Delivery"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-contain object-center p-2 sm:p-3 lg:p-4 transition-transform duration-500 group-hover:scale-[1.02]"
          />
        </div>
      </Link>
    </section>
  );
}
