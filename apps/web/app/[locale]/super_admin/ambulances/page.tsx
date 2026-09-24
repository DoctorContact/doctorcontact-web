"use client";

import { useState, useEffect } from "react";
import { Plus, X, Ambulance, MapPin, Building2, Phone, Trash2, Loader2, CheckCircle2, ShieldAlert, Edit2 } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";

const EMPTY_FORM = {
  type: "Advanced Ambulance",
  hospitalName: "",
  location: "",
  vehicleNumber: "",
  mobileNumber: "",
  services: "",
  is24x7Available: false,
};

export default function AdminAmbulancesPage() {
  const [ambulances, setAmbulances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchAmbulances = async () => {
    setLoading(true);
    try {
      const res = await api.get("/ambulances/admin/all");
      if (res.data?.success) {
        setAmbulances(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch ambulances");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAmbulances();
  }, []);

  // 🟢 Edit Button Handler
  const handleEdit = (amb: any) => {
    setForm({
      type: amb.type,
      hospitalName: amb.hospitalName,
      location: amb.location,
      vehicleNumber: amb.vehicleNumber,
      mobileNumber: amb.mobileNumber,
      services: amb.services.join(", "), // Convert array back to comma string
      is24x7Available: amb.is24x7Available,
    });
    setEditingId(amb.id);
    setShowAdd(true);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll top to see the form
  };

  const handleCloseForm = () => {
    setShowAdd(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const servicesArray = form.services.split(",").map((s) => s.trim()).filter((s) => s);
      
      const payload = {
        ...form,
        services: servicesArray.length > 0 ? servicesArray : ["Emergency Support"],
      };

      if (editingId) {
        // 🟢 Update Existing Ambulance
        await api.patch(`/ambulances/${editingId}`, payload);
        toast.success("Ambulance updated successfully!");
      } else {
        // 🟢 Add New Ambulance
        await api.post("/ambulances", payload);
        toast.success("Ambulance added successfully!");
      }

      handleCloseForm();
      fetchAmbulances();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save ambulance");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to completely remove this ambulance?")) return;
    try {
      await api.delete(`/ambulances/${id}`);
      toast.success("Ambulance removed");
      setAmbulances((prev) => prev.filter((amb) => amb.id !== id)); // INSTANT UI REMOVE
    } catch (error) {
      toast.error("Failed to delete ambulance");
    }
  };

  // 🟢 FIXED SLOWNESS: Optimistic UI Update (Instant Toggle)
  const toggleStatus = async (id: string, currentStatus: boolean) => {
    // 1. Change the UI INSTANTLY before even asking the backend
    setAmbulances((prev) =>
      prev.map((amb) => (amb.id === id ? { ...amb, isActive: !currentStatus } : amb))
    );

    try {
      // 2. Do the backend work silently in the background
      await api.patch(`/ambulances/${id}`, { isActive: !currentStatus });
      toast.success(currentStatus ? "Marked as Inactive" : "Marked as Active");
    } catch (error) {
      // 3. If backend fails (Network Error), revert the UI back
      setAmbulances((prev) =>
        prev.map((amb) => (amb.id === id ? { ...amb, isActive: currentStatus } : amb))
      );
      toast.error("Network Error: Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Ambulance className="h-6 w-6 text-rose-500" /> Ambulance Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage private ambulances across all locations.</p>
        </div>
        <button
          onClick={() => {
            if (showAdd) handleCloseForm();
            else setShowAdd(true);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
            showAdd ? "bg-red-50 text-red-600 border border-red-200" : "bg-[#252a67] text-white shadow-md hover:-translate-y-0.5"
          }`}
        >
          {showAdd ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showAdd ? "Cancel" : "Add Ambulance"}
        </button>
      </div>

      {showAdd && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-top-4">
          <h2 className="text-lg font-bold mb-4">{editingId ? "Edit Ambulance Details" : "Register New Ambulance"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Ambulance Type</label>
                <select required value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full mt-1.5 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:border-[#252a67]">
                  <option value="Basic Ambulance">Basic Ambulance</option>
                  <option value="Advanced Ambulance">Advanced Ambulance</option>
                  <option value="Medium Ambulance">Medium Ambulance</option>
                  <option value="ICU Ambulance">ICU Ambulance</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Hospital Name</label>
                <input required type="text" value={form.hospitalName} onChange={(e) => setForm({ ...form, hospitalName: e.target.value })} placeholder="e.g. XYZ Hospital" className="w-full mt-1.5 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:border-[#252a67]" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Location</label>
                <input required type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Durgapur" className="w-full mt-1.5 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:border-[#252a67]" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Vehicle Number</label>
                <input required type="text" value={form.vehicleNumber} onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })} placeholder="e.g. WB 53A 7872" className="w-full mt-1.5 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:border-[#252a67]" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Mobile Number</label>
                <input required type="tel" value={form.mobileNumber} onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })} placeholder="Emergency Number" className="w-full mt-1.5 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:border-[#252a67]" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Services (Comma Separated)</label>
                <input required type="text" value={form.services} onChange={(e) => setForm({ ...form, services: e.target.value })} placeholder="O2, Ventilator, First Aid" className="w-full mt-1.5 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:border-[#252a67]" />
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-2">
              <input type="checkbox" id="is24x7" checked={form.is24x7Available} onChange={(e) => setForm({ ...form, is24x7Available: e.target.checked })} className="w-4 h-4 text-[#252a67] rounded border-slate-300" />
              <label htmlFor="is24x7" className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer">Available 24/7 for Emergencies</label>
            </div>

            <div className="flex justify-end pt-4">
              <button type="submit" disabled={submitting} className="flex items-center gap-2 bg-[#252a67] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#1b1f4c] transition-all">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} {editingId ? "Update Ambulance" : "Save Ambulance"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-10"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>
      ) : ambulances.length === 0 ? (
        <div className="text-center p-12 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300">
          <ShieldAlert className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-slate-500 font-bold">No Private Ambulances Registered</h3>
          <p className="text-sm text-slate-400">Click "Add Ambulance" to register a new one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {ambulances.map((amb) => (
            <div key={amb.id} className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border shadow-sm flex flex-col relative overflow-hidden transition-all ${!amb.isActive ? 'border-red-200 dark:border-red-900/50 opacity-80' : 'border-slate-200 dark:border-slate-800'}`}>
              {!amb.isActive && <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">INACTIVE</div>}
              
              <div className="flex items-start gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center shrink-0">
                  <Ambulance className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-lg leading-tight">{amb.type}</h3>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{amb.vehicleNumber}</p>
                </div>
              </div>

              <div className="space-y-2.5 mb-5 flex-1">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <Building2 className="h-4 w-4 text-slate-400" /> <span className="font-medium">{amb.hospitalName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <MapPin className="h-4 w-4 text-slate-400" /> <span className="font-medium">{amb.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <Phone className="h-4 w-4 text-slate-400" /> <span className="font-medium font-mono">{amb.mobileNumber}</span>
                </div>
              </div>

              <div className="mb-5">
                <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">Available Services</p>
                <div className="flex flex-wrap gap-1.5">
                  {amb.services.map((svc: string, i: number) => (
                    <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold rounded-md">
                      {svc}
                    </span>
                  ))}
                  {amb.is24x7Available && (
                    <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold rounded-md flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> 24/7 Available
                    </span>
                  )}
                </div>
              </div>

              {/* 🟢 Action Buttons: Toggle, Edit, Delete */}
              <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => toggleStatus(amb.id, amb.isActive)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${
                    amb.isActive ? "bg-white text-slate-600 border-slate-200 hover:bg-slate-50" : "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"
                  }`}
                >
                  {amb.isActive ? "Mark Inactive" : "Mark Active"}
                </button>
                <button
                  onClick={() => handleEdit(amb)}
                  title="Edit Ambulance"
                  className="px-3 py-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(amb.id)}
                  title="Delete Ambulance"
                  className="px-3 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}