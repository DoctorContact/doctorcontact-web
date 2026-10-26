"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Building2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Plus,
  X,
  AlertTriangle,
  Globe,
  Loader2,
  Edit2, 
  ImagePlus,
  Trash2 // 🟢 Added Trash icon for remove photo
} from "lucide-react";
import {
  useAdminClinics,
  useApproveClinic,
  useRevokeClinic,
} from "@/lib/hooks/useAdmin";
import type { AdminClinicRecord } from "@doctor-contract/shared";
import { GradientCard } from "@/components/ui/GradientCard";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

type FilterTab = "ALL" | "APPROVED" | "PENDING";

const parseMultiLangName = (rawName: string = "") => {
  const parts = rawName.split(" | ");
  return {
    en: parts[0]?.trim() || rawName,
    bn: parts[1]?.trim() || "",
    hi: parts[2]?.trim() || "",
  };
};

export default function AdminClinicsPage() {
  const t = useTranslations("AdminClinics");
  const locale = useLocale();
  const localeCode = locale === "bn" ? "bn-BD" : locale === "hi" ? "hi-IN" : "en-US";

  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [page, setPage] = useState<number>(1);
  const limit = 20;

  const isApprovedParam = activeTab === "ALL" ? undefined : activeTab === "APPROVED";

  const { data, isLoading, isError, isFetching, refetch } = useAdminClinics({
    isApproved: isApprovedParam,
    page,
    limit,
  });

  const { data: locationsList = [], isLoading: isLoadingLocs } = useQuery({
    queryKey: ["adminLocations"],
    queryFn: async () => {
      const res = await api.get("/locations"); 
      return res.data?.data?.locations || res.data?.data || [];
    },
  });

  const approveClinic = useApproveClinic();
  const revokeClinic = useRevokeClinic();

  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dialog states
  const [pendingApproveClinic, setPendingApproveClinic] = useState<AdminClinicRecord | null>(null);
  const [pendingRevokeClinic, setPendingRevokeClinic] = useState<AdminClinicRecord | null>(null);
  
  // Modal States
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [editingClinic, setEditingClinic] = useState<AdminClinicRecord | null>(null);
  
  // 🟢 Photo Upload States
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [removeLogo, setRemoveLogo] = useState<boolean>(false); // 🟢 New state for removal

  const [formData, setFormData] = useState({
    name: "", email: "", password: "", phone: "",
    clinicNameEn: "", clinicNameBn: "", clinicNameHi: "",
    address: "", city: "", state: "", pincode: "",
  });

  const clinics = data?.clinics || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit) || 1;

  const resetForm = () => {
    setFormData({
      name: "", email: "", password: "", phone: "",
      clinicNameEn: "", clinicNameBn: "", clinicNameHi: "",
      address: "", city: "", state: "", pincode: "",
    });
    setLogoFile(null);
    setLogoPreview(null);
    setRemoveLogo(false); // 🟢 Reset
    setEditingClinic(null);
    setShowCreateModal(false);
  };

  const openEditModal = (clinic: AdminClinicRecord) => {
    const parsed = parseMultiLangName(clinic.clinicName);
    setFormData({
      name: clinic.user?.name || "",
      email: clinic.user?.email || "",
      password: "", 
      phone: clinic.user?.phone || "",
      clinicNameEn: parsed.en,
      clinicNameBn: parsed.bn,
      clinicNameHi: parsed.hi,
      address: clinic.address || "",
      city: clinic.city || "",
      state: clinic.state || "",
      pincode: clinic.pincode || "",
    });
    setLogoFile(null);
    setLogoPreview(clinic.logo || null); 
    setRemoveLogo(false); // 🟢 Reset
    setEditingClinic(clinic);
    setShowCreateModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      setRemoveLogo(false); // 🟢 Cancel removal if new image is selected
    }
  };

  const handleRemoveImage = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setRemoveLogo(true); // 🟢 Trigger removal flag for backend
  };

  async function handleConfirmApprove() {
    if (!pendingApproveClinic) return;
    setActionError(null);
    setActionSuccess(null);
    try {
      await approveClinic.mutateAsync(pendingApproveClinic.id);
      setActionSuccess(t("successApproved"));
      refetch();
    } catch (err: any) {
      setActionError(err?.response?.data?.message || "Failed to approve clinic");
    } finally {
      setPendingApproveClinic(null);
    }
  }

  async function handleConfirmRevoke() {
    if (!pendingRevokeClinic) return;
    setActionError(null);
    setActionSuccess(null);
    try {
      await revokeClinic.mutateAsync(pendingRevokeClinic.id);
      setActionSuccess(t("successRevoked"));
      refetch();
    } catch (err: any) {
      setActionError(err?.response?.data?.message || "Failed to revoke clinic approval");
    } finally {
      setPendingRevokeClinic(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);

    if (!formData.clinicNameEn) {
      setActionError("English Clinic Name is required.");
      return;
    }

    const combinedClinicName = `${formData.clinicNameEn.trim()} | ${formData.clinicNameBn.trim()} | ${formData.clinicNameHi.trim()}`;

    const payload = new FormData();
    payload.append("clinicName", combinedClinicName);
    if (formData.name) payload.append("name", formData.name);
    if (formData.email) payload.append("email", formData.email);
    if (formData.phone) payload.append("phone", formData.phone);
    if (formData.address) payload.append("address", formData.address);
    if (formData.city) payload.append("city", formData.city);
    if (formData.state) payload.append("state", formData.state);
    if (formData.pincode) payload.append("pincode", formData.pincode);
    
    // 🟢 Attach Logo or Remove Logo flag
    if (logoFile) {
      payload.append("logo", logoFile);
    } else if (removeLogo) {
      payload.append("removeLogo", "true");
    }

    try {
      setIsSubmitting(true);
      if (editingClinic) {
        await api.patch(`/admin/clinics/${editingClinic.id}/edit`, payload, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        setActionSuccess("Clinic updated successfully!");
      } else {
        if (!formData.password) {
          setActionError("Password is required for new clinics.");
          setIsSubmitting(false);
          return;
        }
        payload.append("password", formData.password);
        await api.post(`/admin/clinics`, payload, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        setActionSuccess(t("successCreated"));
      }

      resetForm();
      refetch();
    } catch (err: any) {
      setActionError(err?.response?.data?.message || "Operation failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <GradientCard variant="purple">
        <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                {t("title")}
              </h1>
              <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-purple-800 dark:bg-purple-950/50 dark:text-purple-300">
                Clinics Management
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {t("subtitle")}
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => { resetForm(); setShowCreateModal(true); }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:scale-105 active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{t("addClinic")}</span>
            </button>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isLoading || isFetching}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-blue-600" : ""}`} />
              <span>{t("retry")}</span>
            </button>
          </div>
        </div>
      </GradientCard>

      {actionError && (
        <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{actionError}</span>
          </div>
          <button type="button" onClick={() => setActionError(null)} className="text-[11px] font-bold underline">
            {t("dismiss")}
          </button>
        </div>
      )}

      {actionSuccess && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{actionSuccess}</span>
          </div>
          <button type="button" onClick={() => setActionSuccess(null)} className="text-[11px] font-bold underline">
            {t("dismiss")}
          </button>
        </div>
      )}

      <GradientCard variant="slate">
        <div className="flex flex-wrap gap-1.5 p-2">
          <button type="button" onClick={() => { setActiveTab("ALL"); setPage(1); }} className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${activeTab === "ALL" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"}`}>
            {t("all")}
          </button>
          <button type="button" onClick={() => { setActiveTab("APPROVED"); setPage(1); }} className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${activeTab === "APPROVED" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"}`}>
            {t("approved")}
          </button>
          <button type="button" onClick={() => { setActiveTab("PENDING"); setPage(1); }} className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${activeTab === "PENDING" ? "bg-amber-600 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"}`}>
            {t("pending")}
          </button>
        </div>
      </GradientCard>

      {isLoading && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        </div>
      )}

      {!isLoading && !isError && (
        <GradientCard variant="slate">
          <div className="overflow-hidden">
            {clinics.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                  <Building2 className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-slate-100">{t("emptyTitle")}</h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t("emptyDesc")}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-3">{t("clinicName")}</th>
                      <th className="px-4 py-3">{t("owner")}</th>
                      <th className="px-4 py-3">{t("location")}</th>
                      <th className="px-4 py-3">{t("approvalStatus")}</th>
                      <th className="px-4 py-3 text-right">{t("actions")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {clinics.map((clinic) => {
                      const parsedName = parseMultiLangName(clinic.clinicName);
                      const displayClinicName = locale === "bn" && parsedName.bn ? parsedName.bn : locale === "hi" && parsedName.hi ? parsedName.hi : parsedName.en;

                      return (
                        <tr key={clinic.id} className="transition hover:bg-slate-50/60 dark:hover:bg-slate-800/50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              {clinic.logo ? (
                                <img src={clinic.logo} alt="Logo" className="h-8 w-8 rounded-lg object-cover border border-slate-200 dark:border-slate-700" />
                              ) : (
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
                                  <Building2 className="h-4 w-4" />
                                </div>
                              )}
                              <div>
                                <p className="font-semibold text-slate-900 dark:text-slate-100">
                                  {displayClinicName}
                                </p>
                                <div className="mt-0.5 flex items-center gap-1.5 text-[9px] font-medium text-slate-400">
                                  <Globe className="h-2.5 w-2.5" />
                                  <span className="truncate">EN: {parsedName.en}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-slate-900 dark:text-slate-100">{clinic.user?.name || "—"}</p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500">{clinic.user?.email || clinic.user?.phone || "—"}</p>
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                            {clinic.address ? <span>{clinic.address}{clinic.city ? `, ${clinic.city}` : ""}</span> : "—"}
                          </td>
                          <td className="px-4 py-3">
                            {clinic.isApproved ? (
                              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50">
                                <CheckCircle2 className="h-3 w-3" /> <span>{t("approved")}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50">
                                <XCircle className="h-3 w-3" /> <span>{t("pending")}</span>
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => openEditModal(clinic)}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                              >
                                <Edit2 className="h-3 w-3" /> <span>Edit</span>
                              </button>

                              {clinic.isApproved ? (
                                <button type="button" onClick={() => setPendingRevokeClinic(clinic)} disabled={revokeClinic.isPending} className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50 dark:border-rose-900/50 dark:bg-slate-900 dark:text-rose-400 dark:hover:bg-rose-950/30">
                                  <ShieldAlert className="h-3 w-3" /> <span>{t("revoke")}</span>
                                </button>
                              ) : (
                                <button type="button" onClick={() => setPendingApproveClinic(clinic)} disabled={approveClinic.isPending} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50">
                                  <ShieldCheck className="h-3 w-3" /> <span>{t("approve")}</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {total > limit && (
              <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <span>{t("page")} {page} of {totalPages} ({total.toLocaleString(localeCode)} clinics)</span>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1 || isLoading} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-medium transition hover:bg-slate-50 disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800">
                    <ChevronLeft className="h-3.5 w-3.5" /> <span>{t("previous")}</span>
                  </button>
                  <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages || isLoading} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-medium transition hover:bg-slate-50 disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800">
                    <span>{t("next")}</span> <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </GradientCard>
      )}

      {pendingApproveClinic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-xl transition-all dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{t("approveDialogTitle")}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{parseMultiLangName(pendingApproveClinic.clinicName).en}</p>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button type="button" onClick={() => setPendingApproveClinic(null)} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">{t("cancel")}</button>
              <button type="button" onClick={handleConfirmApprove} disabled={approveClinic.isPending} className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700">{approveClinic.isPending ? t("saving") : t("confirm")}</button>
            </div>
          </div>
        </div>
      )}

      {pendingRevokeClinic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-xl transition-all dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{t("revokeDialogTitle")}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{parseMultiLangName(pendingRevokeClinic.clinicName).en}</p>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button type="button" onClick={() => setPendingRevokeClinic(null)} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">{t("cancel")}</button>
              <button type="button" onClick={handleConfirmRevoke} disabled={revokeClinic.isPending} className="rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-700">{revokeClinic.isPending ? t("saving") : t("confirm")}</button>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-xl transition-all dark:border-slate-800 dark:bg-slate-900 my-8">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-6 py-4 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {editingClinic ? "Edit Clinic Details" : t("createClinicTitle")}
                </h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {editingClinic ? "Update clinic and owner information" : t("createClinicDesc")}
                </p>
              </div>
              <button type="button" onClick={resetForm} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-2 space-y-4 p-6">
              
              {/* 🟢 Interactive Logo Upload Section with Remove Button */}
              <div className="flex flex-col items-center justify-center mb-6">
                <div className="relative group">
                  <label className="relative flex h-24 w-24 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-slate-300 bg-slate-50 transition hover:bg-slate-100 overflow-hidden dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo Preview" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center text-slate-400">
                        <ImagePlus className="h-6 w-6 mb-1" />
                        <span className="text-[10px] font-medium">Upload Logo</span>
                      </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                  
                  {/* 🟢 Trash Icon for removing existing/selected photo */}
                  {logoPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-rose-100 text-rose-600 shadow-md hover:bg-rose-200 transition-colors dark:bg-rose-900 dark:text-rose-300"
                      title="Remove Logo"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                {logoFile && <p className="mt-2 text-[10px] text-slate-500">{logoFile.name}</p>}
                {removeLogo && <p className="mt-2 text-[10px] font-bold text-rose-500">Logo will be removed upon saving.</p>}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">English Clinic Name *</label>
                  <input type="text" required value={formData.clinicNameEn} onChange={(e) => setFormData({ ...formData, clinicNameEn: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white" placeholder="Apollo Clinic" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">Bengali Name</label>
                  <input type="text" value={formData.clinicNameBn} onChange={(e) => setFormData({ ...formData, clinicNameBn: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white" placeholder="অ্যাপোলো ক্লিনিক" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">Hindi Name</label>
                  <input type="text" value={formData.clinicNameHi} onChange={(e) => setFormData({ ...formData, clinicNameHi: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white" placeholder="अपोलो क्लिनिक" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">{t("ownerName")} *</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">{t("ownerEmail")} {editingClinic ? "" : "*"}</label>
                  <input type="email" required={!editingClinic} disabled={!!editingClinic} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition disabled:opacity-50 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {!editingClinic && (
                  <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">{t("password")} *</label>
                    <input type="password" required minLength={6} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                  </div>
                )}
                <div className={editingClinic ? "col-span-2 sm:col-span-1" : ""}>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">{t("ownerPhone")}</label>
                  <input type="tel" value={formData.phone || ""} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">Location (City)</label>
                  <select 
                    value={formData.city || ""} 
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })} 
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="">Select City</option>
                    {locationsList.map((loc: any) => (
                      <option key={loc.id} value={loc.nameEn || loc.name}>{loc.nameEn || loc.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">{t("state")}</label>
                  <input type="text" value={formData.state || ""} onChange={(e) => setFormData({ ...formData, state: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white" placeholder="e.g. West Bengal" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">{t("pincode")}</label>
                  <input type="text" value={formData.pincode || ""} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white" placeholder="e.g. 700001" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">{t("address")}</label>
                <textarea rows={2} value={formData.address || ""} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white" placeholder="Street address, building, etc." />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={resetForm} className="rounded-xl px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                  {t("cancel")}
                </button>
                <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-blue-700 disabled:opacity-50">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  {editingClinic ? "Save Changes" : t("saveClinic")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}