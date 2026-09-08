"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";

import {
  Settings,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Clock,
  ShieldAlert,
  Save,
} from "lucide-react";
import {
  usePlatformSettings,
  useUpdatePlatformSettings,
} from "@/lib/hooks/useAdmin";
import { useAuth } from "@/lib/auth-context";
import { GradientCard } from "@/components/ui/GradientCard";

import AddLocationForm from "./components/AddLocationForm";
import AddSpecializationForm from "./components/AddSpecializationForm";
import ManageSpecializations from "./components/ManageSpecializations";

export default function AdminSettingsPage() {
  const t = useTranslations("AdminSettings");
  const locale = useLocale();
  const localeCode =
    locale === "bn" ? "bn-BD" : locale === "hi" ? "hi-IN" : "en-US";

  const { user } = useAuth();
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const { data: settings, isLoading, isError, isFetching, refetch } =
    usePlatformSettings();
  const updateSettings = useUpdatePlatformSettings();

  const [bookingWindow, setBookingWindow] = useState<number>(30);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (settings?.bookingWindowMinutes !== undefined) {
      setBookingWindow(settings.bookingWindowMinutes);
    }
  }, [settings]);

  if (!isSuperAdmin) {
    return (
      <GradientCard variant="amber">
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 shadow-xs">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-base font-bold text-slate-900 dark:text-slate-100">
            {t("superAdminOnly")}
          </h2>
          <p className="mt-1.5 max-w-md text-xs text-slate-500 dark:text-slate-400">
            {t("superAdminOnlyDesc")}
          </p>
        </div>
      </GradientCard>
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);

    const minutes = Number(bookingWindow);
    if (isNaN(minutes) || minutes < 1 || !Number.isInteger(minutes)) {
      setActionError("Booking window must be a positive whole number.");
      return;
    }

    try {
      await updateSettings.mutateAsync({
        bookingWindowMinutes: minutes,
      });
      setActionSuccess(t("successSaved"));
    } catch (err: any) {
      setActionError(
        err?.response?.data?.message || "Failed to update platform settings"
      );
    }
  }

  return (
    <div className="space-y-6">
      {/* Header - Indigo */}
      <GradientCard variant="indigo">
        <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                {t("title")}
              </h1>
              <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300">
                Platform Architecture
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {t("subtitle")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
            className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 sm:self-auto"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-indigo-600" : ""}`}
            />
            <span>{t("retry")}</span>
          </button>
        </div>
      </GradientCard>

      {/* Action Error Alert */}
      {actionError && (
        <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{actionError}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-[11px] font-bold underline"
          >
            {t("dismiss")}
          </button>
        </div>
      )}

      {/* Action Success Alert */}
      {actionSuccess && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{actionSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionSuccess(null)}
            className="text-[11px] font-bold underline"
          >
            {t("dismiss")}
          </button>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-300">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
            <div className="flex-1">
              <h3 className="text-xs font-semibold">{t("errorTitle")}</h3>
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-rose-700"
            >
              {t("retry")}
            </button>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="space-y-4">
            <div className="h-5 w-48 animate-pulse rounded-md bg-slate-100 dark:bg-slate-800" />
            <div className="h-10 w-full animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
            <div className="h-8 w-28 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
          </div>
        </div>
      )}

      {/* Main Settings Sections */}
      {!isLoading && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          
          {/* Booking Window Settings Card */}
          <GradientCard variant="slate">
            <div className="p-6 h-full">
              <form onSubmit={handleSave} className="space-y-5">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                      <Clock className="h-4 w-4" />
                    </div>
                    <label className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {t("bookingWindow")}
                    </label>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {t("bookingWindowDesc")}
                  </p>

                  <div className="mt-3">
                    <input
                      type="number"
                      min={1}
                      max={1440}
                      value={bookingWindow}
                      onChange={(e) => setBookingWindow(Number(e.target.value))}
                      required
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-900 shadow-xs outline-none transition focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    />
                  </div>
                </div>

                {settings?.updatedAt && (
                  <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                    {t("lastUpdated")}: {new Date(settings.updatedAt).toLocaleString(localeCode)}
                  </p>
                )}

                <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
                  <button
                    type="submit"
                    disabled={updateSettings.isPending}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:scale-105 active:scale-95 disabled:opacity-50"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>{updateSettings.isPending ? t("saving") : t("saveSettings")}</span>
                  </button>
                </div>
              </form>
            </div>
          </GradientCard>

          {/* Search Location Management Card */}
          <div className="h-full">
            <AddLocationForm />
          </div>

          {/* Specialization Management (Full Width) */}
          <div className="lg:col-span-2">
            <AddSpecializationForm />
          </div>
          <div className="lg:col-span-2">
            <ManageSpecializations />
          </div>

        </div>
      )}
    </div>
  );
}