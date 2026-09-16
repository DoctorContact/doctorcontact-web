"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Activity,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  Plus,
  X,
  AlertTriangle,
  Home,
  CheckCircle, 
} from "lucide-react";
import {
  useAdminDiagnosticCenters,
  useApproveDiagnosticCenter,
  useRevokeDiagnosticCenter,
  useCreateDiagnosticCenter,
} from "@/lib/hooks/useAdmin";
import type {
  AdminDiagnosticCenterRecord,
  CreateDiagnosticCenterInput,
} from "@doctor-contract/shared";
import { GradientCard } from "@/components/ui/GradientCard";

type FilterTab = "ALL" | "APPROVED" | "PENDING";

export default function AdminDiagnosticCentersPage() {
  const t = useTranslations("AdminDiagnosticCenters");
  const locale = useLocale();
  const localeCode =
    locale === "bn" ? "bn-BD" : locale === "hi" ? "hi-IN" : "en-US";

  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");

  const isApprovedParam =
    activeTab === "ALL" ? undefined : activeTab === "APPROVED";

  const { data: centers, isLoading, isError, isFetching, refetch } =
    useAdminDiagnosticCenters({
      isApproved: isApprovedParam,
    });

  const approveCenter = useApproveDiagnosticCenter();
  const revokeCenter = useRevokeDiagnosticCenter();
  const createCenter = useCreateDiagnosticCenter();

  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const [pendingApproveCenter, setPendingApproveCenter] =
    useState<AdminDiagnosticCenterRecord | null>(null);
  const [pendingRevokeCenter, setPendingRevokeCenter] =
    useState<AdminDiagnosticCenterRecord | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // 🟢 Create Center Form State (All new fields added)
  const [formData, setFormData] = useState<CreateDiagnosticCenterInput & { whatsapp?: string; googleMapsUrl?: string }>({
    name: "",
    email: "",
    password: "",
    phone: "",
    whatsapp: "",
    googleMapsUrl: "",
    centerName: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    hasHomeService: false, 
  });

  const centerList = centers || [];

  async function handleConfirmApprove() {
    if (!pendingApproveCenter) return;
    const centerId = pendingApproveCenter.id;
    setPendingApproveCenter(null);
    setActionError(null);
    setActionSuccess(null);

    try {
      await approveCenter.mutateAsync(centerId);
      setActionSuccess(t("successApproved") || "Approved successfully");
    } catch (err: any) {
      setActionError(
        err?.response?.data?.message || "Failed to approve diagnostic center"
      );
    }
  }

  async function handleConfirmRevoke() {
    if (!pendingRevokeCenter) return;
    const centerId = pendingRevokeCenter.id;
    setPendingRevokeCenter(null);
    setActionError(null);
    setActionSuccess(null);

    try {
      await revokeCenter.mutateAsync(centerId);
      setActionSuccess(t("successRevoked") || "Revoked successfully");
    } catch (err: any) {
      setActionError(
        err?.response?.data?.message || "Failed to revoke diagnostic center approval"
      );
    }
  }

  async function handleCreateCenter(e: React.FormEvent) {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);

    try {
      await createCenter.mutateAsync(formData);
      setShowCreateModal(false);
      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        whatsapp: "",
        googleMapsUrl: "",
        centerName: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        hasHomeService: false,
      });
      setActionSuccess(t("successCreated") || "Center created successfully");
      refetch();
    } catch (err: any) {
      setActionError(
        err?.response?.data?.message || "Failed to create diagnostic center"
      );
    }
  }

  return (
    <div className="space-y-6">
      {/* Header - Cyan */}
      <GradientCard variant="cyan">
        <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                {t("title") || "Diagnostic Centers"}
              </h1>
              <span className="rounded-full bg-cyan-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-cyan-800 dark:bg-cyan-950/50 dark:text-cyan-300">
                Diagnostic Center Network
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {t("subtitle") || "Manage all diagnostic centers across the platform."}
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:scale-105 active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{t("addCenter") || "Add Center"}</span>
            </button>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isLoading || isFetching}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-blue-600" : ""}`}
              />
              <span>{t("retry") || "Refresh"}</span>
            </button>
          </div>
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
            {t("dismiss") || "Dismiss"}
          </button>
        </div>
      )}

      {/* Action Success Alert */}
      {actionSuccess && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{actionSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionSuccess(null)}
            className="text-[11px] font-bold underline"
          >
            {t("dismiss") || "Dismiss"}
          </button>
        </div>
      )}

      {/* Status Filter Tabs */}
      <GradientCard variant="slate">
        <div className="flex flex-wrap gap-1.5 p-2">
          <button
            type="button"
            onClick={() => setActiveTab("ALL")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              activeTab === "ALL"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            }`}
          >
            {t("all") || "All"}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("APPROVED")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              activeTab === "APPROVED"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            }`}
          >
            {t("approved") || "Approved"}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("PENDING")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              activeTab === "PENDING"
                ? "bg-amber-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            }`}
          >
            {t("pending") || "Pending"}
          </button>
        </div>
      </GradientCard>

      {/* Error State */}
      {isError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-300">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
            <div className="flex-1">
              <h3 className="text-xs font-semibold">{t("errorTitle") || "Failed to load"}</h3>
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-rose-700"
            >
              {t("retry") || "Retry"}
            </button>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        </div>
      )}

      {/* Diagnostic Centers Table */}
      {!isLoading && !isError && (
        <GradientCard variant="slate">
          <div className="overflow-hidden">
            {centerList.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                  <Activity className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-slate-100">
                  {t("emptyTitle") || "No centers found"}
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {t("emptyDesc") || "There are no diagnostic centers available."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-3">{t("centerName") || "Center Name"}</th>
                      <th className="px-4 py-3">{t("owner") || "Owner"}</th>
                      <th className="px-4 py-3">{t("location") || "Location"}</th>
                      <th className="px-4 py-3">{t("approvalStatus") || "Status"}</th>
                      <th className="px-4 py-3 text-right">{t("actions") || "Actions"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {centerList.map((center) => (
                      <tr
                        key={center.id}
                        className="transition hover:bg-slate-50/60 dark:hover:bg-slate-800/50"
                      >
                        <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400">
                              <Activity className="h-4 w-4" />
                            </div>
                            <span>{center.centerName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                          <div>
                            <p className="font-medium text-slate-800 dark:text-slate-200">
                              {center.user?.name || "—"}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {center.user?.email || "—"}
                            </p>
                            {center.user?.phone && (
                              <p className="text-[10px] text-slate-400">
                                {center.user.phone}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                          {[center.address, center.city].filter(Boolean).join(", ") || "—"}
                        </td>
                        <td className="px-4 py-3">
                          {center.isApproved ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>{t("approved") || "Approved"}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">
                              <XCircle className="h-3 w-3" />
                              <span>{t("pending") || "Pending"}</span>
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {center.isApproved ? (
                            <button
                              type="button"
                              onClick={() => setPendingRevokeCenter(center)}
                              disabled={revokeCenter.isPending}
                              className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50 dark:border-rose-900/50 dark:bg-slate-900 dark:text-rose-400 dark:hover:bg-rose-950/30"
                            >
                              <ShieldAlert className="h-3 w-3" />
                              <span>{t("revoke") || "Revoke"}</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setPendingApproveCenter(center)}
                              disabled={approveCenter.isPending}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                            >
                              <ShieldCheck className="h-3 w-3" />
                              <span>{t("approve") || "Approve"}</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </GradientCard>
      )}

      {/* Approve Confirmation Modal */}
      {pendingApproveCenter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-xl transition-all dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {t("approveDialogTitle") || "Approve Center"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {pendingApproveCenter.centerName}
                </p>
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-600 dark:text-slate-300">
              {t("approveDialogDesc") || "Are you sure you want to approve this diagnostic center?"}
            </p>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingApproveCenter(null)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                {t("cancel") || "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleConfirmApprove}
                disabled={approveCenter.isPending}
                className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
              >
                {approveCenter.isPending ? (t("saving") || "Saving...") : (t("confirm") || "Confirm")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revoke Confirmation Modal */}
      {pendingRevokeCenter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-xl transition-all dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {t("revokeDialogTitle") || "Revoke Approval"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {pendingRevokeCenter.centerName}
                </p>
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-600 dark:text-slate-300">
              {t("revokeDialogDesc") || "Are you sure you want to revoke this center's approval?"}
            </p>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingRevokeCenter(null)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                {t("cancel") || "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleConfirmRevoke}
                disabled={revokeCenter.isPending}
                className="rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-700"
              >
                {revokeCenter.isPending ? (t("saving") || "Saving...") : (t("confirm") || "Confirm")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Center Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl transition-all dark:border-slate-800 dark:bg-slate-900 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {t("createCenterTitle") || "Create Diagnostic Center"}
                </h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {t("createCenterDesc") || "Add a new diagnostic center to the platform with full details."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCenter} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    {t("centerName") || "Center Name"} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.centerName}
                    onChange={(e) =>
                      setFormData({ ...formData, centerName: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none transition focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    {t("ownerName") || "Owner Name"} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none transition focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    {t("ownerEmail") || "Email"} *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none transition focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    {t("password") || "Password"} *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none transition focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    {t("ownerPhone") || "Phone"}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none transition focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    WhatsApp (Optional)
                  </label>
                  <input
                    type="tel"
                    value={formData.whatsapp || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, whatsapp: e.target.value })
                    }
                    placeholder="e.g. 916296398479"
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none transition focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Google Maps URL
                  </label>
                  <input
                    type="url"
                    value={formData.googleMapsUrl || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, googleMapsUrl: e.target.value })
                    }
                    placeholder="https://maps.app.goo.gl/..."
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none transition focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    {t("city") || "City"}
                  </label>
                  <input
                    type="text"
                    value={formData.city || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none transition focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    {t("state") || "State"}
                  </label>
                  <input
                    type="text"
                    value={formData.state || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none transition focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    {t("pincode") || "Pincode"}
                  </label>
                  <input
                    type="text"
                    value={formData.pincode || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, pincode: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none transition focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  {t("address") || "Address"}
                </label>
                <textarea
                  rows={2}
                  value={formData.address || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none transition focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              {/* 🟢 Home Service Toggle Checkbox */}
              <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="hasHomeService"
                    checked={formData.hasHomeService}
                    onChange={(e) =>
                      setFormData({ ...formData, hasHomeService: e.target.checked })
                    }
                    className="h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-600 dark:border-slate-600 dark:bg-slate-800"
                  />
                  <label
                    htmlFor="hasHomeService"
                    className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200"
                  >
                    <Home className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    Provide Home Sample Collection
                  </label>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  {t("cancel") || "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={createCenter.isPending}
                  className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {createCenter.isPending ? (t("saving") || "Saving...") : (t("saveCenter") || "Save Center")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}