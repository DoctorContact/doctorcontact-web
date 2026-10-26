"use client";

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Building2,
  GraduationCap,
  Mail,
  Phone,
  ShieldCheck,
  Plus,
  X,
  Loader2,
  Trash2,
  Search,
  Globe,
  XCircle,
  Edit2, 
  ImagePlus 
} from "lucide-react";
import { GradientCard } from "@/components/ui/GradientCard";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";
import type { AdminDoctorRecord } from "@doctor-contract/shared";

// 🟢 Multi-Language Name Parser
const parseMultiLangName = (rawName: string = "") => {
  const parts = rawName.split(" | ");
  return {
    en: parts[0]?.trim() || rawName,
    bn: parts[1]?.trim() || "",
    hi: parts[2]?.trim() || "",
  };
};

export default function AdminDoctorsPage() {
  const t = useTranslations("AdminDoctors");
  const locale = useLocale();

  const [searchQuery, setSearchQuery] = useState("");
  const [pendingActionDoctor, setPendingActionDoctor] = useState<any>(null);
  const [actionType, setActionType] = useState<"verify" | "unverify" | "delete" | null>(null);

  // 🟢 Edit / Create States
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<AdminDoctorRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [removePhotoFlag, setRemovePhotoFlag] = useState(false);

  // 1. Fetch ALL Doctors
  const { data: allDoctors = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ["adminAllDoctors"],
    queryFn: async () => {
      const res = await api.get("/admin/doctors");
      return res.data?.data?.doctors || [];
    },
  });

  // 2. Fetch Specializations
  const { data: specializationsList = [], isLoading: isLoadingSpecs } = useQuery({
    queryKey: ["specializations"],
    queryFn: async () => {
      try {
        const res = await api.get("/specializations");
        let list = res.data?.data?.specializations || res.data?.data || res.data || [];
        if (!Array.isArray(list)) {
          if (res.data?.data?.items && Array.isArray(res.data.data.items)) {
            list = res.data.data.items;
          } else {
            list = [];
          }
        }
        return list;
      } catch (error) {
        console.error("Failed to load specializations:", error);
        return [];
      }
    },
  });

  // 3. Fetch Locations
  const { data: locationsList = [], isLoading: isLoadingLocs } = useQuery({
    queryKey: ["adminLocations"],
    queryFn: async () => {
      const res = await api.get("/locations"); 
      return res.data?.data?.locations || res.data?.data || [];
    },
  });

  const [formData, setFormData] = useState({
    nameEn: "", nameBn: "", nameHi: "",
    phone: "", email: "", password: "",
    medicalSystem: "ALLOPATHY", 
    specializationId: "", specializationName: "", city: "", 
    qualification: "", experience: "", fee: "",
  });

  // 🟢 Reset Form Function
  const resetForm = () => {
    setFormData({
      nameEn: "", nameBn: "", nameHi: "", phone: "", email: "", password: "",
      medicalSystem: "ALLOPATHY",
      specializationId: "", specializationName: "", city: "", qualification: "", experience: "", fee: "",
    });
    setPhotoFile(null);
    setPhotoPreview(null);
    setRemovePhotoFlag(false);
    setEditingDoctor(null);
    setShowModal(false);
  };

  // 🟢 Handle Edit Click
  const openEditModal = (doc: AdminDoctorRecord) => {
    const parsed = parseMultiLangName(doc.user?.name);
    // User the new logic to get avatar if profilePhoto is empty
    const existingPhoto = doc.profilePhoto || (doc.user as any)?.avatar || null;
    
    setFormData({
      nameEn: parsed.en,
      nameBn: parsed.bn,
      nameHi: parsed.hi,
      email: doc.user?.email || "",
      phone: doc.user?.phone || "",
      password: "", 
      medicalSystem: (doc as any).medicalSystem || "ALLOPATHY",
      specializationId: "", 
      specializationName: doc.specialization || "",
      city: doc.clinic?.city || "",
      qualification: doc.qualification || "",
      experience: doc.experience ? String(doc.experience) : "",
      fee: doc.fee ? String(doc.fee) : "",
    });
    setPhotoFile(null);
    setPhotoPreview(existingPhoto);
    setRemovePhotoFlag(false);
    setEditingDoctor(doc);
    setShowModal(true);
  };

  // 🟢 Handle Image Change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setRemovePhotoFlag(false);
    }
  };

  // 🟢 Handle Remove Photo
  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setRemovePhotoFlag(true);
  };

  // Filter Logic
  const filteredDoctors = useMemo(() => {
    return allDoctors.filter((doc: any) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      const p = parseMultiLangName(doc.user?.name);
      return (
        p.en.toLowerCase().includes(q) ||
        p.bn.toLowerCase().includes(q) ||
        p.hi.toLowerCase().includes(q) ||
        doc.specialization?.toLowerCase().includes(q) ||
        doc.user?.phone?.includes(q) ||
        doc.user?.email?.toLowerCase().includes(q)
      );
    });
  }, [allDoctors, searchQuery]);

  // Actions (Verify/Unverify/Delete)
  const toggleVerifyMutation = useMutation({
    mutationFn: async ({ id, type }: { id: string; type: "verify" | "unverify" }) => {
      const res = await api.patch(`/admin/doctors/${id}/${type}`);
      return res.data;
    },
    onSuccess: (_, variables) => {
      toast.success(`Doctor ${variables.type === "verify" ? "verified" : "unverified"} successfully!`);
      setPendingActionDoctor(null);
      refetch();
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to update verification status"),
  });

  const deleteDoctorMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/admin/doctors/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Doctor removed successfully!");
      setPendingActionDoctor(null);
      refetch();
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to remove doctor"),
  });

  const executeAction = () => {
    if (!pendingActionDoctor) return;
    if (actionType === "verify" || actionType === "unverify") {
      toggleVerifyMutation.mutate({ id: pendingActionDoctor.id, type: actionType });
    } else if (actionType === "delete") {
      deleteDoctorMutation.mutate(pendingActionDoctor.id);
    }
  };

  // 🟢 Form Submit (Create & Edit using FormData)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nameEn) {
      toast.error("English Name is required."); return;
    }
    if (!editingDoctor && !formData.password) {
      toast.error("Password is required to create a new doctor."); return;
    }
    if (!editingDoctor && !formData.specializationId) {
      toast.error("Specialization is required for new doctors."); return;
    }
    if (!formData.phone && !formData.email) {
      toast.error("Please provide either an Email Address or a Phone Number."); return;
    }
    
    const combinedName = `${formData.nameEn.trim()} | ${formData.nameBn.trim()} | ${formData.nameHi.trim()}`;

    const payload = new FormData();
    payload.append("name", combinedName);
    
    if (formData.phone) payload.append("phone", formData.phone);
    if (formData.email) payload.append("email", formData.email);
    if (formData.medicalSystem) payload.append("medicalSystem", formData.medicalSystem);
    if (formData.qualification) payload.append("qualification", formData.qualification);
    if (formData.experience) payload.append("experience", formData.experience);
    if (formData.fee) payload.append("fee", formData.fee);
    if (formData.city) payload.append("city", formData.city);
    
    if (photoFile) {
      payload.append("photo", photoFile);
    } else if (removePhotoFlag) {
      payload.append("removePhoto", "true");
    }

    try {
      setIsSubmitting(true);

      if (editingDoctor) {
        if (formData.specializationName) {
          payload.append("specialization", formData.specializationName);
        }
        await api.patch(`/admin/doctors/${editingDoctor.id}/edit`, payload, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        toast.success("Doctor profile updated successfully!");
      } else {
        payload.append("password", formData.password);
        payload.append("specialization", formData.specializationName);
        payload.append("specializationIds", formData.specializationId);

        await api.post("/admin/doctors", payload, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        toast.success("Doctor added successfully!");
      }

      resetForm();
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Operation failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <GradientCard variant="cyan">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                Doctors Directory
              </h1>
              <span className="rounded-full bg-cyan-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-cyan-800 dark:bg-cyan-950/50 dark:text-cyan-300">
                {allDoctors.length} Total
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Manage all verified and unverified doctors on the platform.
            </p>
          </div>
          
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => { resetForm(); setShowModal(true); }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-600 px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-cyan-700 hover:shadow-lg active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>Add Doctor</span>
            </button>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isLoading || isFetching}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin text-cyan-600" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </GradientCard>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name in any language, specialty, phone or email..."
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm shadow-sm outline-none transition focus:border-cyan-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
        />
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900" />
          ))}
        </div>
      )}

      {/* Doctors List */}
      {!isLoading && (
        <div className="space-y-4">
          {filteredDoctors.length === 0 ? (
            <GradientCard variant="emerald">
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 shadow-xs">
                  <Search className="h-6 w-6" />
                </div>
                <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-slate-100">No doctors found</h3>
              </div>
            </GradientCard>
          ) : (
            filteredDoctors.map((doc: any) => {
              const parsedName = parseMultiLangName(doc.user?.name);
              const mainName = locale === "bn" && parsedName.bn ? parsedName.bn : 
                               locale === "hi" && parsedName.hi ? parsedName.hi : 
                               parsedName.en;
                               
              // 🟢 FIX: Prioritize profilePhoto, fallback to user.avatar
              const displayPhoto = doc.profilePhoto || doc.user?.avatar;

              return (
                <GradientCard key={doc.id} variant={doc.isVerified ? "emerald" : "cyan"}>
                  <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3.5">
                      
                      {/* 🟢 Profile Photo or Stethoscope Icon */}
                      {displayPhoto ? (
                        <img src={displayPhoto} alt="Doctor" className="h-10 w-10 shrink-0 rounded-xl object-cover shadow-xs border border-slate-200 dark:border-slate-700" />
                      ) : (
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-xs ${doc.isVerified ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400" : "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400"}`}>
                          <Stethoscope className="h-5 w-5" />
                        </div>
                      )}

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {mainName}
                          </h3>
                          {doc.isVerified && (
                            <span title="Verified" className="flex items-center">
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            </span>
                          )}
                          {doc.specialization && (
                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-extrabold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              {doc.specialization}
                            </span>
                          )}
                        </div>

                        {/* Multi-language names preview */}
                        <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400 dark:text-slate-500">
                          <Globe className="h-3 w-3" />
                          <span>EN: {parsedName.en}</span>
                          {parsedName.bn && <span>• BN: {parsedName.bn}</span>}
                          {parsedName.hi && <span>• HI: {parsedName.hi}</span>}
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 pt-1">
                          {doc.clinic?.clinicName && (
                            <span className="flex items-center gap-1 font-medium">
                              <Building2 className="h-3.5 w-3.5 text-slate-400" />
                              <span>{doc.clinic.clinicName}</span>
                            </span>
                          )}
                          {doc.qualification && (
                            <span className="flex items-center gap-1 font-medium">
                              <GraduationCap className="h-3.5 w-3.5 text-slate-400" />
                              <span>{doc.qualification}</span>
                            </span>
                          )}
                          {doc.fee && (
                            <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                              <span>₹{doc.fee}</span>
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-x-4 text-[11px] text-slate-400">
                          {doc.user?.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              <span>{doc.user.email}</span>
                            </span>
                          )}
                          {doc.user?.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              <span>{doc.user.phone}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex shrink-0 items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(doc)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                        title="Edit Doctor"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => { setPendingActionDoctor(doc); setActionType("delete"); }}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-950/60"
                        title="Delete Doctor"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      
                      {doc.isVerified ? (
                        <button
                          type="button"
                          onClick={() => { setPendingActionDoctor(doc); setActionType("unverify"); }}
                          className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-amber-100 px-4 text-xs font-bold text-amber-700 transition hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:hover:bg-amber-900/60"
                        >
                          <XCircle className="h-4 w-4" />
                          <span>Unverify</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => { setPendingActionDoctor(doc); setActionType("verify"); }}
                          className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 text-xs font-bold text-white shadow-xs transition hover:scale-105 active:scale-95"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Verify</span>
                        </button>
                      )}
                    </div>
                  </div>
                </GradientCard>
              );
            })
          )}
        </div>
      )}

      {/* Create & Edit Doctor Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-6 py-4 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingDoctor ? "Edit Doctor Profile" : "Add New Doctor"}
                </h2>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {editingDoctor ? "Update doctor information and photo" : "Fill the details to add a doctor"}
                </p>
              </div>
              <button onClick={resetForm} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              
              {/* 🟢 Photo Upload & Remove Section */}
              <div className="flex flex-col items-center justify-center mb-6">
                <label className="relative flex h-24 w-24 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-slate-300 bg-slate-50 transition hover:bg-slate-100 overflow-hidden dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Doctor Preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-slate-400">
                      <ImagePlus className="h-6 w-6 mb-1" />
                      <span className="text-[10px] font-medium">Upload Photo</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
                {photoFile && <p className="mt-2 text-[10px] text-slate-500">{photoFile.name}</p>}
                
                {/* 🟢 Remove Photo Button */}
                {photoPreview && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="mt-2 rounded px-2 py-1 text-[11px] font-bold text-rose-600 transition hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  >
                    Remove Photo
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">English Name *</label>
                  <input type="text" required value={formData.nameEn} onChange={(e) => setFormData({...formData, nameEn: e.target.value})} placeholder="Dr. John Doe" className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Bengali Name</label>
                  <input type="text" value={formData.nameBn} onChange={(e) => setFormData({...formData, nameBn: e.target.value})} placeholder="ডাঃ জন ডো" className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Hindi Name</label>
                  <input type="text" value={formData.nameHi} onChange={(e) => setFormData({...formData, nameHi: e.target.value})} placeholder="डॉ. जॉन डो" className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Phone Number</label>
                  <input type="tel" disabled={!!editingDoctor} value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="(Optional if Email is given)" className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition dark:border-slate-700 dark:bg-slate-800 disabled:opacity-50 dark:text-white" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</label>
                  <input type="email" disabled={!!editingDoctor} value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="(Optional if Phone is given)" className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition dark:border-slate-700 dark:bg-slate-800 disabled:opacity-50 dark:text-white" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {!editingDoctor && (
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Password *</label>
                    <input type="password" required minLength={6} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="Min. 6 characters" className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                  </div>
                )}
                
                <div className={editingDoctor ? "col-span-2" : ""}>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Specialization</label>
                  <div className="flex gap-2">
                    {!editingDoctor && (
                      <select required value={formData.specializationId} onChange={(e) => {
                          const id = e.target.value;
                          const spec = specializationsList.find((s: any) => s.id === id);
                          setFormData({ ...formData, specializationId: id, specializationName: spec?.name || "" });
                        }} className="w-1/2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                        <option value="" disabled>Select specialization</option>
                        {specializationsList.map((spec: any) => (
                          <option key={spec.id} value={spec.id}>{spec.nameEn || spec.name}</option>
                        ))}
                      </select>
                    )}
                    <input type="text" value={formData.specializationName} onChange={(e) => setFormData({...formData, specializationName: e.target.value})} placeholder="Type custom specialization..." className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Medical System *</label>
                  <select 
                    value={formData.medicalSystem} 
                    onChange={(e) => setFormData({...formData, medicalSystem: e.target.value})} 
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="ALLOPATHY">Allopathy</option>
                    <option value="HOMEOPATHY">Homeopathy</option>
                    <option value="AYURVEDA">Ayurveda</option>
                  </select>
                </div>
                
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Experience (Yrs)</label>
                  <input type="number" value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})} placeholder="e.g. 5" className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Base Fee (₹)</label>
                  <input type="number" value={formData.fee} onChange={(e) => setFormData({...formData, fee: e.target.value})} placeholder="e.g. 500" className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Qualification</label>
                <input type="text" value={formData.qualification} onChange={(e) => setFormData({...formData, qualification: e.target.value})} placeholder="MBBS, MD" className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={resetForm} className="rounded-xl px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-cyan-700">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  {editingDoctor ? "Save Changes" : "Save Doctor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {pendingActionDoctor && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-xl transition-all dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                actionType === "delete" || actionType === "unverify" 
                  ? "bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400" 
                  : "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
              }`}>
                {actionType === "delete" ? <Trash2 className="h-5 w-5" /> : actionType === "unverify" ? <XCircle className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {actionType === "delete" ? "Delete Doctor?" : actionType === "unverify" ? "Unverify Doctor?" : "Verify Doctor?"}
                </h3>
                <p className="text-xs text-slate-500">
                  {parseMultiLangName(pendingActionDoctor.user?.name).en}
                </p>
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-600 dark:text-slate-300">
              {actionType === "delete" 
                ? "Are you sure you want to permanently delete this doctor profile?" 
                : actionType === "unverify"
                ? "This doctor will no longer be visible as verified to patients. Proceed?"
                : "This will approve the doctor for active practice. Proceed?"}
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setPendingActionDoctor(null)} className="rounded-lg px-3 py-1.5 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-white">
                Cancel
              </button>
              <button 
                onClick={executeAction} 
                disabled={toggleVerifyMutation.isPending || deleteDoctorMutation.isPending}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold text-white flex items-center gap-1.5 ${
                  actionType === "delete" || actionType === "unverify" ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {(toggleVerifyMutation.isPending || deleteDoctorMutation.isPending) && <Loader2 className="h-3 w-3 animate-spin" />}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}