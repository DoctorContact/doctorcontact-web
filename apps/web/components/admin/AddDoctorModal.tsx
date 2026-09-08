"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { X, Loader2, Stethoscope } from "lucide-react";

import { api } from "@/lib/api";
import { useCreateDoctor } from "@/lib/hooks/useAdmin";

interface ClinicOpt {
  id: string;
  clinicName: string;
}

export default function AddDoctorModal({ onClose }: { onClose: () => void }) {
  const createDoctor = useCreateDoctor();

  const { data: clinics = [] } = useQuery<ClinicOpt[]>({
    queryKey: ["admin", "clinics", "options"],
    queryFn: async () => {
      const res = await api.get("/admin/clinics", { params: { limit: 200 } });
      const raw = res.data?.data?.clinics ?? res.data?.data ?? [];
      return (Array.isArray(raw) ? raw : []).map((c: any) => ({ id: c.id, clinicName: c.clinicName }));
    },
  });

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    clinicId: "",
    specialization: "",
    qualification: "",
    experience: "",
    fee: "",
  });

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.password.trim()) return toast.error("Name and password are required");
    if (!form.email.trim() && !form.phone.trim()) return toast.error("Provide an email or phone");

    try {
      await createDoctor.mutateAsync({
        name: form.name.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        password: form.password,
        clinicId: form.clinicId || undefined,
        specialization: form.specialization.trim() || undefined,
        qualification: form.qualification.trim() || undefined,
        experience: form.experience ? Number(form.experience) : undefined,
        fee: form.fee ? Number(form.fee) : undefined,
      });
      toast.success("Doctor account created");
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Could not create doctor");
    }
  }

  const input =
    "w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#1C63E7] dark:border-slate-700 dark:bg-slate-800 dark:text-white";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
            <Stethoscope className="h-5 w-5 text-[#1C63E7]" /> Add Doctor
          </h2>
          <button onClick={onClose}><X className="h-5 w-5 text-slate-400" /></button>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <input className={input} placeholder="Full name *" value={form.name} onChange={(e) => set("name", e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <input className={input} placeholder="Email" value={form.email} onChange={(e) => set("email", e.target.value)} />
            <input className={input} placeholder="Phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </div>
          <input className={input} type="text" placeholder="Temporary password *" value={form.password} onChange={(e) => set("password", e.target.value)} />

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">Clinic (optional)</label>
            <select className={input} value={form.clinicId} onChange={(e) => set("clinicId", e.target.value)}>
              <option value="">No clinic — add later</option>
              {clinics.map((c) => (
                <option key={c.id} value={c.id}>{c.clinicName}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input className={input} placeholder="Specialization" value={form.specialization} onChange={(e) => set("specialization", e.target.value)} />
            <input className={input} placeholder="Qualification" value={form.qualification} onChange={(e) => set("qualification", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input className={input} type="number" placeholder="Experience (yrs)" value={form.experience} onChange={(e) => set("experience", e.target.value)} />
            <input className={input} type="number" placeholder="Fee (₹)" value={form.fee} onChange={(e) => set("fee", e.target.value)} />
          </div>

          <button
            type="submit"
            disabled={createDoctor.isPending}
            className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1C63E7] py-2.5 text-sm font-semibold text-white transition hover:bg-[#1550c4] disabled:opacity-50"
          >
            {createDoctor.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Create doctor
          </button>
        </form>
      </div>
    </div>
  );
}
