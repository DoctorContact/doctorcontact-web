"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { useState } from "react";
import Image from "next/image";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Stethoscope,
  Clock,
  ArrowRight,
  AlertCircle,
  Phone,
  MessageCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { loginSchema, type LoginInput, type AuthUser } from "@doctor-contract/shared";
import { api, setAccessToken } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const CLINIC_PHONE = "+919777777777";
const CLINIC_WHATSAPP = "919777777777";

function routeForRole(role: string) {
  switch (role) {
    case "PATIENT":
      return "/patient";
    case "CLINIC":
      return "/clinic/dashboard";
    case "DOCTOR":
      return "/doctor/dashboard";
    case "RECEPTIONIST":
      return "/receptionist/dashboard";
    case "DIAGNOSTIC_CENTER":
      return "/diagnosticCenter/dashboard";
    case "DIAGNOSTIC_STAFF":
      return "/diagnosticStaff/dashboard";
    case "SUPER_ADMIN":
      return "/super_admin/dashboard";
    case "ADMIN":
      return "/admin/dashboard";
    default:
      return "/";
  }
}

export default function LoginPage() {
  const t = useTranslations("AuthPage");
  const router = useRouter();
  const { setUser } = useAuth();

  return (
    <main className="relative flex min-h-[calc(100vh-64px)] items-center justify-center bg-[var(--color-bg-soft)] px-4 py-8 sm:px-6 lg:px-8 dark:bg-[var(--color-bg)]">
      {/* Decorative Ambient Glow Elements */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-600/10" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl dark:bg-emerald-600/10" />

      <div className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl shadow-blue-950/5 lg:grid lg:grid-cols-12 dark:border-soft-300 dark:bg-surface dark:shadow-black/40">
        {/* ============================================================
            LEFT BRAND & HEALTHCARE SHOWCASE (Desktop)
        ============================================================ */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#12295E] via-[#1B3A8C] to-[#0f3470] p-8 text-white lg:col-span-5 lg:flex xl:p-10">
          {/* Subtle Background Pattern & Accents */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-emerald-400/10 blur-2xl" />

          {/* Top Brand Header */}
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-inner backdrop-blur-md">
                <Image
                  src="/logo-icon.png"
                  alt="Doctor Contact"
                  width={40}
                  height={40}
                  className="h-8 w-8 object-contain"
                  priority
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold tracking-tight text-white">
                    Doctor Contact
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                    Live
                  </span>
                </div>
                <p className="text-xs text-blue-200/80">Smart Healthcare & Queue Ecosystem</p>
              </div>
            </div>

            <div className="mt-8 space-y-2.5">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-blue-100 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                <span>Unified Healthcare Portal</span>
              </div>
              <h2 className="text-2xl font-bold leading-snug text-white xl:text-3xl">
                Fast, reliable care without waiting room stress.
              </h2>
              <p className="text-xs leading-relaxed text-blue-100/75 xl:text-sm">
                Book verified specialists, track live token queues in real-time, and manage clinic operations effortlessly.
              </p>
            </div>
          </div>

          {/* Middle Feature Highlights */}
          <div className="relative z-10 my-8 space-y-3">
            {/* Feature 1 */}
            <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm transition hover:bg-white/10">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-400/20 text-emerald-300">
                <Stethoscope className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white">Verified Specialists</h3>
                <p className="mt-0.5 text-[11px] text-blue-100/70">
                  Direct appointment booking with certified doctors & partner clinics.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm transition hover:bg-white/10">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-400/20 text-blue-300">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white">Live Queue Tracking</h3>
                <p className="mt-0.5 text-[11px] text-blue-100/70">
                  Know your token number before leaving home with zero guesswork.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm transition hover:bg-white/10">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-400/20 text-purple-300">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white">Encrypted & Secure</h3>
                <p className="mt-0.5 text-[11px] text-blue-100/70">
                  Enterprise-grade data privacy for patients, doctors & diagnostics.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Security Assurance */}
          <div className="relative z-10 border-t border-white/15 pt-4 text-xs text-blue-200/80">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span className="font-medium text-white/90">100% Secure Session</span>
              <span className="text-blue-300/40">•</span>
              <span>256-bit Encryption</span>
            </div>
          </div>
        </div>

        {/* ============================================================
            RIGHT LOGIN FORM
        ============================================================ */}
        <div className="flex flex-col justify-between p-6 sm:p-10 lg:col-span-7 xl:p-12">
          {/* Mobile Header (Shown on small screens) */}
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
                <Image
                  src="/logo-icon.png"
                  alt="Doctor Contact"
                  width={32}
                  height={32}
                  className="h-7 w-7 object-contain"
                  priority
                />
              </div>
              <Image
                src="/LOGO.png"
                alt="Doctor Contact"
                width={120}
                height={32}
                className="h-7 w-auto object-contain"
                priority
              />
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              Live Portal
            </span>
          </div>

          <div>
            {/* Heading & Subtitle */}
            <div className="space-y-1.5">
              <h1 className="text-2xl font-extrabold tracking-tight text-[var(--color-primary-dark-text)] sm:text-3xl">
                {t("loginHeading")}
              </h1>
              <p className="text-sm text-gray-500 dark:text-ink-500">{t("loginSubtitle")}</p>
            </div>

            <StaffPasswordLogin onSuccess={(user) => { setUser(user); router.push(routeForRole(user.role)); }} />
          </div>

          {/* Quick Clinic & Support Assistance Link */}
          <div className="mt-8 border-t border-gray-100 pt-5 text-center dark:border-soft-200">
            <p className="text-xs text-gray-500 dark:text-ink-500">
              Run a clinic or facing trouble logging in?
            </p>
            <div className="mt-2.5 flex items-center justify-center gap-3">
              <a
                href={"tel:" + CLINIC_PHONE}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary-text)] dark:border-soft-300 dark:text-ink-700"
              >
                <Phone className="h-3.5 w-3.5" />
                <span>Call Helpdesk</span>
              </a>
              <a
                href={"https://wa.me/" + CLINIC_WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:border-[var(--color-secondary)] hover:text-[var(--color-secondary-dark-text)] dark:border-soft-300 dark:text-ink-700"
              >
                <MessageCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// ==========================================================================
// Email OR phone + password login (Doctor/Clinic/Receptionist/Admin/Super
// Admin). Detects whether the identifier looks like an email or a phone
// number and sends the right field to /auth/login. Patients no longer have
// a login path here since Firebase phone-OTP was removed.
// ==========================================================================
function StaffPasswordLogin({ onSuccess }: { onSuccess: (user: AuthUser) => void }) {
  const t = useTranslations("AuthPage");
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput) {
    setServerError("");
    try {
      const identifier = (values.email ?? values.phone ?? "").trim();
      const payload = identifier.includes("@")
        ? { email: identifier, password: values.password }
        : { phone: identifier, password: values.password };

      const { data } = await api.post("/auth/login", payload);
      setAccessToken(data.data.accessToken);

      // 🟢 Update: Save Refresh Token & User to LocalStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("refreshToken", data.data.refreshToken);
        localStorage.setItem("user", JSON.stringify(data.data.user));
      }

      onSuccess(data.data.user);
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "response" in err) {
        const responseData = (err as { response?: { data?: { message?: string } } }).response?.data;
        setServerError(responseData?.message || t("genericError"));
      } else {
        setServerError(t("genericError"));
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-ink-700">
          {t("emailOrPhoneLabel")}
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 dark:text-ink-400">
            <Mail className="h-4 w-4" />
          </div>
          <input
            {...register("email")}
            placeholder={t("emailOrPhonePlaceholder")}
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pr-4 pl-10 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[var(--color-primary)] focus:bg-white focus:ring-4 focus:ring-[var(--color-primary)]/10 dark:border-soft-300 dark:bg-surface-100 dark:text-ink-900 dark:placeholder:text-ink-400 dark:focus:bg-surface"
          />
        </div>
        {errors.email && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{errors.email.message}</span>
          </p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-ink-700">
          {t("passwordLabel")}
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 dark:text-ink-400">
            <Lock className="h-4 w-4" />
          </div>
          <input
            {...register("password")}
            type={showPassword ? "text" : "password"}
            placeholder={t("passwordPlaceholder")}
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pr-11 pl-10 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[var(--color-primary)] focus:bg-white focus:ring-4 focus:ring-[var(--color-primary)]/10 dark:border-soft-300 dark:bg-surface-100 dark:text-ink-900 dark:placeholder:text-ink-400 dark:focus:bg-surface"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 transition hover:text-gray-600 dark:text-ink-400 dark:hover:text-ink-200"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{errors.password.message}</span>
          </p>
        )}
      </div>

      {serverError && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 sm:text-sm dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1B3A8C] to-[#12295E] py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 transition-all hover:from-[#152e70] hover:to-[#0c1c42] hover:shadow-xl active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{t("submitLoginLoading")}</span>
          </>
        ) : (
          <>
            <span>{t("submitLogin")}</span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>

      <div className="pt-2 text-center text-sm text-gray-500 dark:text-ink-500">
        {t("noAccount")}{" "}
        <Link
          href="/register"
          className="font-semibold text-[var(--color-primary-text)] underline-offset-4 hover:underline"
        >
          {t("signUpLink")}
        </Link>
      </div>
    </form>
  );
}