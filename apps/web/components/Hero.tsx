"use client";

import { Search, MapPin, ChevronDown, Mic, Users } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useState, useEffect } from "react";
import Image from "next/image";
import DoctorGrid from "./DoctorGrid";
import { fetchSearchLocations } from "@/lib/api";

interface Location {
  id: string;
  nameEn: string;
  nameBn: string;
  nameHi: string;
  isActive?: boolean;
}

const POPULAR_SEARCHES = ["Cardiologist", "Skin clinic", "Diabetes treatment", "Pediatrician"];

export default function Hero() {
  const t = useTranslations("Hero");
  const locale = useLocale();

  const [query, setQuery] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");

  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [appliedLocation, setAppliedLocation] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetchSearchLocations()
      .then((data) => {
        if (Array.isArray(data)) {
          setLocations(data);
        } else if (data && Array.isArray(data.data)) {
          setLocations(data.data);
        }
      })
      .catch((err) => console.error("Failed to load locations", err))
      .finally(() => setIsLoading(false));
  }, []);

  const getLocalizedName = (loc: Location) => {
    if (locale === "bn") return loc.nameBn;
    if (locale === "hi") return loc.nameHi;
    return loc.nameEn;
  };

  function runSearch(q: string, loc: string) {
    setAppliedQuery(q);
    setAppliedLocation(loc);
    if (typeof document !== "undefined") {
      document.getElementById("search-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    runSearch(query, selectedLocation);
  }

  return (
    <section
      id="search"
      className="relative overflow-hidden bg-gradient-to-b from-[#EBF3FF] via-[#F4F8FE] to-white dark:from-[#0C1526] dark:via-[#0C1526] dark:to-[var(--color-bg)] pt-4 pb-6 lg:pt-6 lg:pb-8"
    >
      {/* Soft ambient background glow */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-[#1C63E7]/10 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-10 h-96 w-96 rounded-full bg-[#16A34A]/8 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid items-center gap-8 lg:grid-cols-12">
          {/* ================= LEFT: Copy + Search Bar ================= */}
          <div className="lg:col-span-7 lg:py-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1C63E7] dark:text-[var(--color-primary-text)]">
              {t("eyebrow") || "TRUSTED HEALTHCARE FOR A BRIGHTER TOMORROW"}
            </p>

            <h1 className="mt-3 text-4xl font-extrabold leading-[1.1] tracking-tight text-[#0F1B33] md:text-5xl lg:text-[3.6rem] dark:text-ink-900">
              Your Health <br />
              <span className="text-[#1C63E7]">Our Priority</span>
            </h1>

            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-slate-600 dark:text-ink-600 md:text-base">
              Find trusted doctors, nearby clinics, book appointments and access healthcare services — all in one place.
            </p>

            {/* ================= SEARCH BAR PILL (Exact Image 1 style) ================= */}
            <form
              onSubmit={handleSearch}
              className="mt-8 flex w-full max-w-2xl flex-col rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-[0_10px_35px_rgba(28,99,231,0.12)] transition-shadow hover:shadow-[0_14px_45px_rgba(28,99,231,0.16)] sm:flex-row sm:items-center sm:rounded-full dark:border-soft-300 dark:bg-surface"
            >
              {/* Location selector part */}
              <div className="relative flex items-center px-3.5 py-2.5 sm:w-[40%] sm:border-r sm:border-slate-200/80 sm:py-2 dark:border-soft-200">
                <MapPin className="h-4 w-4 shrink-0 text-[#1C63E7]" />
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  disabled={isLoading}
                  className="w-full cursor-pointer appearance-none bg-transparent pl-2 pr-6 text-xs sm:text-sm font-medium text-slate-800 outline-none disabled:opacity-50 dark:text-ink-800"
                >
                  <option value="">
                    {locale === "bn" ? "দুবরাজপুর, পশ্চিমবঙ্গ" : "Dubrajpur, West Bengal"}
                  </option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.nameEn}>
                      {getLocalizedName(loc)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 h-3.5 w-3.5 shrink-0 text-slate-400" />
              </div>

              {/* Input text part */}
              <div className="flex flex-1 items-center px-3 py-2 sm:py-2">
                <Search className="mr-2 h-4 w-4 shrink-0 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search doctors, clinics, treatments..."
                  className="w-full min-w-0 bg-transparent text-xs sm:text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-ink-800 dark:placeholder:text-ink-400"
                />
              </div>

              {/* Mic Icon & Search Button */}
              <div className="flex items-center gap-1.5 px-2 pb-1.5 sm:p-0">
                <button
                  type="button"
                  aria-label="Voice search"
                  className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full text-[#1C63E7] hover:bg-blue-50 transition dark:hover:bg-soft-100"
                >
                  <Mic className="h-4 w-4" />
                </button>

                <button
                  type="submit"
                  className="flex w-full sm:w-auto items-center justify-center rounded-full bg-[#1C63E7] px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow transition hover:bg-[#1550c4]"
                >
                  <span>Search</span>
                </button>
              </div>
            </form>

            {/* ================= POPULAR SEARCHES ================= */}
            <div className="mt-4 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
              <span className="font-semibold text-slate-700 dark:text-ink-700">Popular searches:</span>
              {POPULAR_SEARCHES.map((term, i) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    setQuery(term);
                    runSearch(term, selectedLocation);
                  }}
                  className="text-slate-600 hover:text-[#1C63E7] transition-colors underline-offset-2 hover:underline dark:text-ink-600"
                >
                  {term}{i < POPULAR_SEARCHES.length - 1 ? "," : "..."}
                </button>
              ))}
            </div>
          </div>

          {/* ================= RIGHT: Doctor Cutout + Badge (Image 1 style) ================= */}
          <div className="relative lg:col-span-5 flex justify-center items-center self-stretch">
            {/* Script Text on top right of doctor */}
            <div className="absolute right-2 top-2 z-20 hidden sm:block text-right select-none">
              <p className="font-serif italic font-extrabold text-[#1C63E7] text-2xl lg:text-[1.75rem] leading-[1.15] drop-shadow-sm">
                Healthy <br />
                People <br />
                Happier <br />
                Lives
              </p>
            </div>

            {/* Doctor Image Container — bounded height so it never outgrows the copy */}
            <div className="relative z-10 mx-auto w-full max-w-[320px] sm:max-w-[350px] lg:max-w-[370px]">
              <div className="relative h-[360px] w-full overflow-hidden rounded-3xl sm:h-[420px] lg:h-[460px]">
                <img
                  src="/assets/home/hero-doctor.jpg"
                  alt="Doctor"
                  className="h-full w-full object-contain object-bottom transition-transform duration-500 hover:scale-[1.02]"
                />
              </div>

              {/* Floating "Trusted by 10,000+ Happy Patients" badge */}
              <div className="absolute -bottom-4 right-2 sm:right-4 z-20 flex items-center gap-3 rounded-2xl border border-slate-100/90 bg-white/95 px-4 py-2.5 shadow-[0_10px_25px_rgba(0,0,0,0.08)] backdrop-blur-md dark:border-soft-300 dark:bg-surface/95">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#1C63E7]">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-500 leading-none">Trusted by</p>
                  <p className="text-sm font-extrabold text-[#0F1B33] dark:text-ink-900 leading-tight">
                    10,000+
                  </p>
                  <p className="text-[10px] font-medium text-slate-400 leading-none">Happy Patients</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= SEARCH RESULTS (if searched) ================= */}
      {(appliedQuery || appliedLocation) && (
        <div id="search-results" className="relative mx-auto max-w-7xl scroll-mt-24 px-5 pt-10 lg:px-8">
          <DoctorGrid query={appliedQuery} city={appliedLocation} />
        </div>
      )}
    </section>
  );
}
