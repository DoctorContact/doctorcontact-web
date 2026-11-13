
"use client";

import React, { useMemo } from "react";
import {
  ArrowLeft,
  MapPin,
  Building2,
  Pill,
  Truck,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import {
  usePublicAllClinics,
  type PublicClinic,
} from "@/lib/hooks/usePublicDirectory";

function initials(name?: string) {
  if (!name) return "CL";

  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function PharmacyCard({ clinic }: { clinic: PublicClinic }) {
  const name = clinic.clinicName || "Health Center";
  const location =
    [clinic.city, clinic.address].filter(Boolean).join(", ") || null;

  return (
    <Link
      href={`/clinics/${clinic.id}`}
      className="group overflow-hidden rounded-2xl border border-teal-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-teal-900/40 dark:bg-surface"
    >
      <div className="relative h-44 overflow-hidden bg-slate-100">
        {clinic.logo ? (
          <img
            src={clinic.logo}
            alt={name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-[#0F766E] via-[#14B8A6] to-[#1C63E7]">
            <Building2 className="h-10 w-10 text-white" />
            <span className="mt-2 text-xl font-bold text-white">
              {initials(name)}
            </span>
          </div>
        )}

        <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-[#0F766E] px-3 py-1.5 text-[10px] font-bold text-white">
          <Pill className="h-3 w-3" />
          Online Delivery
        </span>
      </div>

      <div className="p-4">
        <h2 className="truncate text-base font-extrabold text-[#0F1B33] dark:text-ink-900">
          {name}
        </h2>

        {location && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-ink-500">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-green-600" />
            <span className="truncate">{location}</span>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-bold text-teal-700 dark:border-soft-200 dark:text-teal-400">
          View Pharmacy
          <span>→</span>
        </div>
      </div>
    </Link>
  );
}

export default function OnlinePharmaciesPage() {
  const { data, isLoading } = usePublicAllClinics();

  const clinics = useMemo(
    () =>
      ((data as PublicClinic[]) ?? []).filter(
        (clinic) =>
          clinic?.id && clinic.onlinePharmacyEnabled === true,
      ),
    [data],
  );

  return (
    <main className="min-h-screen bg-slate-50/60 dark:bg-background">
      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">

        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-teal-700 dark:text-ink-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-[#E8F8F7] to-[#EFF6FF] p-6 sm:p-9">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-teal-800">
                <Pill className="h-4 w-4" />
                DoctorContact Pharmacy
              </span>

              <h1 className="mt-4 text-3xl font-extrabold text-[#0F1B33] sm:text-4xl">
                Online Medicine
                <span className="block text-[#0F8B83]">
                  Delivery
                </span>
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600">
                Discover trusted clinics and pharmacies offering
                online medicine delivery near you.
              </p>

              <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Pill className="h-4 w-4 text-teal-600" />
                  Trusted Pharmacies
                </span>
                <span className="flex items-center gap-1.5">
                  <Truck className="h-4 w-4 text-teal-600" />
                  Home Delivery
                </span>
              </div>
            </div>

            <div className="hidden shrink-0 items-center justify-center rounded-2xl bg-white/70 p-6 sm:flex">
              <Pill className="h-16 w-16 text-[#0F8B83]" />
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-[#0F1B33] dark:text-ink-900">
              Available Online Pharmacies
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-ink-500">
              Clinics offering online medicine delivery
            </p>
          </div>

          {!isLoading && (
            <span className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-800 dark:bg-teal-900/30 dark:text-teal-300">
              {clinics.length} Available
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-sm text-slate-500">
            Loading pharmacies...
          </div>
        ) : clinics.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {clinics.map((clinic) => (
              <PharmacyCard key={clinic.id} clinic={clinic} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center dark:border-soft-300 dark:bg-surface">
            <Pill className="mx-auto h-10 w-10 text-teal-600" />
            <h3 className="mt-4 text-lg font-bold text-[#0F1B33] dark:text-ink-900">
              No Online Pharmacies Available
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-ink-500">
              There are currently no clinics offering online medicine delivery.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
