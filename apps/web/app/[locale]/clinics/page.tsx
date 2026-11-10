"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  BadgeCheck,
  Building2,
  Check,
  ChevronDown,
  Loader2,
  MapPin,
  Search,
  Users,
  Wifi,
  X,
  ArrowRight,
} from "lucide-react";

import { Link } from "@/i18n/routing";
import { Pill } from "lucide-react";
import { useLocationCity } from "@/lib/hooks/useLocationCity";
import { fetchSearchLocations } from "@/lib/api";
import {
  usePublicAllClinics,
  type PublicClinic,
} from "@/lib/hooks/usePublicDirectory";

interface Location {
  id: string;
  nameEn: string;
  nameBn: string;
  nameHi: string;
  isActive?: boolean;
}

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

/* =========================================================
   GRADIENT CARD WRAPPER
========================================================= */

function GradientCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative rounded-[22px] p-[1.5px] bg-gradient-to-r from-[#252a67] via-[#3b4a8f] to-[#14B8A6] shadow-[0_10px_30px_-18px_rgba(37,42,103,0.3)] ${className}`}
    >
      <div className="h-full rounded-[20.5px] bg-white dark:bg-slate-900">
        {children}
      </div>
    </div>
  );
}

/* =========================================================
   CLINICS PAGE
========================================================= */

export default function ClinicsPage() {
  const t = useTranslations("ClinicSearch");
  const locale = useLocale();

  const { city, status, setManualCity } = useLocationCity();

  /* =======================================================
     SEARCH QUERY (live typing)
  ======================================================= */

  const [query, setQuery] = useState("");

  /* =======================================================
     LOCATIONS
  ======================================================= */

  const [locations, setLocations] = useState<Location[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [locationOpen, setLocationOpen] = useState(false);
  const locationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    setLocationsLoading(true);

    fetchSearchLocations()
      .then((data) => {
        if (!mounted) return;
        if (Array.isArray(data)) {
          setLocations(data);
        } else if (data && Array.isArray(data.data)) {
          setLocations(data.data);
        } else {
          setLocations([]);
        }
      })
      .catch(() => {
        if (mounted) setLocations([]);
      })
      .finally(() => {
        if (mounted) setLocationsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  /* Close location dropdown on outside click */
  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        locationRef.current &&
        !locationRef.current.contains(event.target as Node)
      ) {
        setLocationOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () =>
      document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  function getLocalizedName(location: Location) {
    const names: Record<string, string | undefined> = {
      en: location.nameEn,
      bn: location.nameBn,
      hi: location.nameHi,
    };
    return names[locale] ?? location.nameEn;
  }

  const selectedLocation =
    locations.find(
      (location) =>
        location.nameEn?.toLowerCase() === city?.toLowerCase()
    ) ?? null;

  const selectedLocationName = selectedLocation
    ? getLocalizedName(selectedLocation)
    : city || "";

  function handleSelectLocation(value: string) {
    setManualCity(value);
    setLocationOpen(false);
  }

  function clearLocation() {
    setManualCity("");
    setLocationOpen(false);
  }

  /* =======================================================
     DATA + FILTERING (crash-safe)
  ======================================================= */

  const { data, isLoading } = usePublicAllClinics();

  const clinics = (data as PublicClinic[]) ?? [];

  const filteredClinics = useMemo(() => {
    const q = query.trim().toLowerCase();
    const cityQuery = city?.trim().toLowerCase();

    return clinics.filter((clinic) => {
      const clinicCity = (clinic.city || "").toLowerCase();
      const clinicName = (clinic.clinicName || "").toLowerCase();
      const clinicAddress = (clinic.address || "").toLowerCase();

      const matchesCity = cityQuery
        ? clinicCity.includes(cityQuery)
        : true;

      const matchesQuery = q
        ? clinicName.includes(q) || clinicAddress.includes(q)
        : true;

      return matchesCity && matchesQuery;
    });
  }, [clinics, query, city]);

  const pharmacyClinics = filteredClinics.filter((clinic) => clinic.onlinePharmacyEnabled);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-7 lg:px-8">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#252a67] to-[#14B8A6] text-white shadow-sm">
          <Building2 className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-[28px]">
            {t("heading") || "Clinic Directory"}
          </h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            {t("subheading") ||
              "Search trusted healthcare facilities near you"}
          </p>
        </div>
      </div>

      {/* =====================================================
          SEARCH / LOCATION
      ===================================================== */}

      <GradientCard>
        <div className="p-3 sm:p-4">
          <div className="grid gap-3 md:grid-cols-[minmax(250px,0.82fr)_1px_minmax(360px,1.45fr)] md:items-center">
            {/* LOCATION */}
            <div ref={locationRef} className="relative min-w-0">
              <button
                type="button"
                onClick={() => setLocationOpen((v) => !v)}
                className="flex w-full items-center gap-3 rounded-[16px] border border-slate-200/90 bg-slate-50/75 px-3.5 py-3 text-left transition-all duration-200 hover:border-[#14B8A6]/35 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/10 dark:border-slate-700 dark:bg-slate-800/70 dark:hover:bg-slate-800"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#252a67] to-[#14B8A6] text-white shadow-sm">
                  <MapPin className="h-[17px] w-[17px]" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="mb-0.5 text-[9px] font-extrabold uppercase tracking-[0.13em] text-slate-400">
                    Location
                  </p>

                  {status === "loading" || locationsLoading ? (
                    <div className="flex items-center gap-2 py-0.5 text-sm font-semibold text-slate-600 dark:text-slate-300">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-[#14B8A6]" />
                      <span>Detecting location...</span>
                    </div>
                  ) : (
                    <span
                      className={`truncate text-sm font-semibold ${
                        selectedLocationName
                          ? "text-slate-800 dark:text-white"
                          : "text-slate-400"
                      }`}
                    >
                      {selectedLocationName || "All Locations"}
                    </span>
                  )}
                </div>

                {city && status !== "loading" ? (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      clearLocation();
                    }}
                    role="button"
                    aria-label="Clear location"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                  >
                    <X className="h-3.5 w-3.5" />
                  </span>
                ) : (
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
                      locationOpen ? "rotate-180" : ""
                    }`}
                  />
                )}
              </button>

              {locationOpen && !locationsLoading && (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-[0_18px_45px_-18px_rgba(15,27,51,0.28)] dark:border-slate-700 dark:bg-slate-900">
                  <button
                    type="button"
                    onClick={() => handleSelectLocation("")}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                      <MapPin className="h-3.5 w-3.5" />
                    </div>
                    <span className="min-w-0 flex-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      All Locations
                    </span>
                    {!city && <Check className="h-4 w-4 text-[#14B8A6]" />}
                  </button>

                  <div className="max-h-64 overflow-y-auto">
                    {locations
                      .filter((location) => location?.isActive !== false)
                      .map((location) => {
                        const isSelected =
                          city?.toLowerCase() ===
                          location.nameEn?.toLowerCase();

                        return (
                          <button
                            type="button"
                            key={location.id}
                            onClick={() =>
                              handleSelectLocation(location.nameEn)
                            }
                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                              isSelected
                                ? "bg-[#14B8A6]/8"
                                : "hover:bg-slate-50 dark:hover:bg-slate-800"
                            }`}
                          >
                            <div
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                isSelected
                                  ? "bg-[#14B8A6]/10 text-[#0f766e]"
                                  : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300"
                              }`}
                            >
                              <MapPin className="h-3.5 w-3.5" />
                            </div>
                            <span
                              className={`min-w-0 flex-1 truncate text-sm ${
                                isSelected
                                  ? "font-bold text-[#0f766e]"
                                  : "font-semibold text-slate-700 dark:text-slate-200"
                              }`}
                            >
                              {getLocalizedName(location)}
                            </span>
                            {isSelected && (
                              <Check className="h-4 w-4 shrink-0 text-[#14B8A6]" />
                            )}
                          </button>
                        );
                      })}

                    {locations.length === 0 && (
                      <div className="px-3 py-6 text-center">
                        <MapPin className="mx-auto h-5 w-5 text-slate-300" />
                        <p className="mt-2 text-xs font-medium text-slate-400">
                          No locations available
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Desktop divider */}
            <div className="hidden h-11 w-px bg-slate-200 md:block dark:bg-slate-700" />

            {/* SEARCH (live typing) */}
            <div className="flex min-w-0 items-center gap-3 rounded-[16px] border border-slate-200/90 bg-slate-50/75 px-3.5 py-3 transition-all duration-200 focus-within:border-[#14B8A6]/45 focus-within:bg-white dark:border-slate-700 dark:bg-slate-800/70 dark:focus-within:bg-slate-800">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm dark:bg-slate-700 dark:text-slate-300">
                <Search className="h-[17px] w-[17px]" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="mb-0.5 text-[9px] font-extrabold uppercase tracking-[0.13em] text-slate-400">
                  Search
                </p>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Clinic name or address..."
                  className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>

              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </GradientCard>

      {/* =====================================================
          RESULTS
      ===================================================== */}

      <div className="mt-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#14B8A6]" />
            <p className="mt-3 text-sm font-semibold text-slate-500">
              Loading clinics...
            </p>
          </div>
        ) : filteredClinics.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-12 text-center dark:border-slate-800 dark:bg-slate-900">
            <Building2 className="mb-3 h-10 w-10 text-slate-400" />
            <p className="text-base font-bold text-slate-800 dark:text-slate-200">
              No Clinics Found
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Try adjusting your search or location.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredClinics.map((clinic) => (
              <Link
                href={`/clinics/${clinic.id}`}
                key={clinic.id}
                className="group block h-full"
              >
                <div className="relative h-full rounded-2xl bg-gradient-to-br from-[#252a67] to-[#14B8A6] p-[2px] shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                  <div className="flex h-full flex-col overflow-hidden rounded-[calc(1rem-2px)] bg-white dark:bg-slate-900">
                    {/* Photo (top) */}
                    <div className="relative h-[150px] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                      {clinic.logo ? (
                        <img
                          src={clinic.logo}
                          alt={clinic.clinicName || "Clinic"}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#252a67] via-[#3b4a8f] to-[#14B8A6]">
                          <Building2 className="h-7 w-7 text-white/85" />
                          <span className="mt-1.5 text-lg font-extrabold tracking-wide text-white">
                            {initials(clinic.clinicName)}
                          </span>
                        </div>
                      )}

                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/25 to-transparent" />

                      {clinic.isApproved && (
                        <div className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 shadow-sm dark:bg-slate-800/95">
                          <BadgeCheck className="h-4 w-4 text-[#2563EB]" />
                        </div>
                      )}

                      <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 rounded-lg bg-[#0D9488]/95 px-2 py-1 shadow-sm backdrop-blur-sm">
                        <Users className="h-3 w-3 text-white" />
                        <span className="text-[10px] font-extrabold leading-none text-white">
                          {clinic.doctorsCount && clinic.doctorsCount > 0
                            ? `${clinic.doctorsCount} Doctors`
                            : "Onboarding"}
                        </span>
                      </div>
                    </div>

                    {/* Details (below) */}
                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="truncate text-[15px] font-extrabold leading-tight text-slate-900 dark:text-white">
                        {clinic.clinicName || "Clinic"}
                      </h3>

                      <p className="mt-1.5 flex items-center gap-1 truncate text-xs text-slate-500 dark:text-slate-400">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-[#14B8A6]" />
                        <span className="truncate">
                          {clinic.city || clinic.address || "Location N/A"}
                        </span>
                      </p>

                      {clinic.onlineConsultationEnabled && (
                        <div className="mt-2.5 flex items-center gap-1.5">
                          <span className="flex items-center gap-1 rounded-md border border-teal-100 bg-teal-50 px-2 py-1 text-[10px] font-bold text-[#0F766E] dark:border-teal-800 dark:bg-teal-900/30 dark:text-teal-400">
                            <Wifi className="h-3 w-3" />
                            Online Consultation
                          </span>
                        </div>
                      )}

                      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3.5 text-xs font-bold text-[#252a67] group-hover:text-[#14B8A6] dark:border-slate-800 dark:text-blue-400">
                        <span>View Clinic Details</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {!isLoading && pharmacyClinics.length > 0 && (
        <section className="mt-10">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0F766E] to-[#14B8A6] text-white shadow-sm">
              <Pill className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Online Pharmacy Delivery
              </h2>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                Clinics that provide medicines online
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pharmacyClinics.map((clinic) => (
              <Link
                href={`/clinics/${clinic.id}`}
                key={`pharmacy-${clinic.id}`}
                className="group flex items-center gap-3 rounded-2xl border border-teal-100 bg-white p-3.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-teal-900/40 dark:bg-slate-900"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#252a67] to-[#14B8A6] text-sm font-extrabold text-white">
                  {clinic.logo ? (
                    <img
                      src={clinic.logo}
                      alt={clinic.clinicName || "Clinic"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials(clinic.clinicName)
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-extrabold text-slate-900 dark:text-white">
                    {clinic.clinicName || "Clinic"}
                  </h3>
                  <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-500 dark:text-slate-400">
                    <MapPin className="h-3 w-3 shrink-0 text-[#14B8A6]" />
                    <span className="truncate">{clinic.city || clinic.address || "Location N/A"}</span>
                  </p>
                  <span className="mt-1.5 inline-flex items-center gap-1 rounded-md border border-teal-100 bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-[#0F766E] dark:border-teal-800 dark:bg-teal-900/30 dark:text-teal-400">
                    <Pill className="h-3 w-3" />
                    Online Pharmacy
                  </span>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-[#252a67] transition-transform group-hover:translate-x-1 group-hover:text-[#14B8A6] dark:text-blue-400" />
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
