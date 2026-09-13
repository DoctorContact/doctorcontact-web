"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  MapPin,
  Phone,
  MessageCircle,
  Navigation,
  WifiOff,
  FileText,
  CheckCircle2,
  ShieldCheck,
  Loader2,
  Building2,
  Home,
  Activity,
} from "lucide-react";
import { usePublicCenterDetails } from "@/lib/hooks/useDiagnosticCenter";
import { useAuth } from "@/lib/auth-context";
import toast from "react-hot-toast";

export default function PublicLabDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const centerId = params.id as string;

  const { user } = useAuth();

  const { data, isLoading, error } =
    usePublicCenterDetails(centerId);

  /* ================================
     LOADING
  ================================= */

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 sm:h-12 sm:w-12" />

          <p className="animate-pulse text-xs font-medium text-slate-500 sm:text-sm">
            Loading lab details...
          </p>
        </div>
      </div>
    );
  }

  /* ================================
     ERROR
  ================================= */

  if (error || !data?.center) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center text-slate-500">
        <Building2 className="mb-4 h-14 w-14 text-slate-300 sm:h-16 sm:w-16" />

        <h2 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
          Lab Not Found
        </h2>

        <p className="mt-2 max-w-md text-xs text-slate-500 sm:text-sm">
          The diagnostic center you are looking for does not exist
          or has been removed.
        </p>

        <button
          onClick={() => router.push("/labs")}
          className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Browse All Labs
        </button>
      </div>
    );
  }

  const { center, tests } = data;

  /* ================================
     WHATSAPP
  ================================= */

  const handleWhatsApp = () => {
    if (center.whatsapp) {
      const cleanWa = center.whatsapp.replace(/[^0-9]/g, "");

      const waNumber =
        cleanWa.length === 10 ? `91${cleanWa}` : cleanWa;

      window.open(`https://wa.me/${waNumber}`, "_blank");
    }
  };

  /* ================================
     CALL
  ================================= */

  const handleCall = () => {
    if (center.phone) {
      window.open(`tel:${center.phone}`, "_self");
    }
  };

  /* ================================
     MAP
  ================================= */

  const handleMap = () => {
    if (center.googleMapsUrl) {
      window.open(center.googleMapsUrl, "_blank");
    } else if (center.latitude && center.longitude) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${center.latitude},${center.longitude}`,
        "_blank"
      );
    } else {
      toast.error("Location map is not available for this lab.");
    }
  };

  /* ================================
     BOOK TEST
     ------------------------------------------------
     There is no online booking flow yet, so instead of
     showing a fake "Proceeding to book" toast, the
     "Book Now" button on each test card now directly
     calls the lab's phone number — the person can book
     the test over the call. If the lab hasn't listed a
     phone number, fall back to WhatsApp, and only show
     an error toast if neither is available.
  ================================= */

  const handleBookTest = (testName: string) => {
    if (center.phone) {
      window.open(`tel:${center.phone}`, "_self");
      return;
    }

    if (center.whatsapp) {
      const cleanWa = center.whatsapp.replace(/[^0-9]/g, "");
      const waNumber = cleanWa.length === 10 ? `91${cleanWa}` : cleanWa;

      const message = encodeURIComponent(
        `Hi, I'd like to book "${testName}" at ${center.centerName}.`
      );

      window.open(`https://wa.me/${waNumber}?text=${message}`, "_blank");
      return;
    }

    toast.error("No contact number available for this lab.");
  };

  return (
    <div className="mx-auto max-w-6xl px-3 py-5 sm:px-6 sm:py-8 lg:px-8">

      {/* =====================================================
          PREMIUM LAB HEADER
      ====================================================== */}

      <div className="rounded-[24px] bg-gradient-to-br from-[#252a67] via-[#3b4a8f] to-[#14B8A6] p-[2px] shadow-lg shadow-blue-900/10">

        <div className="relative overflow-hidden rounded-[22px] bg-white dark:bg-slate-950">

          {/* Decorative Background */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-r from-blue-600/10 via-indigo-500/5 to-cyan-500/10 dark:from-blue-600/15 dark:via-indigo-500/5 dark:to-cyan-500/10" />

          <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="pointer-events-none absolute -left-20 top-10 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative p-4 sm:p-7 lg:p-8">

            {/* =================================================
                MAIN HEADER
            ================================================== */}

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

              {/* =================================================
                  LOGO + LAB INFORMATION
              ================================================== */}

              <div className="flex min-w-0 items-center gap-3.5 sm:gap-5">

                {/* LAB IMAGE */}

                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-slate-50 shadow-lg dark:border-slate-800 dark:bg-slate-900 sm:h-32 sm:w-32">

                  {center.logo ? (
  <Image
    src={center.logo}
    alt={center.centerName}
    fill
    priority
    sizes="(max-width: 640px) 96px, 128px"
    className="object-cover object-top"
  />
) : (
                    <div className="flex h-full w-full items-center justify-center bg-blue-50 dark:bg-blue-900/30">
                      <Building2 className="h-10 w-10 text-blue-500 sm:h-12 sm:w-12" />
                    </div>
                  )}

                </div>

                {/* LAB INFO */}

                <div className="min-w-0 flex-1">

                  {/* NAME */}

                  <div className="flex items-start gap-1.5 sm:gap-2">

                    <h1 className="line-clamp-2 text-xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-3xl lg:text-4xl">
                      {center.centerName}
                    </h1>

                    {center.isApproved && (
                      <ShieldCheck
                        className="mt-0.5 h-5 w-5 shrink-0 text-blue-500 sm:h-7 sm:w-7"
                        aria-label="Verified Lab"
                      />
                    )}

                  </div>

                  {/* BADGES */}

                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5 sm:mt-3 sm:gap-2">

                    {/* ONLINE */}

                    {center.isOnline ? (
                      <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 sm:px-3 sm:text-xs">

                        <span className="relative flex h-1.5 w-1.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />

                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        </span>

                        Available Now

                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400 sm:px-3 sm:text-xs">

                        <WifiOff className="h-3 w-3" />

                        Offline

                      </span>
                    )}

                    {/* HOME COLLECTION */}

                    {center.hasHomeService && (
                      <span className="flex items-center gap-1.5 rounded-full bg-purple-100 px-2.5 py-1 text-[10px] font-bold text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 sm:px-3 sm:text-xs">

                        <Home className="h-3 w-3 sm:h-3.5 sm:w-3.5" />

                        <span className="hidden sm:inline">
                          Home Sample Collection
                        </span>

                        <span className="sm:hidden">
                          Home Collection
                        </span>

                      </span>
                    )}

                  </div>

                  {/* LOCATION */}

                  <div className="mt-2.5 flex items-start gap-1.5 text-xs font-medium leading-relaxed text-slate-600 dark:text-slate-400 sm:mt-4 sm:text-sm">

                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400 sm:h-4 sm:w-4" />

                    <p className="line-clamp-2">
                      {[center.address, center.city, center.state]
                        .filter(Boolean)
                        .join(", ")}
                    </p>

                  </div>

                </div>

              </div>

              {/* =================================================
                  QUICK ACTIONS
              ================================================== */}

              <div className="grid grid-cols-3 gap-2 sm:flex sm:w-auto sm:min-w-[185px] sm:flex-col sm:gap-2.5">

                {center.whatsapp && (
                  <button
                    onClick={handleWhatsApp}
                    className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#25D366] px-2 text-[10px] font-bold text-white shadow-md shadow-green-500/15 transition hover:bg-[#20bd5a] active:scale-95 sm:h-11 sm:px-4 sm:text-sm"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>WhatsApp</span>
                  </button>
                )}

                {center.phone && (
                  <button
                    onClick={handleCall}
                    className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-2 text-[10px] font-bold text-white shadow-md shadow-blue-600/15 transition hover:bg-blue-700 active:scale-95 sm:h-11 sm:px-4 sm:text-sm"
                  >
                    <Phone className="h-4 w-4" />
                    <span>Call</span>
                  </button>
                )}

                {(center.googleMapsUrl ||
                  (center.latitude && center.longitude)) && (
                  <button
                    onClick={handleMap}
                    className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2 text-[10px] font-bold text-slate-700 transition hover:bg-slate-50 active:scale-95 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 sm:h-11 sm:px-4 sm:text-sm"
                  >
                    <Navigation className="h-4 w-4" />

                    <span className="hidden sm:inline">
                      Directions
                    </span>

                    <span className="sm:hidden">
                      Map
                    </span>
                  </button>
                )}

              </div>

            </div>

            {/* =================================================
                AUTHORIZATION NOTE
            ================================================== */}

            {center.authorizationNote && (
              <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-3.5 dark:border-amber-900/30 dark:from-amber-900/10 dark:to-orange-900/10 sm:mt-6 sm:p-4">

                <FileText className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                <div className="min-w-0">

                  <h4 className="text-xs font-bold text-amber-900 dark:text-amber-400 sm:text-sm">
                    Important Note from Lab
                  </h4>

                  <p className="mt-1 line-clamp-2 text-[11px] font-medium leading-relaxed text-amber-700/90 dark:text-amber-500/80 sm:text-sm">
                    {center.authorizationNote}
                  </p>

                </div>

              </div>
            )}

          </div>

        </div>

      </div>


      {/* =====================================================
          TESTS & PRICING
      ====================================================== */}

      <div className="mt-8 sm:mt-12">

        {/* SECTION HEADER */}

        <div className="mb-5 flex items-end justify-between sm:mb-7">

          <div>
            <div className="flex items-center gap-2">
              <div className="h-7 w-1 rounded-full bg-gradient-to-b from-[#252a67] to-[#14B8A6] sm:h-8" />

              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                Available Tests
              </h2>
            </div>

            <p className="mt-1.5 ml-3 text-[11px] text-slate-500 sm:text-sm dark:text-slate-400">
              Choose from available diagnostic tests
            </p>
          </div>

          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold text-slate-600 shadow-sm sm:px-3 sm:py-1.5 sm:text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            {tests.length} Tests
          </span>

        </div>


        {/* =================================================
            NO TESTS
        ================================================== */}

        {tests.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center dark:border-slate-700 dark:bg-slate-800/30">

            <Activity className="mb-4 h-12 w-12 text-slate-300 dark:text-slate-600" />

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              No Tests Listed
            </h3>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              This diagnostic center hasn't added any tests yet.
            </p>

          </div>
        ) : (

          /* =================================================
             MOBILE: 2 COLUMNS
             TABLET: 2 COLUMNS
             DESKTOP: 3 COLUMNS
          ================================================== */

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">

            {tests.map((ct: any) => (

              <div
                key={ct.id}
                className="group relative rounded-[18px] bg-gradient-to-br from-[#252a67]/20 via-slate-200 to-[#14B8A6]/25 p-[1px] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/10 dark:from-[#252a67]/70 dark:via-slate-700 dark:to-[#14B8A6]/60"
              >

                {/* INNER CARD */}

                <div className="relative flex min-h-[155px] flex-col justify-between overflow-hidden rounded-[17px] bg-white p-3.5 dark:bg-slate-950 sm:min-h-[205px] sm:p-5">

                  {/* Decorative glow */}

                  <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-blue-500/5 blur-2xl transition-all duration-300 group-hover:bg-cyan-400/10" />

                  {/* =================================================
                      TEST HEADER
                  ================================================== */}

                  <div className="relative">

                    <div className="flex items-start justify-between gap-2">

                      {/* Test Icon + Name */}

                      <div className="flex min-w-0 items-start gap-2">

                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#252a67] to-[#14B8A6] shadow-sm sm:h-9 sm:w-9 sm:rounded-xl">
                          <Activity className="h-3.5 w-3.5 text-white sm:h-4 sm:w-4" />
                        </div>

                        <div className="min-w-0">

                          <p className="mb-0.5 text-[8px] font-bold uppercase tracking-[0.14em] text-slate-400 sm:text-[9px]">
                            Diagnostic Test
                          </p>

                          <h3 className="line-clamp-2 text-[13px] font-extrabold leading-tight tracking-tight text-slate-900 transition-colors group-hover:text-[#252a67] sm:text-[17px] dark:text-white dark:group-hover:text-teal-400">
                            {ct.diagnosticTest?.name}
                          </h3>

                        </div>

                      </div>

                      {/* Verified */}

                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 sm:h-6 sm:w-6 dark:bg-emerald-900/20">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 sm:h-4 sm:w-4" />
                      </div>

                    </div>


                    {/* DESCRIPTION */}

                    {ct.diagnosticTest?.description && (
                      <p className="mt-2.5 line-clamp-2 pl-0.5 text-[9.5px] leading-relaxed text-slate-500 sm:mt-3 sm:text-xs dark:text-slate-400">
                        {ct.diagnosticTest.description}
                      </p>
                    )}

                  </div>


                  {/* =================================================
                      PRICE + BOOK
                  ================================================== */}

                  <div className="relative mt-3 border-t border-slate-100 pt-3 sm:mt-5 sm:pt-4 dark:border-slate-800">

                    <div className="flex items-end justify-between gap-2">

                      {/* PRICE */}

                      <div>
                        <p className="mb-0.5 text-[8px] font-bold uppercase tracking-[0.12em] text-slate-400 sm:text-[9px]">
                          Starting Price
                        </p>

                        <p className="text-[18px] font-black leading-none tracking-tight text-slate-900 sm:text-[22px] dark:text-white">

                          <span className="mr-0.5 text-[12px] font-bold text-slate-400 sm:text-base">
                            ₹
                          </span>

                          {Number(ct.price).toFixed(0)}

                        </p>
                      </div>


                      {/* BOOK BUTTON — now dials the lab directly */}

                      <button
                        onClick={() =>
                          handleBookTest(ct.diagnosticTest?.name)
                        }
                        className="flex shrink-0 items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-[#252a67] to-[#3b4a8f] px-2.5 py-1.5 text-[9px] font-bold text-white shadow-sm transition-all duration-200 hover:from-[#1e2257] hover:to-[#14B8A6] hover:shadow-md active:scale-95 sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-xs"
                      >
                        <Phone className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        Book Now
                      </button>

                    </div>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}