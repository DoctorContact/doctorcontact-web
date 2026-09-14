"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Mail, Lock, Eye, EyeOff, ShieldCheck, Stethoscope, Clock, ArrowRight,
  AlertCircle, Phone, MessageCircle, Loader2, Sparkles, Edit2, RefreshCcw, Info
} from "lucide-react";
import { loginSchema, type LoginInput, type AuthUser } from "@doctor-contract/shared";
import { api, setAccessToken } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import OtpInput from "@/components/auth/OtpInput";

const CLINIC_PHONE = "+919777777777";
const CLINIC_WHATSAPP = "919777777777";

function routeForRole(role: string) {
  switch (role) {
    case "PATIENT": return "/patient";
    case "CLINIC": return "/clinic/dashboard";
    case "DOCTOR": return "/doctor/dashboard";
    case "RECEPTIONIST": return "/receptionist/dashboard";
    case "DIAGNOSTIC_CENTER": return "/diagnosticCenter/dashboard";
    case "DIAGNOSTIC_STAFF": return "/diagnosticStaff/dashboard";
    case "SUPER_ADMIN": return "/super_admin/dashboard";
    case "ADMIN": return "/admin/dashboard";
    default: return "/";
  }
}

export default function LoginPage() {
  const t = useTranslations("AuthPage");
  const router = useRouter();
  const { setUser } = useAuth();
  const [mode, setMode] = useState<"patient" | "staff">("patient");

  return (
    <main className="relative flex min-h-[calc(100vh-64px)] items-center justify-center bg-[var(--color-bg-soft)] px-4 py-8 sm:px-6 lg:px-8 dark:bg-[var(--color-bg)]">
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-600/10" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl dark:bg-emerald-600/10" />

      <div className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl shadow-blue-950/5 lg:grid lg:grid-cols-12 dark:border-soft-300 dark:bg-surface dark:shadow-black/40">
        
        {/* Left Side Branding */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#12295E] via-[#1B3A8C] to-[#0f3470] p-8 text-white lg:col-span-5 lg:flex xl:p-10">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-emerald-400/10 blur-2xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-inner backdrop-blur-md">
                <Image src="/logo-icon.png" alt="Doctor Contact" width={40} height={40} className="h-8 w-8 object-contain" priority />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold tracking-tight text-white">Doctor Contact</span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> Live
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
              <h2 className="text-2xl font-bold leading-snug text-white xl:text-3xl">Fast, reliable care without waiting room stress.</h2>
            </div>
          </div>

          <div className="relative z-10 my-8 space-y-3">
            <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm transition hover:bg-white/10">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-400/20 text-emerald-300"><Stethoscope className="h-4 w-4" /></div>
              <div>
                <h3 className="text-xs font-semibold text-white">Verified Specialists</h3>
                <p className="mt-0.5 text-[11px] text-blue-100/70">Direct appointment booking with certified doctors.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm transition hover:bg-white/10">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-400/20 text-blue-300"><Clock className="h-4 w-4" /></div>
              <div>
                <h3 className="text-xs font-semibold text-white">Live Queue Tracking</h3>
                <p className="mt-0.5 text-[11px] text-blue-100/70">Know your token number before leaving home.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex flex-col justify-between p-6 sm:p-10 lg:col-span-7 xl:p-12">
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
                <Image src="/logo-icon.png" alt="Doctor Contact" width={32} height={32} className="h-7 w-7 object-contain" priority />
              </div>
              <Image src="/LOGO.png" alt="Doctor Contact" width={120} height={32} className="h-7 w-auto object-contain" priority />
            </div>
          </div>

          <div>
            <div className="space-y-1.5">
              <h1 className="text-2xl font-extrabold tracking-tight text-[var(--color-primary-dark-text)] sm:text-3xl">
                {mode === "patient" ? "Patient Portal" : "Staff Portal"}
              </h1>
              <p className="text-sm text-gray-500 dark:text-ink-500">
                {mode === "patient" ? "Login or register instantly with your phone number." : "Secure access for doctors, clinics, and admins."}
              </p>
            </div>

            <div className="mt-6 flex rounded-xl border border-gray-200 bg-gray-50/80 p-1.5 dark:border-soft-200 dark:bg-surface-100">
              <button onClick={() => setMode("patient")} className={`flex-1 rounded-lg py-2.5 text-xs font-bold transition-all duration-300 ${mode === "patient" ? "bg-white text-blue-700 shadow-md ring-1 ring-black/5 dark:bg-surface dark:text-blue-400" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-ink-500 dark:hover:bg-surface/50"}`}>Patient</button>
              <button onClick={() => setMode("staff")} className={`flex-1 rounded-lg py-2.5 text-xs font-bold transition-all duration-300 ${mode === "staff" ? "bg-white text-blue-700 shadow-md ring-1 ring-black/5 dark:bg-surface dark:text-blue-400" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-ink-500 dark:hover:bg-surface/50"}`}>Clinic / Staff</button>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              {mode === "patient" ? <PatientPhoneLogin onSuccess={(user) => { setUser(user); router.push(routeForRole(user.role)); }} /> : <StaffPasswordLogin onSuccess={(user) => { setUser(user); router.push(routeForRole(user.role)); }} />}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function PatientPhoneLogin({ onSuccess }: { onSuccess: (user: AuthUser) => void }) {
  const router = useRouter();
  const [step, setStep] = useState<"enter-phone" | "enter-otp">("enter-phone");
  const [phoneInput, setPhoneInput] = useState("");
  const [otp, setOtp] = useState("");
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "enter-otp" && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  async function handleSendOtp() {
    setServerError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/send-otp", { phone: phoneInput });
      
      if (data.data?.isNewUser) {
        // নতুন ইউজার হলে সোজা রেজিস্টার পেজে চলে যাবে
        router.push(`/register?phone=${phoneInput}`);
        return;
      }

      setStep("enter-otp");
      setTimer(300); // 5 Mins Cooldown
      setOtp(""); 
    } catch (err: any) {
      setServerError(err.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmOtp() {
    setServerError("");
    setSubmitting(true);
    try {
      const { data } = await api.post("/auth/verify-otp", { phone: phoneInput, otp });
      setAccessToken(data.data.accessToken);
      if (typeof window !== "undefined") {
        localStorage.setItem("refreshToken", data.data.refreshToken);
        localStorage.setItem("user", JSON.stringify(data.data.user));
      }
      onSuccess(data.data.user);
    } catch (err: any) {
      setServerError(err.response?.data?.message || "Invalid OTP.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-6 space-y-3.5">
      {step === "enter-phone" && (
        <div className="animate-in fade-in slide-in-from-left-4 duration-300">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-ink-700">Phone Number</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 dark:text-ink-400"><Phone className="h-4 w-4" /></div>
              <input
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ""))}
                type="tel" maxLength={12} placeholder="e.g. 9876543210"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 pr-4 pl-10 text-sm font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-[var(--color-primary)] focus:bg-white focus:ring-4 focus:ring-[var(--color-primary)]/10"
              />
            </div>
          </div>
          {serverError && (
            <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 sm:text-sm animate-in fade-in">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{serverError}</span>
            </div>
          )}
          <button type="button" onClick={handleSendOtp} disabled={loading || phoneInput.length < 10} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1B3A8C] to-[#12295E] py-3.5 text-sm font-semibold text-white shadow-lg disabled:opacity-60">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><span>Get Secure OTP</span><ArrowRight className="h-4 w-4" /></>}
          </button>
        </div>
      )}

      {step === "enter-otp" && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50/50 p-3.5">
            <div>
              <p className="text-[11px] text-gray-500">OTP sent securely to</p>
              <p className="text-sm font-bold tracking-wide text-[var(--color-primary-text)]">+91 {phoneInput}</p>
            </div>
            <button type="button" onClick={() => { setStep("enter-phone"); setOtp(""); }} className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm border border-gray-200 hover:bg-gray-50"><Edit2 className="h-3 w-3" /> Change</button>
          </div>
          <OtpInput value={otp} onChange={setOtp} disabled={submitting} />
          {serverError && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700"><AlertCircle className="h-4 w-4 shrink-0" /><span>{serverError}</span></div>
          )}
          <div className="flex flex-col gap-3 pt-2">
            <button type="button" onClick={handleConfirmOtp} disabled={submitting || otp.length < 6} className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#1B3A8C] to-[#12295E] py-3.5 text-sm font-semibold text-white shadow-lg disabled:opacity-60">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Verify & Login</span>}
            </button>
            <button type="button" onClick={handleSendOtp} disabled={timer > 0 || loading} className="flex w-full items-center justify-center gap-1.5 py-2 text-xs font-semibold text-gray-500 hover:text-gray-800 disabled:opacity-50">
              <RefreshCcw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              {timer > 0 ? `Resend OTP in ${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}` : "Resend OTP"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StaffPasswordLogin({ onSuccess }: { onSuccess: (user: AuthUser) => void }) {
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput) {
    setServerError("");
    try {
      const identifier = (values.email ?? values.phone ?? "").trim();
      const payload = identifier.includes("@") ? { email: identifier, password: values.password } : { phone: identifier, password: values.password };
      const { data } = await api.post("/auth/login", payload);
      setAccessToken(data.data.accessToken);
      if (typeof window !== "undefined") {
        localStorage.setItem("refreshToken", data.data.refreshToken);
        localStorage.setItem("user", JSON.stringify(data.data.user));
      }
      onSuccess(data.data.user);
    } catch (err: any) {
      setServerError(err.response?.data?.message || "Invalid Credentials");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-gray-700">Email or Phone</label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400"><Mail className="h-4 w-4" /></div>
          <input {...register("email")} placeholder="e.g. admin@clinic.com" className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 pr-4 pl-10 text-sm outline-none focus:ring-4 focus:ring-blue-500/10" />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-gray-700">Password</label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400"><Lock className="h-4 w-4" /></div>
          <input {...register("password")} type={showPassword ? "text" : "password"} placeholder="Enter your password" className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 pr-11 pl-10 text-sm outline-none focus:ring-4 focus:ring-blue-500/10" />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
        </div>
      </div>
      {serverError && <div className="text-red-600 text-xs p-2 bg-red-50 rounded-lg">{serverError}</div>}
      <button type="submit" disabled={isSubmitting} className="mt-4 flex w-full justify-center rounded-xl bg-gradient-to-r from-[#1B3A8C] to-[#12295E] py-3.5 text-sm font-semibold text-white shadow-lg disabled:opacity-60">
        {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : "Login Securely"}
      </button>
    </form>
  );
}