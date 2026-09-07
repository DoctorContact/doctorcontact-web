"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { 
  MapPin, Loader2, Pencil, X, Navigation, CheckCircle2, 
  Building2, Sparkles, Search, Radio, CalendarCheck, Users 
} from "lucide-react";
import DoctorGrid from "@/components/DoctorGrid";
import { useLocationCity } from "@/lib/hooks/useLocationCity";

function GradientCard({
  children,
  className = "",
  gradient = "from-[#252a67] via-[#3b4a8f] to-[#14B8A6]",
}: {
  children: React.ReactNode;
  className?: string;
  gradient?: string;
}) {
  return (
    <div className={`relative rounded-[20px] p-[3px] bg-gradient-to-r ${gradient} shadow-[0_4px_15px_-6px_rgba(37,42,103,0.3)] transition-all duration-300 ${className}`}>
      <div className="rounded-[calc(20px-3px)] bg-white dark:bg-slate-900 h-full">
        {children}
      </div>
    </div>
  );
}

export default function DoctorsPage() {
  const t = useTranslations("DoctorSearch");
  const { city, status, setManualCity } = useLocationCity();
  const searchParams = useSearchParams();
  
  // Default Tab Setup based on URL parameter (if any)
  const initialTab = searchParams.get("live") === "true" ? "LIVE" 
                   : searchParams.get("available") === "true" ? "AVAILABLE" 
                   : "ALL";

  const [activeTab, setActiveTab] = useState<"ALL" | "AVAILABLE" | "LIVE">(initialTab);
  const [query, setQuery] = useState(""); 
  const [editingLocation, setEditingLocation] = useState(false);
  const [manualInput, setManualInput] = useState("");

  function applyManualLocation(e: React.FormEvent) {
    e.preventDefault();
    if (manualInput.trim()) {
      setManualCity(manualInput.trim());
      setEditingLocation(false);
    }
  }

  function clearLocation() {
    setManualCity("");
    setManualInput("");
    setEditingLocation(false);
  }

  function cancelEditing() {
    setEditingLocation(false);
    setManualInput("");
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* ================= COMPACT HEADER ================= */}
      <GradientCard>
        <div className="relative overflow-hidden p-5 sm:p-6">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-[#252a67]/[0.06] to-[#14B8A6]/[0.06] blur-3xl" />

          <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#252a67] to-[#3b4a8f] text-white shadow-sm">
                  <Building2 className="h-3.5 w-3.5" />
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#252a67] dark:text-blue-300">
                  {t("findDoctors") || "Find Doctors"}
                </p>
              </div>

              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                {t("heading") || "Doctor Directory"}
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {t("subheading") || "Search and book trusted doctors near you"}
              </p>
            </div>

            <div className="hidden shrink-0 sm:block">
              <div className="flex items-center gap-2 rounded-full bg-slate-50 dark:bg-slate-800 px-3 py-1.5 border border-slate-100 dark:border-slate-700">
                <Sparkles className="h-3.5 w-3.5 text-[#14B8A6]" />
                <span className="text-xs font-semibold text-[#252a67] dark:text-blue-300">
                  {t("trustedNetwork") || "Trusted Healthcare Network"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </GradientCard>

      {/* ================= SEARCH & LOCATION BAR ================= */}
      <div className="mt-5">
        <GradientCard gradient="from-[#252a67] via-[#3b4a8f] to-[#14B8A6]">
          <div className="p-4 flex flex-col md:flex-row gap-4 items-center">
            
            {/* Location Section */}
            <div className="flex flex-1 items-center gap-3 w-full">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#252a67] to-[#14B8A6] text-white shadow-md">
                <MapPin className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1">
                {status === "loading" && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Loader2 className="h-4 w-4 animate-spin text-[#14B8A6]" />
                    {t("locationDetecting") || "Detecting..."}
                  </div>
                )}

                {status !== "loading" && !editingLocation && city && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-slate-600">
                      <strong className="text-[#252a67] dark:text-white">{city}</strong>
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#252a67] to-[#14B8A6] px-2 py-0.5 text-[9px] font-bold text-white shadow-sm">
                      <CheckCircle2 className="h-3 w-3" />
                      Active
                    </span>
                  </div>
                )}

                {status !== "loading" && !editingLocation && !city && (
                  <span className="flex items-center gap-2 text-sm text-slate-600">
                    <Navigation className="h-4 w-4 text-[#14B8A6]" />
                    {t("locationPrompt") || "Set Location"}
                  </span>
                )}

                {editingLocation && (
                  <form onSubmit={applyManualLocation} className="flex items-center gap-2 w-full">
                    <input
                      autoFocus
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      placeholder={t("locationInputPlaceholder") || "Enter city..."}
                      className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-[#14B8A6] dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    />
                    <button type="submit" className="rounded-lg bg-[#252a67] px-3 py-1.5 text-xs text-white">Apply</button>
                    <button type="button" onClick={cancelEditing} className="text-xs text-slate-500 dark:text-slate-400">Cancel</button>
                  </form>
                )}
              </div>

              {status !== "loading" && !editingLocation && (
                <div className="flex shrink-0 gap-1.5">
                  {city ? (
                    <>
                      <button onClick={() => { setManualInput(city); setEditingLocation(true); }} className="p-2 text-[#0f766e] bg-[#14B8A6]/10 rounded-lg hover:bg-[#14B8A6]/20">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={clearLocation} className="p-2 text-red-500 bg-red-50 dark:bg-red-500/10 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setEditingLocation(true)} className="px-3 py-1.5 bg-[#252a67] text-white text-xs rounded-lg">
                      Change
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Divider for Desktop */}
            <div className="hidden md:block w-px h-10 bg-slate-200 dark:bg-slate-700" />

            {/* Name Search Section */}
            <div className="flex-1 w-full flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-[#14B8A6] focus-within:bg-white dark:bg-slate-800 dark:border-slate-700">
              <Search className="h-4 w-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by doctor or clinic name..."
                className="w-full bg-transparent text-sm outline-none text-slate-800 dark:text-slate-200"
              />
              {query && (
                <button onClick={() => setQuery("")} className="text-slate-400 hover:text-slate-600">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

          </div>
        </GradientCard>
      </div>

      {/* ================= FILTER TABS ================= */}
      <div className="mt-6 flex flex-wrap items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <button 
          onClick={() => setActiveTab("ALL")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
            activeTab === "ALL" 
            ? "bg-[#252a67] text-white shadow-md" 
            : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 border border-slate-200 dark:border-slate-700"
          }`}
        >
          <Users className="h-4 w-4" />
          All Doctors
        </button>

        <button 
          onClick={() => setActiveTab("AVAILABLE")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
            activeTab === "AVAILABLE" 
            ? "bg-[#14B8A6] text-white shadow-md" 
            : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 border border-slate-200 dark:border-slate-700"
          }`}
        >
          <CalendarCheck className="h-4 w-4" />
          Available Today
        </button>

        <button 
          onClick={() => setActiveTab("LIVE")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
            activeTab === "LIVE" 
            ? "bg-red-500 text-white shadow-md" 
            : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 border border-slate-200 dark:border-slate-700"
          }`}
        >
          <Radio className={`h-4 w-4 ${activeTab === "LIVE" ? "animate-pulse text-white" : "text-red-500"}`} />
          Live Now
        </button>
      </div>

      {/* Live Now Warning banner */}
      {activeTab === "LIVE" && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          <Radio className="h-4 w-4 animate-pulse" />
          {t("liveNowBanner") || "Showing doctors currently live in session right now"}
        </div>
      )}

      {/* ================= DOCTOR GRID ================= */}
      <div className="mt-6">
        <DoctorGrid 
          query={query} 
          city={city ?? undefined} 
          liveNow={activeTab === "LIVE"} 
          availableToday={activeTab === "AVAILABLE"} 
        />
      </div>
    </main>
  );
}