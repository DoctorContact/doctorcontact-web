"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  ShieldCheck,
  Loader2,
  Building2,
  Home,
  Search,
  Phone,
  MessageCircle,
  Navigation,
  ChevronRight,
  FlaskConical,
  X,
  ChevronDown,
  Check,
} from "lucide-react";

import { useAllDiagnosticCenters } from "@/lib/hooks/useDiagnosticCenter";
import { fetchSearchLocations } from "@/lib/api";

interface Location {
  id: string;
  nameEn: string;
  nameBn: string;
  nameHi: string;
  isActive?: boolean;
}

export default function AllLabsPage() {
  const t = useTranslations("DiagnosticCenter");
  const locale = useLocale();

  const {
    data: centers = [],
    isLoading,
    error,
  } = useAllDiagnosticCenters();

  const [homeServiceOnly, setHomeServiceOnly] = useState(false);
  const [selectedCity, setSelectedCity] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationOpen, setLocationOpen] = useState(false);

  const [locations, setLocations] = useState<Location[]>([]);
  const [isLocationsLoading, setIsLocationsLoading] = useState(true);

  const locationRef = useRef<HTMLDivElement>(null);

  /* =========================================================
     FETCH LOCATIONS
  ========================================================= */

  useEffect(() => {
    setIsLocationsLoading(true);

    fetchSearchLocations()
      .then((data) => {
        if (Array.isArray(data)) {
          setLocations(data);
        } else if (data && Array.isArray(data.data)) {
          setLocations(data.data);
        }
      })
      .catch((err) => {
        console.error("Failed to load locations", err);
      })
      .finally(() => {
        setIsLocationsLoading(false);
      });
  }, []);

  /* =========================================================
     CLOSE LOCATION DROPDOWN OUTSIDE CLICK
  ========================================================= */

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        locationRef.current &&
        !locationRef.current.contains(event.target as Node)
      ) {
        setLocationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /* =========================================================
     LOCALIZED LOCATION
  ========================================================= */

  const getLocalizedName = (loc: Location) => {
    if (locale === "bn") return loc.nameBn;
    if (locale === "hi") return loc.nameHi;

    return loc.nameEn;
  };

  /* =========================================================
     SELECTED LOCATION NAME
  ========================================================= */

  const selectedLocation =
    locations.find(
      (location) => location.nameEn === selectedCity
    ) || null;

  const selectedLocationName =
    selectedCity === "All"
      ? "All Locations"
      : selectedLocation
        ? getLocalizedName(selectedLocation)
        : selectedCity;

  /* =========================================================
     FILTER CENTERS
  ========================================================= */

  const filteredCenters = centers.filter((center: any) => {
    /* Home Service */

    if (
      homeServiceOnly &&
      center.hasHomeService !== true
    ) {
      return false;
    }

    /* Location */

    if (selectedCity !== "All") {
      const selected =
        selectedCity.toLowerCase().trim();

      const cityMatch = center.city
        ?.toLowerCase()
        .includes(selected);

      const addressMatch = center.address
        ?.toLowerCase()
        .includes(selected);

      if (!cityMatch && !addressMatch) {
        return false;
      }
    }

    /* Search */

    if (searchQuery.trim() !== "") {
      const query =
        searchQuery.toLowerCase().trim();

      const matchLabName = center.centerName
        ?.toLowerCase()
        .includes(query);

      const matchTestName =
        center.centerTests?.some((ct: any) =>
          ct.diagnosticTest?.name
            ?.toLowerCase()
            .includes(query)
        );

      if (!matchLabName && !matchTestName) {
        return false;
      }
    }

    return true;
  });

  /* =========================================================
     RESET FILTERS
  ========================================================= */

  const clearFilters = () => {
    setSelectedCity("All");
    setSearchQuery("");
    setHomeServiceOnly(false);
    setLocationOpen(false);
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (isLoading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              bg-gradient-to-br
              from-[#252a67]
              via-[#3b4a8f]
              to-[#14B8A6]
              shadow-lg
            "
          >
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Loading diagnostic centers...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center px-4">
        <div
          className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-8
            text-center
            shadow-sm
            dark:border-slate-800
            dark:bg-slate-900
          "
        >
          <Building2 className="mx-auto mb-3 h-10 w-10 text-slate-300" />

          <h3 className="font-bold text-slate-900 dark:text-white">
            Unable to load diagnostic centers
          </h3>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">

      {/* =======================================================
          HERO
      ======================================================= */}

      <section
        className="
          relative
          overflow-visible
          bg-gradient-to-br
          from-[#252a67]
          via-[#3b4a8f]
          to-[#14B8A6]
        "
      >

        {/* Background decoration */}

        <div
          className="
            pointer-events-none
            absolute
            -right-24
            -top-24
            h-64
            w-64
            rounded-full
            bg-white/10
            blur-3xl
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -bottom-24
            -left-24
            h-64
            w-64
            rounded-full
            bg-teal-300/10
            blur-3xl
          "
        />

        <div
          className="
            relative
            mx-auto
            max-w-7xl
            px-4
            pb-5
            pt-5
            sm:px-6
            sm:pb-7
            sm:pt-6
            lg:px-8
          "
        >

          {/* ===================================================
              HERO TITLE
          =================================================== */}

          <div className="mx-auto max-w-2xl text-center">

            {/* Badge */}

            <div
              className="
                mb-2
                inline-flex
                items-center
                gap-1.5
                rounded-full
                border
                border-white/20
                bg-white/10
                px-3
                py-1
                text-[8px]
                font-bold
                uppercase
                tracking-wider
                text-white
                backdrop-blur-md
                sm:text-[9px]
              "
            >
              <FlaskConical className="h-3 w-3 text-teal-200" />

              Trusted Diagnostic Network
            </div>

            {/* Heading */}

            <h1
              className="
                text-2xl
                font-black
                leading-[1.08]
                tracking-tight
                text-white
                sm:text-3xl
                lg:text-[38px]
              "
            >
              Find Trusted{" "}

              <span
                className="
                  bg-gradient-to-r
                  from-teal-200
                  to-white
                  bg-clip-text
                  text-transparent
                "
              >
                Diagnostic Centers
              </span>
            </h1>

            {/* Description */}

            <p
              className="
                mx-auto
                mt-2
                max-w-lg
                text-[11px]
                leading-5
                text-white/70
                sm:text-xs
              "
            >
              Find trusted laboratories, available tests and
              convenient home sample collection services near you.
            </p>

          </div>

          {/* ===================================================
              SEARCH PANEL
          =================================================== */}

          <div className="mx-auto mt-4 max-w-5xl">

            <div
              className="
                rounded-2xl
                border
                border-white/30
                bg-white
                p-1.5
                shadow-2xl
                shadow-black/10
                dark:bg-slate-900
              "
            >

              <div
                className="
                  flex
                  flex-col
                  gap-1.5
                  lg:flex-row
                "
              >

                {/* =================================================
                    LOCATION
                ================================================= */}

                <div
                  ref={locationRef}
                  className="
                    relative
                    lg:w-[210px]
                    lg:shrink-0
                  "
                >

                  <button
                    type="button"
                    onClick={() =>
                      setLocationOpen(!locationOpen)
                    }
                    className="
                      flex
                      h-10
                      w-full
                      items-center
                      rounded-xl
                      bg-slate-50
                      px-3
                      text-left
                      transition-all
                      hover:bg-slate-100
                      focus:outline-none
                      focus:ring-2
                      focus:ring-[#3b4a8f]/15
                      dark:bg-slate-800
                      dark:hover:bg-slate-750
                    "
                  >

                    {/* Location icon */}

                    <div
                      className="
                        flex
                        h-7
                        w-7
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        bg-white
                        shadow-sm
                        dark:bg-slate-700
                      "
                    >
                      <MapPin
                        className="
                          h-3.5
                          w-3.5
                          text-[#3b4a8f]
                          dark:text-teal-400
                        "
                      />
                    </div>

                    {/* Location text */}

                    <div className="ml-2 min-w-0 flex-1">

                      <p
                        className="
                          text-[8px]
                          font-bold
                          uppercase
                          tracking-wider
                          text-slate-400
                        "
                      >
                        Location
                      </p>

                      <p
                        className="
                          mt-0.5
                          truncate
                          text-xs
                          font-bold
                          text-slate-700
                          dark:text-slate-200
                        "
                      >
                        {selectedLocationName}
                      </p>

                    </div>

                    {/* Arrow */}

                    <ChevronDown
                      className={`
                        h-4
                        w-4
                        shrink-0
                        text-slate-400
                        transition-transform
                        duration-200
                        ${
                          locationOpen
                            ? "rotate-180 text-[#3b4a8f] dark:text-teal-400"
                            : ""
                        }
                      `}
                    />

                  </button>

                  {/* =================================================
                      LOCATION DROPDOWN
                  ================================================= */}

                  {locationOpen && (

                    <div
                      className="
                        absolute
                        left-0
                        right-0
                        top-[calc(100%+7px)]
                        z-[100]
                        overflow-hidden
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        p-1.5
                        shadow-2xl
                        shadow-slate-900/20
                        dark:border-slate-700
                        dark:bg-slate-900
                      "
                    >

                      {/* All Locations */}

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCity("All");
                          setLocationOpen(false);
                        }}
                        className={`
                          flex
                          w-full
                          items-center
                          gap-2.5
                          rounded-lg
                          px-3
                          py-2.5
                          text-left
                          transition
                          ${
                            selectedCity === "All"
                              ? "bg-gradient-to-r from-[#252a67]/10 to-[#14B8A6]/10"
                              : "hover:bg-slate-50 dark:hover:bg-slate-800"
                          }
                        `}
                      >

                        <div
                          className="
                            flex
                            h-7
                            w-7
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            bg-slate-100
                            dark:bg-slate-800
                          "
                        >
                          <MapPin
                            className="
                              h-3.5
                              w-3.5
                              text-[#3b4a8f]
                              dark:text-teal-400
                            "
                          />
                        </div>

                        <div className="min-w-0 flex-1">

                          <p
                            className="
                              text-xs
                              font-bold
                              text-slate-700
                              dark:text-slate-200
                            "
                          >
                            All Locations
                          </p>

                          <p
                            className="
                              text-[9px]
                              text-slate-400
                            "
                          >
                            Show all diagnostic centers
                          </p>

                        </div>

                        {selectedCity === "All" && (
                          <Check
                            className="
                              h-4
                              w-4
                              shrink-0
                              text-[#14B8A6]
                            "
                          />
                        )}

                      </button>

                      {/* Divider */}

                      {locations.length > 0 && (
                        <div
                          className="
                            my-1
                            border-t
                            border-slate-100
                            dark:border-slate-800
                          "
                        />
                      )}

                      {/* Location List */}

                      <div className="max-h-64 overflow-y-auto">

                        {locations.map((loc) => {

                          const isSelected =
                            selectedCity === loc.nameEn;

                          return (
                            <button
                              key={loc.id}
                              type="button"
                              onClick={() => {
                                setSelectedCity(loc.nameEn);
                                setLocationOpen(false);
                              }}
                              className={`
                                flex
                                w-full
                                items-center
                                gap-2.5
                                rounded-lg
                                px-3
                                py-2.5
                                text-left
                                transition
                                ${
                                  isSelected
                                    ? "bg-gradient-to-r from-[#252a67]/10 to-[#14B8A6]/10"
                                    : "hover:bg-slate-50 dark:hover:bg-slate-800"
                                }
                              `}
                            >

                              {/* Icon */}

                              <div
                                className={`
                                  flex
                                  h-7
                                  w-7
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-lg
                                  ${
                                    isSelected
                                      ? "bg-[#14B8A6]/10"
                                      : "bg-slate-100 dark:bg-slate-800"
                                  }
                                `}
                              >

                                <MapPin
                                  className={`
                                    h-3.5
                                    w-3.5
                                    ${
                                      isSelected
                                        ? "text-[#14B8A6]"
                                        : "text-slate-400"
                                    }
                                  `}
                                />

                              </div>

                              {/* Name */}

                              <div className="min-w-0 flex-1">

                                <p
                                  className={`
                                    truncate
                                    text-xs
                                    font-bold
                                    ${
                                      isSelected
                                        ? "text-[#252a67] dark:text-teal-400"
                                        : "text-slate-700 dark:text-slate-200"
                                    }
                                  `}
                                >
                                  {getLocalizedName(loc)}
                                </p>

                                {loc.nameEn !==
                                  getLocalizedName(loc) && (
                                  <p
                                    className="
                                      truncate
                                      text-[9px]
                                      text-slate-400
                                    "
                                  >
                                    {loc.nameEn}
                                  </p>
                                )}

                              </div>

                              {/* Selected */}

                              {isSelected && (
                                <Check
                                  className="
                                    h-4
                                    w-4
                                    shrink-0
                                    text-[#14B8A6]
                                  "
                                />
                              )}

                            </button>
                          );
                        })}

                      </div>

                      {/* Loading */}

                      {isLocationsLoading && (
                        <div
                          className="
                            flex
                            items-center
                            gap-2
                            px-3
                            py-3
                            text-[10px]
                            text-slate-400
                          "
                        >
                          <Loader2
                            className="
                              h-3.5
                              w-3.5
                              animate-spin
                            "
                          />

                          Loading locations...
                        </div>
                      )}

                      {/* Empty */}

                      {!isLocationsLoading &&
                        locations.length === 0 && (
                          <div
                            className="
                              px-3
                              py-4
                              text-center
                              text-[10px]
                              text-slate-400
                            "
                          >
                            No locations available
                          </div>
                        )}

                    </div>

                  )}

                </div>

                {/* =================================================
                    SEARCH
                ================================================= */}

                <div
                  className="
                    relative
                    flex
                    h-10
                    flex-1
                    items-center
                    rounded-xl
                    bg-slate-50
                    px-3
                    transition
                    focus-within:ring-2
                    focus-within:ring-[#3b4a8f]/10
                    dark:bg-slate-800
                  "
                >

                  {/* Search Icon */}

                  <div
                    className="
                      flex
                      h-7
                      w-7
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      bg-white
                      shadow-sm
                      dark:bg-slate-700
                    "
                  >
                    <Search
                      className="
                        h-3.5
                        w-3.5
                        text-[#3b4a8f]
                        dark:text-teal-400
                      "
                    />
                  </div>

                  {/* Input */}

                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) =>
                      setSearchQuery(e.target.value)
                    }
                    placeholder="Search tests, laboratories or diagnostic centers..."
                    className="
                      ml-2
                      h-full
                      w-full
                      bg-transparent
                      text-xs
                      font-medium
                      text-slate-700
                      outline-none
                      placeholder:text-slate-400
                      dark:text-slate-200
                    "
                  />

                  {/* Clear */}

                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="
                        ml-2
                        flex
                        h-6
                        w-6
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-slate-200
                        text-slate-500
                        transition
                        hover:bg-slate-300
                        hover:text-slate-800
                        dark:bg-slate-700
                        dark:hover:bg-slate-600
                        dark:hover:text-white
                      "
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}

                </div>

                {/* =================================================
                    HOME SERVICE
                ================================================= */}

                <button
                  type="button"
                  onClick={() =>
                    setHomeServiceOnly(!homeServiceOnly)
                  }
                  className={`
                    flex
                    h-11
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    px-5
                    text-xs
                    font-bold
                    transition-all
                    lg:w-[175px]
                    lg:shrink-0
                    ${
                      homeServiceOnly
                        ? "bg-gradient-to-r from-[#252a67] to-[#14B8A6] text-white shadow-md shadow-[#252a67]/20"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    }
                  `}
                >

                  <div
                    className={`
                      flex
                      h-7
                      w-7
                      items-center
                      justify-center
                      rounded-lg
                      ${
                        homeServiceOnly
                          ? "bg-white/15"
                          : "bg-white shadow-sm dark:bg-slate-700"
                      }
                    `}
                  >
                    <Home className="h-3.5 w-3.5" />
                  </div>

                  <span>
                    {homeServiceOnly
                      ? "Home Service On"
                      : "Home Service"}
                  </span>

                </button>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =========================================================
          CONTENT
      ========================================================= */}

      <section
        className="
          mx-auto
          max-w-7xl
          px-4
          py-5
          sm:px-6
          sm:py-6
          lg:px-8
        "
      >

        {/* =======================================================
            RESULT HEADER
        ======================================================= */}

        <div
          className="
            mb-4
            flex
            items-end
            justify-between
          "
        >

          <div>

            <div className="flex items-center gap-1.5">

              <FlaskConical
                className="
                  h-3.5
                  w-3.5
                  text-[#14B8A6]
                "
              />

              <span
                className="
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-[#3b4a8f]
                  dark:text-teal-400
                "
              >
                Diagnostic Network
              </span>

            </div>

            <h2
              className="
                mt-1
                text-xl
                font-black
                tracking-tight
                text-slate-900
                dark:text-white
                sm:text-2xl
              "
            >
              {filteredCenters.length} Diagnostic Centers
            </h2>

          </div>

          {/* Clear filters */}

          {(selectedCity !== "All" ||
            searchQuery ||
            homeServiceOnly) && (

            <button
              type="button"
              onClick={clearFilters}
              className="
                inline-flex
                items-center
                gap-1
                rounded-lg
                border
                border-slate-200
                bg-white
                px-2.5
                py-1.5
                text-[9px]
                font-bold
                text-slate-500
                transition
                hover:border-[#3b4a8f]
                hover:text-[#3b4a8f]
                dark:border-slate-700
                dark:bg-slate-900
                dark:text-slate-400
              "
            >
              <X className="h-3 w-3" />

              Clear
            </button>

          )}

        </div>

        {/* =======================================================
            EMPTY STATE
        ======================================================= */}

        {filteredCenters.length === 0 ? (

          <div
            className="
              rounded-2xl
              border
              border-slate-200
              bg-white
              px-5
              py-14
              text-center
              dark:border-slate-800
              dark:bg-slate-900
            "
          >

            <div
              className="
                mx-auto
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                bg-gradient-to-br
                from-[#252a67]/10
                to-[#14B8A6]/10
              "
            >
              <Search
                className="
                  h-6
                  w-6
                  text-[#3b4a8f]
                  dark:text-teal-400
                "
              />
            </div>

            <h3
              className="
                mt-4
                text-lg
                font-bold
                text-slate-900
                dark:text-white
              "
            >
              No Diagnostic Centers Found
            </h3>

            <p
              className="
                mt-1
                text-xs
                text-slate-500
                dark:text-slate-400
              "
            >
              Try changing your search or location filters.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="
                mt-5
                rounded-lg
                bg-gradient-to-r
                from-[#252a67]
                to-[#14B8A6]
                px-5
                py-2.5
                text-xs
                font-bold
                text-white
                shadow-md
              "
            >
              View All Centers
            </button>

          </div>

        ) : (

          /* =====================================================
             LAB GRID
          ===================================================== */

          <div
            className="
              grid
              grid-cols-1
              gap-4
              sm:grid-cols-2
              lg:grid-cols-3
              xl:grid-cols-4
            "
          >

            {filteredCenters.map((center: any, index: number) => {

              /* =================================================
                 WHATSAPP NUMBER
              ================================================= */

              const cleanWa = center.whatsapp
                ? center.whatsapp.replace(
                    /[^0-9]/g,
                    ""
                  )
                : "";

              const waNumber =
                cleanWa.length === 10
                  ? `91${cleanWa}`
                  : cleanWa;

              /* =================================================
                 LCP: only eager/priority-load the images that are
                 likely above the fold on first paint (first row).
                 Everything after that stays lazy-loaded.
              ================================================= */

              const isAboveFold = index < 4;

              /* =================================================
                 Responsive sizes matching the grid breakpoints:
                 1 col on mobile, 2 on sm, 3 on lg, 4 on xl.
                 Using the real rendered width instead of 100vw
                 stops the browser from downloading an oversized
                 image for every card.
              ================================================= */

              const cardImageSizes =
                "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw";

              return (

                /* =================================================
                   GRADIENT BORDER
                ================================================= */

                <div
                  key={center.id}
                  className="
                    group
                    rounded-[18px]
                    bg-gradient-to-br
                    from-[#252a67]
                    via-[#3b4a8f]
                    to-[#14B8A6]
                    p-[2px]
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:shadow-xl
                    hover:shadow-[#252a67]/15
                  "
                >

                  <Link
                    href={`/labs/${center.id}`}
                    className="
                      flex
                      h-full
                      flex-col
                      overflow-hidden
                      rounded-[16px]
                      bg-white
                      dark:bg-slate-900
                    "
                  >

                    {/* =================================================
                        FULL PHOTO AREA
                    ================================================= */}

                    <div
                      className="
                        relative
                        h-[142px]
                        w-full
                        overflow-hidden
                        bg-slate-100
                        dark:bg-slate-800
                        sm:h-[160px]
                      "
                    >
                      {center.logo ? (
                        <>
                          <Image
                            src={center.logo}
                            alt=""
                            fill
                            aria-hidden="true"
                            sizes={cardImageSizes}
                            priority={isAboveFold}
                            className="scale-125 object-cover opacity-25 blur-2xl"
                          />

                          <div className="absolute inset-0 flex items-center justify-center bg-white/40 px-3 py-3 dark:bg-slate-900/40 sm:px-4 sm:py-4">
                            <Image
                              src={center.logo}
                              alt={center.centerName}
                              fill
                              priority={isAboveFold}
                              sizes={cardImageSizes}
                              className="object-contain object-center drop-shadow-[0_8px_18px_rgba(15,23,42,0.12)] transition-transform duration-500 group-hover:scale-[1.012]"
                            />
                          </div>
                        </>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-200 dark:from-slate-800 dark:via-slate-800/80 dark:to-slate-900">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/85 shadow-lg dark:bg-slate-900/75">
                            <Building2 className="h-7 w-7 text-[#3b4a8f] dark:text-teal-400" />
                          </div>
                        </div>
                      )}

                      {center.isApproved && (
                        <div className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full border border-white/80 bg-white/95 px-2 py-1 text-[8px] font-bold text-[#252a67] shadow-md backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/95 dark:text-teal-400">
                          <ShieldCheck className="h-3 w-3" />
                          Verified
                        </div>
                      )}
                    </div>

                    {/* =================================================
                        DETAILS
                    ================================================= */}

                    <div
                      className="
                        flex
                        flex-1
                        flex-col
                        p-3.5
                      "
                    >

                      {/* =================================================
                          NAME
                      ================================================= */}

                      <div className="flex items-start gap-2">

                        <h3
                          className="
                            line-clamp-2
                            flex-1
                            text-sm
                            font-extrabold
                            leading-5
                            text-slate-900
                            transition-colors
                            group-hover:text-[#3b4a8f]
                            dark:text-white
                            dark:group-hover:text-teal-400
                          "
                        >
                          {center.centerName}
                        </h3>

                        {center.isApproved && (
                          <ShieldCheck
                            className="
                              mt-0.5
                              h-4
                              w-4
                              shrink-0
                              text-[#14B8A6]
                            "
                          />
                        )}

                      </div>

                      {/* =================================================
                          LOCATION
                      ================================================= */}

                      {(center.address ||
                        center.city) && (

                        <div
                          className="
                            mt-2
                            flex
                            items-start
                            gap-1.5
                          "
                        >

                          <MapPin
                            className="
                              mt-0.5
                              h-3.5
                              w-3.5
                              shrink-0
                              text-[#14B8A6]
                            "
                          />

                          <p
                            className="
                              line-clamp-2
                              text-[10px]
                              leading-4
                              text-slate-500
                              dark:text-slate-400
                            "
                          >
                            {center.address}

                            {center.city
                              ? `, ${center.city}`
                              : ""}
                          </p>

                        </div>

                      )}

                      {/* =================================================
                          BADGES
                      ================================================= */}

                      <div
                        className="
                          mt-2.5
                          flex
                          flex-nowrap
                          items-center
                          gap-1.5
                          overflow-x-auto
                        "
                      >

                        {/* ONLINE */}

                        {center.isOnline && (

                          <span
                            className="
                              inline-flex
                              items-center
                              gap-1
                              rounded-full
                              border
                              border-emerald-200
                              bg-emerald-50
                              px-2
                              py-1
                              text-[8px]
                              font-bold
                              text-emerald-700
                              dark:border-emerald-800/40
                              dark:bg-emerald-900/20
                              dark:text-emerald-400
                            "
                          >

                            <span
                              className="
                                h-1.5
                                w-1.5
                                animate-pulse
                                rounded-full
                                bg-emerald-500
                              "
                            />

                            ONLINE

                          </span>

                        )}

                        {/* HOME COLLECTION */}

                        {center.hasHomeService && (

                          <span
                            className="
                              inline-flex
                              items-center
                              gap-1
                              rounded-full
                              border
                              border-teal-200
                              bg-teal-50
                              px-2
                              py-1
                              text-[8px]
                              font-bold
                              text-teal-700
                              dark:border-teal-800/40
                              dark:bg-teal-900/20
                              dark:text-teal-400
                            "
                          >

                            <Home className="h-2.5 w-2.5" />

                            HOME COLLECTION

                          </span>

                        )}

                      </div>

                      {/* =================================================
                          AVAILABLE TESTS
                      ================================================= */}

                      {center.centerTests &&
                        center.centerTests.length > 0 && (

                        <div
                          className="
                            mt-3
                            border-t
                            border-slate-100
                            pt-3
                            dark:border-slate-800
                          "
                        >

                          <div
                            className="
                              mb-2
                              flex
                              items-center
                              justify-between
                            "
                          >

                            <p
                              className="
                                text-[9px]
                                font-bold
                                uppercase
                                tracking-wide
                                text-slate-400
                              "
                            >
                              Available Tests
                            </p>

                            <span
                              className="
                                text-[9px]
                                font-bold
                                text-[#14B8A6]
                              "
                            >
                              {center.centerTests.length}
                            </span>

                          </div>

                          <div
                            className="
                              flex
                              flex-wrap
                              gap-1
                            "
                          >

                            {center.centerTests
                              .slice(0, 5)
                              .map((ct: any) => (

                                <span
                                  key={ct.id}
                                  className="
                                    max-w-full
                                    rounded-md
                                    border
                                    border-teal-200
                                    bg-gradient-to-r
                                    from-[#252a67]/10
                                    to-[#14B8A6]/10
                                    px-1.5
                                    py-1
                                    text-[9px]
                                    font-bold
                                    text-[#14523f]
                                    dark:border-teal-800/40
                                    dark:from-teal-900/20
                                    dark:to-teal-900/20
                                    dark:text-teal-300
                                  "
                                >

                                  <span
                                    className="
                                      block
                                      max-w-[120px]
                                      truncate
                                    "
                                  >
                                    {ct.diagnosticTest?.name}
                                  </span>

                                </span>

                              ))}

                            {center.centerTests.length > 5 && (

                              <span
                                className="
                                  rounded-md
                                  bg-gradient-to-r
                                  from-[#252a67]/10
                                  to-[#14B8A6]/10
                                  px-1.5
                                  py-1
                                  text-[9px]
                                  font-bold
                                  text-[#3b4a8f]
                                  dark:text-teal-400
                                "
                              >
                                +{center.centerTests.length - 5}
                              </span>

                            )}

                          </div>

                        </div>

                      )}

                      {/* =================================================
                          QUICK ACTIONS
                      ================================================= */}

                      {(center.phone ||
                        center.whatsapp ||
                        center.googleMapsUrl) && (

                        <div
                          className="
                            mt-2.5
                            flex
                            flex-wrap
                            gap-1.5
                          "
                        >

                          {/* CALL */}

                          {center.phone && (

                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();

                                window.location.href =
                                  `tel:${center.phone}`;
                              }}
                              className="
                                inline-flex
                                items-center
                                gap-1
                                rounded-lg
                                border
                                border-blue-100
                                bg-blue-50
                                px-2
                                py-1.5
                                text-[9px]
                                font-bold
                                text-blue-700
                                transition
                                hover:bg-blue-100
                                dark:border-blue-900/40
                                dark:bg-blue-900/20
                                dark:text-blue-400
                              "
                            >

                              <Phone className="h-3 w-3" />

                              Call

                            </button>

                          )}

                          {/* WHATSAPP */}

                          {center.whatsapp && (

                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();

                                window.open(
                                  `https://wa.me/${waNumber}`,
                                  "_blank"
                                );
                              }}
                              className="
                                inline-flex
                                items-center
                                gap-1
                                rounded-lg
                                border
                                border-emerald-100
                                bg-emerald-50
                                px-2
                                py-1.5
                                text-[9px]
                                font-bold
                                text-emerald-700
                                transition
                                hover:bg-emerald-100
                                dark:border-emerald-900/40
                                dark:bg-emerald-900/20
                                dark:text-emerald-400
                              "
                            >

                              <MessageCircle className="h-3 w-3" />

                              WhatsApp

                            </button>

                          )}

                          {/* MAP */}

                          {center.googleMapsUrl && (

                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();

                                window.open(
                                  center.googleMapsUrl,
                                  "_blank"
                                );
                              }}
                              className="
                                inline-flex
                                items-center
                                gap-1
                                rounded-lg
                                border
                                border-red-100
                                bg-red-50
                                px-2
                                py-1.5
                                text-[9px]
                                font-bold
                                text-red-700
                                transition
                                hover:bg-red-100
                                dark:border-red-900/40
                                dark:bg-red-900/20
                                dark:text-red-400
                              "
                            >

                              <Navigation className="h-3 w-3" />

                              Maps

                            </button>

                          )}

                        </div>

                      )}


                      {/* =================================================
                          CTA
                      ================================================= */}

                      <div className="mt-3 pt-1">

                        <div
                          className="
                            flex
                            items-center
                            justify-between
                            rounded-lg
                            bg-slate-50
                            px-3
                            py-2.5
                            transition-all
                            group-hover:bg-gradient-to-r
                            group-hover:from-[#252a67]
                            group-hover:to-[#14B8A6]
                            dark:bg-slate-800
                          "
                        >

                          <span
                            className="
                              text-[10px]
                              font-extrabold
                              text-slate-700
                              transition-colors
                              group-hover:text-white
                              dark:text-slate-200
                            "
                          >
                            View Tests & Details
                          </span>

                          <ChevronRight
                            className="
                              h-3.5
                              w-3.5
                              text-[#3b4a8f]
                              transition-all
                              group-hover:translate-x-0.5
                              group-hover:text-white
                              dark:text-teal-400
                            "
                          />

                        </div>

                      </div>

                    </div>

                  </Link>

                </div>
              );
            })}

          </div>
        )}

      </section>

    </main>
  );
}