"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import {
  MapPin,
  Loader2,
  CheckCircle2,
  Building2,
  LogOut,
  Camera,
  Mail,
  Clock3,
  Users,
  UserRound,
  Activity,
  ChevronRight,
  ShieldCheck,
  Settings,
  CalendarClock,
} from "lucide-react";

import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "@/i18n/routing";
import toast from "react-hot-toast";

import {
  useClinicProfile,
  useUploadClinicLogo,
  useClinicDoctors,
  useClinicReceptionists,
  useToggleAutoFollowup,
} from "@/lib/hooks/useClinic";

// ============================================================
// SETTINGS CARD
// ============================================================

function SettingsCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`
        overflow-hidden
        rounded-2xl
        border
        border-slate-200/80
        bg-white
        shadow-[0_8px_30px_-22px_rgba(15,23,42,0.35)]
        dark:border-soft-300
        dark:bg-surface
        ${className}
      `}
    >
      {children}
    </section>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function ClinicOverviewPage() {
  const t = useTranslations("ClinicOverview");
  const tNav = useTranslations("ClinicNav");

  const {
    data: clinic,
    isLoading,
  } = useClinicProfile();

  const { data: doctors } =
    useClinicDoctors();

  const { data: receptionists } =
    useClinicReceptionists();

  const uploadLogo =
    useUploadClinicLogo();

  const { user, logout } =
    useAuth();

  const router = useRouter();

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const [logoPreview, setLogoPreview] =
    useState<string | null>(null);

  const [lastSynced, setLastSynced] =
    useState<Date | null>(null);

  // ==========================================================
  // EFFECTS
  // ==========================================================

  useEffect(() => {
    if (clinic) {
      setLastSynced(new Date());
    }
  }, [clinic]);

  // ==========================================================
  // LOGO UPLOAD
  // ==========================================================

  const handleLogoPick = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      e.target.files?.[0];

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error(
        "File size must be less than 5MB"
      );

      e.target.value = "";
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error(
        "Please upload an image file"
      );

      e.target.value = "";
      return;
    }

    // Immediate local preview

    const reader = new FileReader();

    reader.onload = (event) => {
      setLogoPreview(
        event.target?.result as string
      );
    };

    reader.readAsDataURL(file);

    try {
      await uploadLogo.mutateAsync(file);

      toast.success(
        "Logo uploaded successfully!"
      );
    } catch {
      setLogoPreview(null);

      toast.error(
        "Failed to upload logo"
      );
    } finally {
      e.target.value = "";
    }
  };

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const handleLogout = async () => {
    try {
      await logout();

      router.push("/login");

      toast.success(
        "Logged out successfully"
      );
    } catch {
      toast.error(
        "Failed to logout"
      );
    }
  };

  // ==========================================================
  // ADDRESS
  // ==========================================================

  const fullAddress = useMemo(() => {
    return [
      clinic?.address,
      clinic?.city,
      clinic?.state,
      clinic?.pincode,
    ]
      .filter(Boolean)
      .join(", ");
  }, [
    clinic?.address,
    clinic?.city,
    clinic?.state,
    clinic?.pincode,
  ]);

  // ==========================================================
  // LOGO URL
  // ==========================================================

  const logoUrl = useMemo(() => {
    return (
      logoPreview ||
      clinic?.logo ||
      null
    );
  }, [
    logoPreview,
    clinic?.logo,
  ]);

  // ==========================================================
  // COUNTS
  // ==========================================================

  const doctorCount =
    doctors?.length ?? 0;

  const receptionistCount =
    receptionists?.length ?? 0;

  const totalStaff =
    doctorCount +
    receptionistCount;

  // ==========================================================
  // LOADING
  // ==========================================================

  if (isLoading || !clinic) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-4 sm:space-y-5">

        <div className="h-24 animate-pulse rounded-2xl bg-slate-100 dark:bg-surface-100" />

        <div className="h-[500px] animate-pulse rounded-2xl bg-slate-100 dark:bg-surface-100" />

      </div>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 pb-6 sm:space-y-5">

      {/* ======================================================
          SETTINGS HEADER
          ====================================================== */}

      <SettingsCard>

        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">

          <div className="flex min-w-0 items-center gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#252a67]/[0.07] text-[#252a67]">
              <Settings className="h-5 w-5" />
            </div>

            <div className="min-w-0">

              <div className="flex flex-wrap items-center gap-2">

                <h1 className="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                  {t("heading")}
                </h1>

                {clinic.isApproved && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-700">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                  </span>
                )}

              </div>

              <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500 sm:text-xs">
                {t("subtitle")}
              </p>

            </div>

          </div>

          {/* Logout */}

          <button
            type="button"
            onClick={handleLogout}
            className="
              inline-flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-red-100
              bg-red-50
              px-4
              py-2.5
              text-xs
              font-bold
              text-red-600
              transition-all
              hover:border-red-200
              hover:bg-red-100
              sm:w-auto
            "
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>

        </div>

      </SettingsCard>

      {/* ======================================================
          CLINIC PROFILE
          ====================================================== */}

      <SettingsCard>

        <div className="p-4 sm:p-6 lg:p-8">

          {/* ==================================================
              PROFILE
              ================================================== */}

          <div className="flex flex-col items-center text-center">

            {/* ==================================================
                LARGE ROUND LOGO
                ================================================== */}

            <div className="relative">

              {/* Soft outer halo */}

              <div className="absolute inset-[-8px] rounded-full bg-gradient-to-br from-[#252a67]/5 via-transparent to-[#14B8A6]/10 blur-md" />

              {/* Outer ring */}

              <div
                className="
                  relative
                  flex
                  h-[124px]
                  w-[124px]
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-slate-200
                  bg-white
                  p-1.5
                  shadow-[0_14px_38px_-18px_rgba(37,42,103,0.45)]
                  sm:h-[136px]
                  sm:w-[136px]
                  sm:p-2
                "
              >

                {/* Logo */}

                <div
                  className="
                    flex
                    h-full
                    w-full
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-full
                    bg-gradient-to-br
                    from-[#252a67]
                    via-[#3b4a8f]
                    to-[#14B8A6]
                  "
                >

                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={`${clinic.clinicName} logo`}
                      className="
                        h-full
                        w-full
                        rounded-full
                        object-cover
                      "
                    />
                  ) : (
                    <Building2
                      className="
                        h-11
                        w-11
                        text-white
                        sm:h-12
                        sm:w-12
                      "
                    />
                  )}

                </div>

              </div>

              {/* ==================================================
                  CAMERA BUTTON
                  ================================================== */}

              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                disabled={
                  uploadLogo.isPending
                }
                aria-label="Change clinic logo"
                className="
                  absolute
                  bottom-0
                  right-0
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  border-[3px]
                  border-white
                  bg-[#252a67]
                  text-white
                  shadow-[0_7px_20px_-6px_rgba(37,42,103,0.7)]
                  transition-all
                  hover:scale-105
                  hover:bg-[#1e2457]
                  active:scale-95
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                  sm:h-11
                  sm:w-11
                "
              >

                {uploadLogo.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin sm:h-5 sm:w-5" />
                ) : (
                  <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
                )}

              </button>

            </div>

            {/* Hidden file input */}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoPick}
            />

            {/* ==================================================
                CLINIC NAME
                ================================================== */}

            <div className="mt-5 max-w-2xl">

              <div className="flex flex-wrap items-center justify-center gap-2.5">

                <h2
                  className="
                    text-[23px]
                    font-bold
                    tracking-[-0.02em]
                    text-slate-900
                    sm:text-[28px]
                    lg:text-[30px]
                  "
                >
                  {clinic.clinicName}
                </h2>

                {clinic.isApproved && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold text-emerald-700">

                    <ShieldCheck className="h-3 w-3" />

                    Verified

                  </span>
                )}

              </div>

              {/* Email */}

              <div className="mt-2.5 flex items-center justify-center gap-1.5 text-xs text-slate-500 sm:text-sm">

                <Mail className="h-3.5 w-3.5 shrink-0 text-[#3b4a8f]" />

                <span className="max-w-[90vw] truncate">
                  {user?.email ||
                    "admin@clinic.com"}
                </span>

              </div>

              {/* Address */}

              {fullAddress && (
                <div className="mt-1.5 flex items-start justify-center gap-1.5 px-2 text-[11px] leading-relaxed text-slate-400 sm:text-xs">

                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#14B8A6]" />

                  <span>
                    {fullAddress}
                  </span>

                </div>
              )}

            </div>

            {/* ==================================================
                SYNC STATUS
                ================================================== */}

            {lastSynced && (
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-[9px] font-medium text-slate-400">

                <Clock3 className="h-3 w-3" />

                {t("lastSynced")}:{" "}

                {lastSynced.toLocaleTimeString(
                  [],
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}

              </div>
            )}

          </div>

          {/* ==================================================
              DIVIDER
              ================================================== */}

          <div className="my-6 h-px bg-slate-100 sm:my-7" />

          {/* ==================================================
              STAFF OVERVIEW
              ================================================== */}

          <div>

            <div className="mb-3 flex items-end justify-between gap-3">

              <div>

                <h3 className="text-sm font-bold text-slate-800 sm:text-base">
                  Clinic Staff
                </h3>

                <p className="mt-0.5 text-[10px] text-slate-400 sm:text-xs">
                  Overview of your clinic team
                </p>

              </div>

              <span className="shrink-0 rounded-full bg-[#252a67]/[0.06] px-2.5 py-1 text-[9px] font-bold text-[#252a67]">
                {totalStaff} Total
              </span>

            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">

              <StatCard
                icon={Users}
                title={tNav("doctors")}
                value={doctorCount}
                iconClass="bg-[#252a67]/[0.07] text-[#252a67]"
              />

              <StatCard
                icon={UserRound}
                title={tNav("receptionists")}
                value={receptionistCount}
                iconClass="bg-indigo-50 text-indigo-600"
              />

              <StatCard
                icon={Activity}
                title="Total Staff"
                value={totalStaff}
                iconClass="bg-emerald-50 text-emerald-600"
              />

            </div>

          </div>

          {/* ==================================================
              ONLINE CONSULTATION
              ================================================== */}

          <div className="mt-5">

            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5 sm:p-4">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Activity className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">

                  <div className="flex flex-wrap items-center gap-2">

                    <h3 className="text-xs font-bold text-slate-800 sm:text-sm">
                      Online Consultation
                    </h3>

                    <span
                      className={`
                        rounded-full
                        px-2
                        py-0.5
                        text-[8px]
                        font-bold
                        ${
                          clinic.onlineConsultationEnabled
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-200 text-slate-500"
                        }
                      `}
                    >
                      {clinic.onlineConsultationEnabled
                        ? "ACTIVE"
                        : "INACTIVE"}
                    </span>

                  </div>

                  <p className="mt-0.5 text-[10px] leading-relaxed text-slate-500 sm:text-xs">
                    {clinic.onlineConsultationEnabled
                      ? "Online consultation is currently available."
                      : "Online consultation is currently unavailable."}
                  </p>

                </div>

                {/* Status dot */}

                <div
                  className={`
                    h-2.5
                    w-2.5
                    shrink-0
                    rounded-full
                    ${
                      clinic.onlineConsultationEnabled
                        ? "bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                        : "bg-slate-300"
                    }
                  `}
                />

              </div>

            </div>

          </div>

        </div>

      </SettingsCard>

      {/* ======================================================
          AUTOMATIC FOLLOW-UP
          ====================================================== */}

      {clinic && <AutoFollowupToggle enabled={!!(clinic as any).autoFollowupEnabled} />}

      {/* ======================================================
          FOOT NOTE
          ====================================================== */}

      <div className="px-1 text-center">

        <p className="text-[9px] leading-relaxed text-slate-400 sm:text-[10px]">
          Clinic information and account settings
          are securely managed here.
        </p>

      </div>

    </div>
  );
}

// ============================================================
// AUTOMATIC FOLLOW-UP TOGGLE
// ============================================================

function AutoFollowupToggle({ enabled }: { enabled: boolean }) {
  const toggle = useToggleAutoFollowup();
  const [on, setOn] = useState(enabled);

  async function flip() {
    const next = !on;
    setOn(next);
    try {
      await toggle.mutateAsync(next);
      toast.success(
        next
          ? "Automatic follow-up enabled — patients with no visit in a month will be auto-scheduled."
          : "Automatic follow-up disabled.",
      );
    } catch {
      setOn(!next);
      toast.error("Could not update the setting.");
    }
  }

  return (
    <SettingsCard>
      <div className="flex items-center gap-3 p-4 sm:p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1C63E7]">
          <CalendarClock className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-xs font-bold text-slate-800 sm:text-sm dark:text-white">
            Automatic follow-up after 1 month
          </h3>
          <p className="mt-0.5 text-[10px] leading-relaxed text-slate-500 sm:text-xs dark:text-ink-500">
            When ON, any patient with no visit in the last month is auto-scheduled a follow-up and notified.
          </p>
        </div>
        <button
          type="button"
          onClick={flip}
          disabled={toggle.isPending}
          aria-pressed={on}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? "bg-[#1C63E7]" : "bg-slate-300 dark:bg-slate-600"}`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`}
          />
        </button>
      </div>
    </SettingsCard>
  );
}

// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  icon: Icon,
  title,
  value,
  iconClass,
}: {
  icon: React.ElementType;
  title: string;
  value: number;
  iconClass: string;
}) {
  return (
    <div className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3.5 transition-all hover:border-slate-200 hover:shadow-sm">

      <div
        className={`
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-xl
          ${iconClass}
        `}
      >
        <Icon className="h-4.5 w-4.5" />
      </div>

      <div className="min-w-0">

        <p className="truncate text-[10px] font-semibold text-slate-400 sm:text-[11px]">
          {title}
        </p>

        <p className="mt-0.5 text-xl font-bold tracking-tight text-slate-900">
          {value}
        </p>

      </div>

      <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5" />

    </div>
  );
}