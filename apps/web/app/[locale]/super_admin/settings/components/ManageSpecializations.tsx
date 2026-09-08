"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Pencil, Check, X, Eye, EyeOff, Stethoscope } from "lucide-react";
import { api } from "@/lib/api";

interface Specialization {
  id: string;
  name: string;
  description?: string | null;
  iconUrl?: string | null;
  isActive: boolean;
}

export default function ManageSpecializations() {
  const [items, setItems] = useState<Specialization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // ?all=true → include deactivated entries (admin-only, enforced server-side)
      const res = await api.get("/specializations", { params: { all: true } });
      setItems(res.data?.data?.specializations ?? []);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to load specializations.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function patch(id: string, body: Record<string, unknown>) {
    setBusyId(id);
    try {
      const res = await api.patch(`/specializations/${id}`, body);
      const updated: Specialization = res.data?.data?.specialization;
      setItems((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)));
      setEditingId(null);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Update failed.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
        <div className="bg-indigo-50 p-2.5 rounded-xl">
          <Stethoscope className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">Manage Specializations</h2>
          <p className="text-xs text-slate-500">Rename or activate / deactivate existing categories.</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
        </div>
      ) : items.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-500">No specializations yet. Add one above.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {items.map((s) => (
            <li key={s.id} className="flex items-center gap-3 py-3">
              {s.iconUrl ? (
                <img src={s.iconUrl} alt="" className="h-9 w-9 rounded-lg object-contain" />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">
                  {s.name.charAt(0).toUpperCase()}
                </div>
              )}

              {editingId === s.id ? (
                <input
                  autoFocus
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  className="flex-1 rounded-lg border border-indigo-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 outline-none"
                />
              ) : (
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">{s.name}</p>
                  {!s.isActive && (
                    <span className="text-[10px] font-bold uppercase text-amber-600">Inactive</span>
                  )}
                </div>
              )}

              {editingId === s.id ? (
                <>
                  <button
                    onClick={() => draftName.trim() && patch(s.id, { name: draftName.trim() })}
                    disabled={busyId === s.id}
                    className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50"
                    aria-label="Save name"
                  >
                    {busyId === s.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                    aria-label="Cancel"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setEditingId(s.id);
                      setDraftName(s.name);
                    }}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                    aria-label="Rename"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => patch(s.id, { isActive: !s.isActive })}
                    disabled={busyId === s.id}
                    className={`rounded-lg p-1.5 hover:bg-slate-100 ${
                      s.isActive ? "text-emerald-600" : "text-amber-600"
                    }`}
                    aria-label={s.isActive ? "Deactivate" : "Activate"}
                  >
                    {busyId === s.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : s.isActive ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
