"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Ambulance,
  ArrowLeft,
  Building2,
  HeartPulse,
  MapPin,
  Phone,
  Search,
  X,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { api } from "@/lib/api";

export default function AmbulancesPage() {
  const [ambulances, setAmbulances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  /* =========================================================
     FETCH AMBULANCES
  ========================================================= */

  useEffect(() => {
    const fetchAmbulances = async () => {
      try {
        const res = await api.get("/ambulances");

        if (res.data?.success) {
          setAmbulances(res.data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch ambulances", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAmbulances();
  }, []);

  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredAmbulances = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return ambulances;
    }

    return ambulances.filter((amb) => {
      return (
        amb.type?.toLowerCase().includes(query) ||
        amb.vehicleNumber?.toLowerCase().includes(query) ||
        amb.hospitalName?.toLowerCase().includes(query) ||
        amb.location?.toLowerCase().includes(query) ||
        amb.mobileNumber?.toLowerCase().includes(query) ||
        amb.services?.some((service: string) =>
          service.toLowerCase().includes(query)
        )
      );
    });
  }, [ambulances, search]);

  return (
    <main className="min-h-screen bg-[#F6F8FC] dark:bg-[#070A11]">

      {/* =========================================================
          HERO
      ========================================================= */}

      <section className="relative overflow-hidden bg-[#252A67]">

        {/* Background Pattern */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.055]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.25) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.25) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* Background Glow */}
        <div className="pointer-events-none absolute -right-28 -top-32 h-80 w-80 rounded-full bg-blue-400/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 pb-7 pt-5 sm:px-6 lg:px-8">

          {/* Back Button */}
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-xs font-medium text-white/70 transition hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Home
          </Link>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

            {/* =====================================================
                HERO CONTENT
            ===================================================== */}

            <div className="max-w-2xl">

              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                Emergency Services
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-[36px]">
                Ambulance Services
              </h1>

              <p className="mt-2 max-w-xl text-xs leading-5 text-blue-100 sm:text-sm">
                Find and contact emergency ambulance services quickly
                when you need immediate medical transportation.
              </p>

            </div>

            {/* =====================================================
                EMERGENCY NUMBERS
            ===================================================== */}

            <div className="grid grid-cols-2 gap-2.5">

              {/* 108 */}
              <a
                href="tel:108"
                className="group min-w-[130px] rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/[0.15]"
              >

                <div className="flex items-center justify-between">

                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/15">
                    <Ambulance className="h-4 w-4 text-red-300" />
                  </div>

                  <Phone className="h-3 w-3 text-white/40 transition group-hover:text-white" />

                </div>

                <p className="mt-2 text-xl font-bold text-white">
                  108
                </p>

                <p className="mt-0.5 text-[10px] font-medium leading-4 text-blue-100">
                  Emergency Ambulance
                </p>

              </a>

              {/* 102 */}
              <a
                href="tel:102"
                className="group min-w-[130px] rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/[0.15]"
              >

                <div className="flex items-center justify-between">

                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-500/15">
                    <HeartPulse className="h-4 w-4 text-pink-300" />
                  </div>

                  <Phone className="h-3 w-3 text-white/40 transition group-hover:text-white" />

                </div>

                <p className="mt-2 text-xl font-bold text-white">
                  102
                </p>

                <p className="mt-0.5 text-[10px] font-medium leading-4 text-blue-100">
                  Pregnant Women & Children
                </p>

              </a>

            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          SEARCH
      ========================================================= */}

      <section className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">

        <div className="-mt-4 rounded-xl border border-slate-200 bg-white p-2.5 shadow-[0_8px_25px_rgba(15,23,42,0.07)] dark:border-slate-800 dark:bg-[#111620]">

          <div className="relative">

            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ambulance, hospital, vehicle or location..."
              className="h-10.5 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-10 text-xs font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#252A67] focus:bg-white focus:ring-2 focus:ring-[#252A67]/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-slate-950"
            />

            {search && (
              <button
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}

          </div>
        </div>
      </section>

      {/* =========================================================
          PRIVATE AMBULANCES
      ========================================================= */}

      <section className="mx-auto max-w-7xl px-5 py-7 sm:px-6 lg:px-8">

        {/* Section Header */}

        <div className="mb-4 flex items-end justify-between">

          <div>

            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#252A67] dark:text-blue-400">
              Available Services
            </p>

            <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              Private Ambulance Services
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Find and contact available private ambulances near you.
            </p>

          </div>

          {!loading && (
            <div className="hidden rounded-md bg-slate-100 px-2.5 py-1.5 text-[10px] font-semibold text-slate-500 sm:block dark:bg-slate-800 dark:text-slate-400">
              {filteredAmbulances.length} available
            </div>
          )}

        </div>

        {/* =======================================================
            LOADING
        ======================================================= */}

        {loading ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">

            {[1, 2, 3].map((item) => (
              <AmbulanceSkeleton key={item} />
            ))}

          </div>
        ) : filteredAmbulances.length > 0 ? (

          /* =====================================================
             AMBULANCE CARDS
          ===================================================== */

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">

            {filteredAmbulances.map((amb) => (
              <PrivateAmbulanceCard
                key={amb.id}
                ambulance={amb}
              />
            ))}

          </div>

        ) : (

          /* =====================================================
             EMPTY STATE
          ===================================================== */

          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center dark:border-slate-700 dark:bg-[#111620]">

            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-400 dark:bg-slate-800">
              <Ambulance className="h-5 w-5" />
            </div>

            <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">
              No ambulance found
            </h3>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Try searching with another ambulance, hospital or location.
            </p>

            <button
              onClick={() => setSearch("")}
              className="mt-3 text-xs font-bold text-[#252A67] hover:underline dark:text-blue-400"
            >
              Clear search
            </button>

          </div>
        )}

      </section>
    </main>
  );
}

/* =============================================================
   PRIVATE AMBULANCE CARD
============================================================= */

function PrivateAmbulanceCard({
  ambulance,
}: {
  ambulance: any;
}) {
  const phoneNumber = ambulance.mobileNumber || "";

  /* -----------------------------------------------------------
     SERVICE CHIP COLORS
  ----------------------------------------------------------- */

  const serviceStyles = [
    "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-900/40",
    "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/40",
    "bg-violet-50 text-violet-700 border-violet-100 dark:bg-violet-950/30 dark:text-violet-300 dark:border-violet-900/40",
    "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900/40",
  ];

  return (
    <article className="group relative flex min-h-[270px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.035)] transition duration-200 hover:-translate-y-0.5 hover:border-[#252A67]/20 hover:shadow-md dark:border-slate-800 dark:bg-[#111620]">

      {/* =======================================================
          TOP ACCENT
      ======================================================= */}

      <div className="absolute left-0 right-0 top-0 h-0.5 bg-[#252A67] opacity-0 transition group-hover:opacity-100" />

      {/* =======================================================
          HEADER
      ======================================================= */}

      <div className="flex items-start justify-between gap-2.5">

        <div className="flex min-w-0 items-center gap-2.5">

          {/* Ambulance Icon */}

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#252A67]/10 text-[#252A67] dark:bg-blue-950/40 dark:text-blue-400">
            <Ambulance className="h-[18px] w-[18px]" />
          </div>

          <div className="min-w-0">

            {/* Ambulance Type */}

            <h3 className="truncate text-[16px] font-bold leading-5 text-slate-900 dark:text-white">
              {ambulance.type || "Ambulance"}
            </h3>

            {/* Vehicle Number */}

            <p className="mt-0.5 truncate text-[12px] font-bold tracking-wide text-emerald-600 dark:text-emerald-400">
              {ambulance.vehicleNumber || "Vehicle number unavailable"}
            </p>

          </div>

        </div>

        {/* 24x7 */}

        {ambulance.is24x7Available && (
          <span className="shrink-0 rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
            24×7
          </span>
        )}

      </div>

      {/* =======================================================
          HOSPITAL + LOCATION
      ======================================================= */}

      <div className="mt-3.5 space-y-2.5">

        {/* Hospital */}

        <div className="flex items-center gap-2.5">

          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800">
            <Building2 className="h-3.5 w-3.5 text-slate-500" />
          </div>

          <div className="min-w-0">

            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              Hospital
            </p>

            <p className="mt-0.5 truncate text-[14px] font-bold leading-4 text-slate-800 dark:text-slate-100">
              {ambulance.hospitalName || "Not specified"}
            </p>

          </div>

        </div>

        {/* Location */}

        <div className="flex items-center gap-2.5">

          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#252A67]/8 dark:bg-blue-950/30">
            <MapPin className="h-3.5 w-3.5 text-[#252A67] dark:text-blue-400" />
          </div>

          <div className="min-w-0">

            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              Location
            </p>

            <p className="mt-0.5 truncate text-[14px] font-bold leading-4 text-slate-800 dark:text-slate-100">
              {ambulance.location || "Location unavailable"}
            </p>

          </div>

        </div>

      </div>

      {/* =======================================================
          SERVICES
      ======================================================= */}

      {ambulance.services?.length > 0 && (
        <div className="mt-3 border-t border-slate-100 pt-2.5 dark:border-slate-800">

          <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-wider text-slate-400">
            Services
          </p>

          <div className="flex min-h-[24px] flex-wrap gap-1.5">

            {ambulance.services.map(
              (service: string, index: number) => (
                <span
                  key={index}
                  className={`rounded-md border px-2 py-1 text-[10px] font-bold leading-none ${
                    serviceStyles[index % serviceStyles.length]
                  }`}
                >
                  {service}
                </span>
              )
            )}

          </div>

        </div>
      )}

      {/* =======================================================
          CALL BUTTON
      ======================================================= */}

      <div className="mt-auto pt-3">

        <a
          href={phoneNumber ? `tel:${phoneNumber}` : undefined}
          aria-disabled={!phoneNumber}
          className={`flex h-9 w-full items-center justify-center gap-2 rounded-lg px-3 text-[12px] font-bold transition active:scale-[0.98] ${
            phoneNumber
              ? "bg-[#252A67] text-white hover:bg-[#1D2154]"
              : "cursor-not-allowed bg-slate-200 text-slate-400 dark:bg-slate-800"
          }`}
        >

          <Phone className="h-3.5 w-3.5 shrink-0" />

          <span className="truncate">
            {phoneNumber || "Number unavailable"}
          </span>

        </a>

      </div>

    </article>
  );
}

/* =============================================================
   SKELETON CARD
============================================================= */

function AmbulanceSkeleton() {
  return (
    <div className="min-h-[270px] animate-pulse rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#111620]">

      {/* Header */}

      <div className="flex gap-2.5">

        <div className="h-10 w-10 rounded-lg bg-slate-200 dark:bg-slate-800" />

        <div className="flex-1 space-y-1.5">

          <div className="h-4 w-28 rounded bg-slate-200 dark:bg-slate-800" />

          <div className="h-3 w-20 rounded bg-slate-200 dark:bg-slate-800" />

        </div>

      </div>

      {/* Hospital + Location */}

      <div className="mt-5 space-y-3">

        <div className="flex gap-2.5">

          <div className="h-7 w-7 rounded-md bg-slate-200 dark:bg-slate-800" />

          <div className="flex-1 space-y-1.5">

            <div className="h-2 w-12 rounded bg-slate-200 dark:bg-slate-800" />

            <div className="h-3.5 w-36 rounded bg-slate-200 dark:bg-slate-800" />

          </div>

        </div>

        <div className="flex gap-2.5">

          <div className="h-7 w-7 rounded-md bg-slate-200 dark:bg-slate-800" />

          <div className="flex-1 space-y-1.5">

            <div className="h-2 w-12 rounded bg-slate-200 dark:bg-slate-800" />

            <div className="h-3.5 w-28 rounded bg-slate-200 dark:bg-slate-800" />

          </div>

        </div>

      </div>

      {/* Services */}

      <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">

        <div className="h-2.5 w-16 rounded bg-slate-200 dark:bg-slate-800" />

        <div className="mt-2 flex gap-1.5">

          <div className="h-5 w-14 rounded bg-slate-200 dark:bg-slate-800" />

          <div className="h-5 w-16 rounded bg-slate-200 dark:bg-slate-800" />

          <div className="h-5 w-12 rounded bg-slate-200 dark:bg-slate-800" />

        </div>

      </div>

      {/* Call */}

      <div className="mt-4 h-9 rounded-lg bg-slate-200 dark:bg-slate-800" />

    </div>
  );
}