"use client";

import {
  Search,
  MapPin,
  ChevronDown,
  Mic,
  Users,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { fetchSearchLocations } from "@/lib/api";

interface Location {
  id: string;
  nameEn: string;
  nameBn: string;
  nameHi: string;
  isActive?: boolean;
}

const POPULAR_SEARCHES = [
  "Cardiologist",
  "Skin clinic",
  "Diabetes treatment",
  "Pediatrician",
];

export default function Hero() {
  const t = useTranslations("Hero");
  const locale = useLocale();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isListening, setIsListening] = useState(false);

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
      .catch((err) =>
        console.error("Failed to load locations", err)
      )
      .finally(() => setIsLoading(false));
  }, []);

  const getLocalizedName = (loc: Location) => {
    if (locale === "bn") return loc.nameBn;
    if (locale === "hi") return loc.nameHi;
    return loc.nameEn;
  };

  function runSearch(q: string, loc: string) {
    const params = new URLSearchParams();

    if (q.trim()) {
      params.set("q", q.trim());
    }

    if (loc.trim()) {
      params.set("city", loc.trim());
    }

    const qs = params.toString();

    router.push(
      qs ? `/doctors?${qs}` : "/doctors"
    );
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    runSearch(query, selectedLocation);
  }

  /* =========================
     VOICE SEARCH
  ========================= */

  function startVoiceSearch() {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Voice search is not supported in this browser."
      );
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang =
      locale === "bn"
        ? "bn-IN"
        : locale === "hi"
        ? "hi-IN"
        : "en-IN";

    recognition.interimResults = false;
    recognition.continuous = false;

    setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript =
        event.results?.[0]?.[0]?.transcript || "";

      const value = transcript.trim();

      if (value) {
        setQuery(value);

        /*
         * Small delay gives the input time to update,
         * then automatically performs the search.
         */
        setTimeout(() => {
          runSearch(value, selectedLocation);
        }, 250);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }

  return (
    <section
      id="search"
      className="
        relative
        overflow-hidden
        bg-gradient-to-b
        from-[#EBF3FF]
        via-[#F5F8FD]
        to-white
        pt-5
        pb-5
        sm:pt-6
        sm:pb-6
        lg:pt-7
        lg:pb-7
        dark:from-[#0C1526]
        dark:via-[#0C1526]
        dark:to-[var(--color-bg)]
      "
    >
      {/* =========================
          BACKGROUND AMBIENCE
      ========================= */}

      <div
        className="
          pointer-events-none
          absolute
          -left-32
          -top-32
          h-80
          w-80
          rounded-full
          bg-[#1C63E7]/8
          blur-3xl
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -right-32
          top-20
          h-80
          w-80
          rounded-full
          bg-[#16A34A]/6
          blur-3xl
        "
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div
          className="
            grid
            items-center
            gap-6
            lg:grid-cols-12
            lg:gap-8
          "
        >
          {/* =========================
              LEFT CONTENT
          ========================= */}

          <div
            className="
              lg:col-span-8
              lg:py-1
            "
          >
            {/* Brand / Eyebrow */}

            <div className="flex items-center gap-2">
              <div
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-white/80
                  bg-white
                  shadow-[0_4px_14px_rgba(28,99,231,0.10)]
                  dark:border-soft-300
                  dark:bg-surface
                "
              >
                <img
                  src="/logo-icon.png"
                  alt="DoctorContact"
                  className="h-5.5 w-5.5 object-contain"
                />
              </div>

              <p
                className="
                  text-[10px]
                  font-extrabold
                  uppercase
                  tracking-[0.18em]
                  text-[#1C63E7]
                  sm:text-[11px]
                  dark:text-[var(--color-primary-text)]
                "
              >
                {t("eyebrow") ||
                  "Find the Right Health Services. Connect with the Right Care."}
              </p>
            </div>

            {/* =========================
                HERO TITLE
            ========================= */}

            <h1
              className="
                mt-3
                max-w-3xl
                text-[2.55rem]
                font-extrabold
                leading-[1.08]
                tracking-[-0.035em]
                text-[#0F1B33]
                sm:text-[3rem]
                md:text-[3.35rem]
                lg:text-[3.45rem]
                dark:text-ink-900
              "
            >
              Your Health{" "}
              <span className="text-[#1C63E7]">
                Our Priority
              </span>
            </h1>

            {/* =========================
                DESCRIPTION
            ========================= */}

            <p
              className="
                mt-3
                max-w-xl
                text-[14px]
                leading-relaxed
                text-slate-600
                sm:text-[15px]
                md:text-base
                dark:text-ink-600
              "
            >
              Find trusted doctors, nearby clinics,
              book appointments and access healthcare
              services — all in one place.
            </p>

            {/* =========================
                SEARCH
            ========================= */}

            <form
              onSubmit={handleSearch}
              className="
                mt-6
                flex
                w-full
                max-w-3xl
                flex-col
                rounded-[20px]
                border
                border-slate-200/90
                bg-white
                p-1.5
                shadow-[0_12px_35px_rgba(28,99,231,0.10)]
                transition-all
                duration-300
                hover:shadow-[0_16px_42px_rgba(28,99,231,0.14)]
                sm:flex-row
                sm:items-center
                sm:rounded-full
                dark:border-soft-300
                dark:bg-surface
              "
            >
              {/* =========================
                  LOCATION
              ========================= */}

              <div
                className="
                  relative
                  flex
                  items-center
                  border-b
                  border-slate-100
                  px-3.5
                  py-2.5
                  sm:w-[34%]
                  sm:border-b-0
                  sm:border-r
                  sm:border-slate-200/80
                  sm:py-2
                  dark:border-soft-200
                "
              >
                <MapPin
                  className="
                    h-4
                    w-4
                    shrink-0
                    text-[#1C63E7]
                  "
                />

                <select
                  value={selectedLocation}
                  onChange={(e) =>
                    setSelectedLocation(
                      e.target.value
                    )
                  }
                  disabled={isLoading}
                  className="
                    w-full
                    cursor-pointer
                    appearance-none
                    bg-transparent
                    pl-2
                    pr-6
                    text-xs
                    font-semibold
                    text-slate-800
                    outline-none
                    disabled:opacity-50
                    sm:text-sm
                    dark:text-ink-800
                  "
                >
                  <option value="">
                    {locale === "bn"
                      ? "দুবরাজপুর, পশ্চিমবঙ্গ"
                      : "Dubrajpur, West Bengal"}
                  </option>

                  {locations.map((loc) => (
                    <option
                      key={loc.id}
                      value={loc.nameEn}
                    >
                      {getLocalizedName(loc)}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  className="
                    pointer-events-none
                    absolute
                    right-3
                    h-3.5
                    w-3.5
                    text-slate-400
                  "
                />
              </div>

              {/* =========================
                  SEARCH INPUT + VOICE (always inline)
              ========================= */}

              <div
                className="
                  flex
                  min-w-0
                  flex-1
                  items-center
                  px-3
                  py-2.5
                  sm:py-2
                "
              >
                <Search
                  className="
                    mr-2
                    h-4
                    w-4
                    shrink-0
                    text-slate-400
                  "
                />

                <input
                  value={query}
                  onChange={(e) =>
                    setQuery(e.target.value)
                  }
                  placeholder={
                    locale === "bn"
                      ? "ডাক্তার, ক্লিনিক বা চিকিৎসা খুঁজুন..."
                      : "Search doctors, clinics, treatments..."
                  }
                  className="
                    w-full
                    min-w-0
                    bg-transparent
                    text-xs
                    font-medium
                    text-slate-800
                    outline-none
                    placeholder:text-slate-400
                    sm:text-sm
                    dark:text-ink-800
                    dark:placeholder:text-ink-400
                  "
                />

                {/* =========================
                    VOICE BUTTON — INSIDE INPUT (top right)
                ========================= */}

                <button
                  type="button"
                  onClick={startVoiceSearch}
                  aria-label="Voice search"
                  className={`
                    ml-1.5
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    transition-all
                    ${
                      isListening
                        ? "bg-[#1C63E7] text-white shadow-md"
                        : "text-[#1C63E7] hover:bg-blue-50"
                    }
                    dark:hover:bg-soft-100
                  `}
                >
                  <Mic
                    className={`h-4 w-4 ${
                      isListening
                        ? "animate-pulse"
                        : ""
                    }`}
                  />
                </button>
              </div>

              {/* =========================
                  ACTIONS — only Search button now
              ========================= */}

              <div
                className="
                  flex
                  items-center
                  px-1.5
                  pb-1.5
                  sm:p-0
                  sm:pr-1
                "
              >
                <button
                  type="submit"
                  className="
                    flex
                    w-full
                    items-center
                    justify-center
                    rounded-full
                    bg-[#1C63E7]
                    px-6
                    py-2.5
                    text-xs
                    font-bold
                    text-white
                    shadow-[0_5px_14px_rgba(28,99,231,0.22)]
                    transition-all
                    duration-200
                    hover:bg-[#1550C4]
                    hover:shadow-[0_7px_18px_rgba(28,99,231,0.28)]
                    active:scale-[0.98]
                    sm:w-auto
                    sm:flex-none
                    sm:text-sm
                  "
                >
                  Search
                </button>
              </div>
            </form>

            {/* =========================
                POPULAR SEARCHES
            ========================= */}

            <div
              className="
                mt-3
                flex
                flex-wrap
                items-center
                gap-x-1.5
                gap-y-1
                text-xs
                text-slate-500
              "
            >
              <span
                className="
                  font-semibold
                  text-slate-700
                  dark:text-ink-700
                "
              >
                Popular searches:
              </span>

              {POPULAR_SEARCHES.map(
                (term, index) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setQuery(term);
                      runSearch(
                        term,
                        selectedLocation
                      );
                    }}
                    className="
                      font-medium
                      text-slate-600
                      underline-offset-2
                      transition-colors
                      hover:text-[#1C63E7]
                      hover:underline
                      dark:text-ink-600
                    "
                  >
                    {term}
                    {index <
                    POPULAR_SEARCHES.length - 1
                      ? ","
                      : "..."}
                  </button>
                )
              )}
            </div>
          </div>

          {/* =========================
              RIGHT BRANDING PANEL
          ========================= */}

          <div
            className="
              relative
              hidden
              items-center
              justify-center
              lg:col-span-4
              lg:flex
            "
          >
            <div
              className="
                relative
                flex
                h-[260px]
                w-[260px]
                items-center
                justify-center
              "
            >
              {/* Soft circles */}

              <div
                className="
                  absolute
                  inset-5
                  rounded-full
                  border
                  border-[#1C63E7]/10
                "
              />

              <div
                className="
                  absolute
                  inset-10
                  rounded-full
                  border
                  border-[#1C63E7]/10
                "
              />

              {/* Main logo */}

              <div
                className="
                  relative
                  z-10
                  flex
                  h-32
                  w-32
                  items-center
                  justify-center
                  rounded-[32px]
                  border
                  border-white/90
                  bg-white
                  shadow-[0_20px_55px_rgba(15,27,51,0.10)]
                  dark:border-soft-300
                  dark:bg-surface
                "
              >
                <img
                  src="/main.png"
                  alt="DoctorContact"
                  className="
                    h-20
                    w-20
                    object-contain
                  "
                />
              </div>

              {/* Floating trust badge */}

              <div
                className="
                  absolute
                  bottom-4
                  right-0
                  z-20
                  flex
                  items-center
                  gap-2.5
                  rounded-2xl
                  border
                  border-slate-100
                  bg-white/95
                  px-3.5
                  py-2.5
                  shadow-[0_10px_28px_rgba(15,27,51,0.09)]
                  backdrop-blur-md
                  dark:border-soft-300
                  dark:bg-surface/95
                "
              >
                <div
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    bg-blue-50
                    text-[#1C63E7]
                  "
                >
                  <Users className="h-4.5 w-4.5" />
                </div>

                <div>
                  <p className="text-[10px] font-medium text-slate-500">
                    Trusted by
                  </p>

                  <p className="text-sm font-extrabold leading-tight text-[#0F1B33] dark:text-ink-900">
                    10,000+
                  </p>

                  <p className="text-[9px] font-medium text-slate-400">
                    Happy Patients
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}