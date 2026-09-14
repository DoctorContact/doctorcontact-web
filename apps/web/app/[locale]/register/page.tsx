"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { User, ArrowRight, AlertCircle, Loader2, RefreshCcw, Sparkles } from "lucide-react";
import { api, setAccessToken } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import OtpInput from "@/components/auth/OtpInput";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();

  const phoneQuery = searchParams.get("phone") || "";
  
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(300); // 5 Minutes Cooldown

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  async function handleResendOtp() {
    setServerError("");
    setLoading(true);
    try {
      await api.post("/auth/send-otp", { phone: phoneQuery });
      setTimer(300);
      setOtp("");
    } catch (err: any) {
      setServerError(err.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/verify-otp", {
        phone: phoneQuery,
        otp,
        name: name.trim(),
      });

      setAccessToken(data.data.accessToken);
      if (typeof window !== "undefined") {
        localStorage.setItem("refreshToken", data.data.refreshToken);
        localStorage.setItem("user", JSON.stringify(data.data.user));
      }
      setUser(data.data.user);
      router.push("/patient"); 
      
    } catch (err: any) {
      setServerError(err.response?.data?.message || "Invalid OTP or Verification Failed.");
    } finally {
      setLoading(false);
    }
  }

  if (!phoneQuery) {
    return (
      <div className="text-center p-6">
        <p className="text-gray-500 mb-4">No phone number provided.</p>
        <button onClick={() => router.push("/login")} className="text-blue-600 font-semibold hover:underline">Go back to Login</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleRegister} className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-5">
      <div className="flex items-center justify-between rounded-xl bg-blue-50/50 p-4 border border-blue-100">
        <div>
          <p className="text-xs font-semibold text-blue-600 flex items-center gap-1"><Sparkles className="w-3.5 h-3.5"/> New Account Setup</p>
          <p className="text-sm font-bold tracking-wide text-gray-900 mt-1">+91 {phoneQuery}</p>
        </div>
        <button type="button" onClick={() => router.push("/login")} className="text-xs text-gray-500 hover:text-gray-900 underline">Change Number</button>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-gray-700">Full Name</label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
            <User className="h-4 w-4" />
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            type="text"
            placeholder="e.g. Soumya Chatterjee"
            required
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 pr-4 pl-10 text-sm font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-[var(--color-primary)] focus:bg-white focus:ring-4 focus:ring-[var(--color-primary)]/10"
          />
        </div>
      </div>

      <div>
        <label className="mb-2.5 block text-xs font-semibold text-gray-700 text-center">
          Enter 6-digit OTP sent to your phone
        </label>
        <OtpInput value={otp} onChange={setOtp} disabled={loading} />
      </div>

      {serverError && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <div className="flex flex-col gap-3 pt-2">
        <button
          type="submit"
          disabled={loading || otp.length < 6 || name.trim().length < 2}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1B3A8C] to-[#12295E] py-3.5 text-sm font-semibold text-white shadow-lg disabled:opacity-60 transition-all hover:shadow-xl active:scale-[0.99]"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><span>Verify & Create Account</span><ArrowRight className="h-4 w-4" /></>}
        </button>

        <button
          type="button"
          onClick={handleResendOtp}
          disabled={timer > 0 || loading}
          className="flex w-full items-center justify-center gap-1.5 py-2 text-xs font-semibold text-gray-500 transition hover:text-gray-800 disabled:opacity-50"
        >
          <RefreshCcw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          {timer > 0 ? `Resend OTP in ${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}` : "Resend OTP"}
        </button>
      </div>
    </form>
  );
}

export default function RegisterPage() {
  return (
    <main className="relative flex min-h-[calc(100vh-64px)] items-center justify-center bg-[var(--color-bg-soft)] px-4 py-8">
      {/* Ambience */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl p-6 sm:p-10">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 mb-4">
            <Image src="/logo-icon.png" alt="Doctor Contact" width={32} height={32} className="h-8 w-8 object-contain" />
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--color-primary-dark-text)]">Complete Registration</h1>
          <p className="text-sm text-gray-500 mt-1">Please provide your name and verify the OTP to continue.</p>
        </div>
        
        <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-600" /></div>}>
          <RegisterForm />
        </Suspense>
      </div>
    </main>
  );
}