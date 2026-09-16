"use client";

import { useState } from "react";
import {
  X,
  Search,
  UserCheck,
  Building2,
  Stethoscope,
  Trash2,
  FileText,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  useSearchPatientByPhone,
  type PatientLookup,
} from "@/lib/hooks/useReferrals";
import { useSearchClinics } from "@/lib/hooks/useDoctor";
import { useCreateDoctorPrescription } from "@/lib/hooks/useDoctorExpansion";
import type { ClinicSearchResult } from "@doctor-contract/shared";
import {
  PrescriptionItemForm,
  type RawPrescriptionItem,
} from "./PrescriptionItemForm";

interface CreatePrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreatePrescriptionModal({
  isOpen,
  onClose,
}: CreatePrescriptionModalProps) {
  // Patient Lookup
  const [patientPhone, setPatientPhone] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<PatientLookup | null>(null);

  // Clinic Lookup
  const [selectedClinic, setSelectedClinic] = useState<ClinicSearchResult | null>(null);

  // Rx Details
  const [diagnosis, setDiagnosis] = useState("");
  const [items, setItems] = useState<RawPrescriptionItem[]>([]);
  const [notes, setNotes] = useState("");

  // Mutations & Queries
  const searchPatient = useSearchPatientByPhone();
  const { data: clinics = [] } = useSearchClinics();
  const createPrescription = useCreateDoctorPrescription();

  if (!isOpen) return null;

  const handleSearchPatient = () => {
    if (!patientPhone.trim()) {
      toast.error("Please enter a phone number");
      return;
    }
    searchPatient.mutate(patientPhone.trim(), {
      onSuccess: (data) => {
        if (data) {
          setSelectedPatient(data);
          toast.success("Patient found!");
        } else {
          setSelectedPatient(null);
          toast.error("No patient found with this phone number");
        }
      },
      onError: () => {
        setSelectedPatient(null);
        toast.error("Failed to search patient");
      },
    });
  };

  const handleAddItem = (newItem: RawPrescriptionItem) => {
    setItems((prev) => [...prev, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatient) {
      toast.error("Please search and select a patient");
      return;
    }
    if (!selectedClinic) {
      toast.error("Please select a clinic");
      return;
    }
    if (!diagnosis.trim()) {
      toast.error("Please enter diagnosis");
      return;
    }
    if (items.length === 0) {
      toast.error("Please add at least one prescribed medicine");
      return;
    }

    createPrescription.mutate(
      {
        patientId: selectedPatient.id,
        clinicId: selectedClinic.id,
        diagnosis: diagnosis.trim(),
        items,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Digital prescription created successfully!");
          handleResetAndClose();
        },
        onError: () => {
          toast.error("Failed to create prescription");
        },
      }
    );
  };

  const handleResetAndClose = () => {
    setPatientPhone("");
    setSelectedPatient(null);
    setSelectedClinic(null);
    setDiagnosis("");
    setItems([]);
    setNotes("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative my-8 w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-colors dark:border-slate-800 dark:bg-slate-900">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Issue Digital Prescription (E-Rx)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Create structured medication and dosage instructions for a patient.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetAndClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-6">
          {/* STEP 1: PATIENT LOOKUP */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              1. Patient Lookup (By Phone)
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                placeholder="Enter patient phone number (e.g. 6296398479)"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-3 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
              <button
                type="button"
                onClick={handleSearchPatient}
                disabled={searchPatient.isPending}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50"
              >
                <Search className="h-3.5 w-3.5" />
                <span>{searchPatient.isPending ? "Searching..." : "Find Patient"}</span>
              </button>
            </div>

            {selectedPatient && (
              <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                    <UserCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {selectedPatient.name}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Phone: {selectedPatient.phone || "N/A"}
                      {selectedPatient.age ? ` | Age: ${selectedPatient.age}` : ""}
                      {selectedPatient.gender ? ` | Gender: ${selectedPatient.gender}` : ""}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedPatient(null)}
                  className="text-xs font-semibold text-rose-600 hover:underline dark:text-rose-400"
                >
                  Change
                </button>
              </div>
            )}
          </div>

          {/* STEP 2: CLINIC & DIAGNOSIS */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Clinic Selector */}
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                2. Practice Clinic *
              </label>
              <select
                value={selectedClinic?.id || ""}
                onChange={(e) => {
                  const found = clinics.find((c) => c.id === e.target.value);
                  setSelectedClinic(found || null);
                }}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="">Select Associated Clinic</option>
                {clinics.map((clinic) => (
                  <option key={clinic.id} value={clinic.id}>
                    {clinic.clinicName}
                  </option>
                ))}
              </select>
            </div>

            {/* Diagnosis Input */}
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                3. Clinical Diagnosis *
              </label>
              <input
                type="text"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="e.g. Acute Bronchitis / Viral Fever"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {/* STEP 3: MEDICINES FORM & LIST */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              4. Prescribed Medications ({items.length})
            </label>

            {/* Item Input Form */}
            <PrescriptionItemForm onAddItem={handleAddItem} />

            {/* Added Items List */}
            {items.length > 0 && (
              <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Prescription Items:
                </p>
                <div className="space-y-1.5">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg bg-slate-50 p-2.5 text-xs dark:bg-slate-800/60"
                    >
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {item.medicineName} — <span className="text-blue-600 dark:text-blue-400">{item.dosage}</span>
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {item.frequency} for {item.duration} {item.instructions ? `• ${item.instructions}` : ""}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="rounded-md p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* STEP 4: NOTES */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              5. Additional Instructions / Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Drink plenty of warm fluids. Review after 5 days if fever persists."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4 dark:border-slate-800">
            <button
              type="button"
              onClick={handleResetAndClose}
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={createPrescription.isPending}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Check className="h-3.5 w-3.5" />
              <span>{createPrescription.isPending ? "Creating..." : "Issue Prescription"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
