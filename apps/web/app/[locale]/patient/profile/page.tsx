"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { useQueryClient } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  MapPin,
  Heart,
  Save,
  Loader2,
  CheckCircle2,
  Shield,
  Activity,
  Edit3,
} from "lucide-react";
import { updateProfileSchema, type UpdateProfileInput } from "@doctor-contract/shared";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useMyPatientProfile } from "@/lib/hooks/useAppointments";

// ============================================================
// GRADIENT BORDER CARD COMPONENT
// ============================================================
function GradientCard({
  children,
  className = "",
  gradient = "from-[#667eea] via-[#764ba2] to-[#f093fb]",
}: {
  children: React.ReactNode;
  className?: string;
  gradient?: string;
}) {
  return (
    <div className={`relative rounded-2xl p-[3px] bg-gradient-to-r ${gradient} shadow-xl ${className}`}>
      <div className="rounded-[calc(1rem-2px)] bg-white dark:bg-slate-900 h-full">
        {children}
      </div>
    </div>
  );
}

function toDateInputValue(iso: string | null | undefined) {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export default function ProfilePage() {
  const t = useTranslations("Dashboard");
  const { user, setUser } = useAuth();
  const { data: patient, isLoading } = useMyPatientProfile();
  const queryClient = useQueryClient();

  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  // 🟢 সরাসরি Shared Schema ব্যবহার করা হচ্ছে
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<UpdateProfileInput>({ resolver: zodResolver(updateProfileSchema) });

  useEffect(() => {
    if (patient && user) {
      reset({
        name: user.name || "", // 🟢 TypeScript Error ফিক্স: patient.name বাদ দিয়ে শুধু user.name ব্যবহার করা হলো
        dob: toDateInputValue(patient.dob),
        gender: patient.gender ?? undefined,
        bloodGroup: patient.bloodGroup ?? "",
        address: patient.address ?? "",
      });
    }
  }, [patient, user, reset]);

  async function onSubmit(values: UpdateProfileInput) {
    setServerError("");
    setSuccess(false);
    try {
      const payload: Record<string, unknown> = { ...values };
      
      if (values.dob) {
        payload.dob = new Date(values.dob).toISOString();
      } else {
        delete payload.dob;
      }
      if (!values.gender) delete payload.gender;

      // ১. ব্যাকএন্ডের /patient/me তে রিকোয়েস্ট পাঠানো
      await api.patch("/patient/me", payload);

      // ২. UI-তে ইনস্ট্যান্ট নাম আপডেট করার জন্য Local State ও LocalStorage আপডেট
      if (values.name && values.name !== user?.name) {
        const updatedUser = { ...user, name: values.name };
        // @ts-ignore
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      setSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["patient", "me"] });
      
    } catch (err: any) {
      setServerError(err?.response?.data?.message || "Something went wrong");
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Link
        href="/patient"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#1e40af] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("backToDashboard")}
      </Link>

      <GradientCard gradient="from-[#1e3a8a] via-[#3b82f6] to-[#60a5fa]">
        <div className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#1e3a8a] to-[#3b82f6] text-white shadow-lg shadow-blue-500/30">
              <User className="h-4 w-4" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1e40af]">
              Profile
            </p>
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#059669] to-[#10b981] px-2 py-0.5 text-[9px] font-bold text-white">
              <Shield className="h-3 w-3" />
              Verified
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {t("editProfile")}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your personal information
          </p>
        </div>
      </GradientCard>

      <GradientCard gradient="from-[#667eea] via-[#764ba2] to-[#f093fb]">
        <div className="p-5">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center">
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1e3a8a] to-[#3b82f6] text-white shadow-lg shadow-blue-500/30">
                  <span className="text-xl font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-[#059669] to-[#10b981] text-white shadow-md shadow-green-500/30">
                  <CheckCircle2 className="h-3 w-3" />
                </span>
              </div>

              <div className="text-center sm:text-left">
                <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
                <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-slate-500 sm:justify-start">
                  <Mail className="h-4 w-4 text-[#1e40af]" />
                  {user?.email || "No email added"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] text-white shadow-md shadow-blue-500/30">
                <Phone className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone</p>
                <p className="text-sm font-semibold text-slate-800">+91 {user?.phone || "Not set"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-[#059669] to-[#10b981] text-white shadow-md shadow-green-500/30">
                <Activity className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</p>
                <p className="text-sm font-semibold text-slate-800">Active Patient</p>
              </div>
            </div>
          </div>
        </div>
      </GradientCard>

      {isLoading ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-3xl border border-slate-100 bg-slate-50/50">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#1e40af] border-t-transparent" />
            <p className="text-sm font-medium text-slate-500">{t("loadingAppointments")}</p>
          </div>
        </div>
      ) : (
        <GradientCard gradient="from-[#059669] via-[#10b981] to-[#34d399]">
          <form onSubmit={handleSubmit(onSubmit)} className="p-5 sm:p-6">
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#059669] to-[#10b981] text-white shadow-lg shadow-green-500/30">
                  <Edit3 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800">Personal Information</h2>
                  <p className="mt-0.5 text-xs text-slate-500">Update your details</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* 🟢 Full Name Input */}
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Full Name
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    {...register("name")}
                    placeholder="e.g. John Doe"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none transition-all hover:border-[#1e40af]/30 focus:border-[#1e40af] focus:bg-white focus:ring-[3px] focus:ring-[#1e40af]/10"
                  />
                </div>
              </div>

              {/* DOB */}
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                  {t("profileDob")}
                </label>
                <div className="relative">
                  <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    {...register("dob")}
                    type="date"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none transition-all hover:border-[#1e40af]/30 focus:border-[#1e40af] focus:bg-white focus:ring-[3px] focus:ring-[#1e40af]/10"
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                  {t("profileGender")}
                </label>
                <select
                  {...register("gender")}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition-all hover:border-[#1e40af]/30 focus:border-[#1e40af] focus:bg-white focus:ring-[3px] focus:ring-[#1e40af]/10"
                >
                  <option value="">{t("selectGender")}</option>
                  <option value="MALE">{t("genderMale")}</option>
                  <option value="FEMALE">{t("genderFemale")}</option>
                  <option value="OTHER">{t("genderOther")}</option>
                </select>
              </div>

              {/* Blood Group */}
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                  {t("profileBloodGroup")}
                </label>
                <div className="relative">
                  <Heart className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    {...register("bloodGroup")}
                    placeholder={t("bloodGroupPlaceholder")}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 hover:border-[#1e40af]/30 focus:border-[#1e40af] focus:bg-white focus:ring-[3px] focus:ring-[#1e40af]/10"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Address
                </label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <textarea
                    {...register("address")}
                    placeholder={t("addressPlaceholder")}
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 hover:border-[#1e40af]/30 focus:border-[#1e40af] focus:bg-white focus:ring-[3px] focus:ring-[#1e40af]/10"
                  />
                </div>
              </div>
            </div>

            {/* Server Error */}
            {serverError && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#f5576c]/20 bg-gradient-to-r from-[#f5576c]/5 to-transparent px-4 py-3 text-sm text-[#f5576c]">
                <Shield className="h-4 w-4 shrink-0" />
                {serverError}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#059669]/20 bg-gradient-to-r from-[#059669]/10 to-transparent px-4 py-3 text-sm font-bold text-[#059669]">
                <CheckCircle2 className="h-4 w-4" />
                {t("profileUpdated")}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative mt-6 w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              
              <span className="relative flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isSubmitting ? t("savingChanges") : t("saveChanges")}
              </span>
            </button>
          </form>
        </GradientCard>
      )}
    </div>
  );
}