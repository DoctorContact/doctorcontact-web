"use client";

import { useState } from "react";
import {
  X,
  Search,
  UserCheck,
  Building2,
  Check,
  Plus,
  Trash2,
  FileText,
  AlertCircle,
  FlaskConical,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  useSearchPatientByPhone,
  useSearchDiagnosticCenters,
  useCreateReferral,
  type PatientLookup,
  type DiagnosticCenterLookup,
} from "@/lib/hooks/useReferrals";

interface NewReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COMMON_TESTS = [
  "Complete Blood Count (CBC)",
  "Lipid Profile",
  "Fasting Blood Sugar (FBS)",
  "HbA1c",
  "Liver Function Test (LFT)",
  "Kidney Function Test (KFT)",
  "Thyroid Profile (T3, T4, TSH)",
  "Chest X-Ray (PA View)",
  "ECG (12-Lead)",
  "USG Whole Abdomen",
  "MRI Brain",
  "Urine Routine & Microscopy",
];

export function NewReferralModal({ isOpen, onClose }: NewReferralModalProps) {
  // Search States
  const [patientPhone, setPatientPhone] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<PatientLookup | null>(null);

  const [centerName, setCenterName] = useState("");
  const [centersList, setCentersList] = useState<DiagnosticCenterLookup[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<DiagnosticCenterLookup | null>(null);

  // Test Selection & Notes
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [customTestInput, setCustomTestInput] = useState("");
  const [notes, setNotes] = useState("");

  // Mutations
  const searchPatient = useSearchPatientByPhone();
  const searchCenters = useSearchDiagnosticCenters();
  const createReferral = useCreateReferral();

  if (!isOpen) return null;

  const handleSearchPatient = () => {
    if (!patientPhone.trim()) {
      toast.error("Please enter a phone number to search");
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

  const handleSearchCenters = () => {
    searchCenters.mutate(centerName.trim(), {
      onSuccess: (data) => {
        setCentersList(data || []);
        if (!data || data.length === 0) {
          toast.error("No diagnostic centers found");
        }
      },
      onError: () => {
        setCentersList([]);
        toast.error("Failed to search diagnostic centers");
      },
    });
  };

  const toggleTest = (test: string) => {
    setSelectedTests((prev) =>
      prev.includes(test) ? prev.filter((t) => t !== test) : [...prev, test]
    );
  };

  const handleAddCustomTest = () => {
    const trimmed = customTestInput.trim();
    if (!trimmed) return;
    if (selectedTests.includes(trimmed)) {
      toast.error("Test is already added");
      return;
    }
    setSelectedTests((prev) => [...prev, trimmed]);
    setCustomTestInput("");
  };

  const handleRemoveTest = (testToRemove: string) => {
    setSelectedTests((prev) => prev.filter((t) => t !== testToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatient) {
      toast.error("Please search and select a patient");
      return;
    }
    if (!selectedCenter) {
      toast.error("Please select a diagnostic center");
      return;
    }
    if (selectedTests.length === 0) {
      toast.error("Please select or add at least one test");
      return;
    }

    createReferral.mutate(
      {
        patientId: selectedPatient.id,
        diagnosticCenterId: selectedCenter.id,
        testNames: selectedTests,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Diagnostic test referral issued successfully!");
          handleResetAndClose();
        },
        onError: () => {
          toast.error("Failed to issue test referral");
        },
      }
    );
  };

  const handleResetAndClose = () => {
    setPatientPhone("");
    setSelectedPatient(null);
    setCenterName("");
    setCentersList([]);
    setSelectedCenter(null);
    setSelectedTests([]);
    setCustomTestInput("");
    setNotes("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative my-8 w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-colors dark:border-slate-800 dark:bg-slate-900">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <FlaskConical className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Issue Diagnostic Test Referral
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Order lab tests for a patient and assign to an accredited Diagnostic Center.
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
              <div className="relative flex-1">
                <input
                  type="text"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="Enter patient phone number (e.g. 6296398479)"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-3 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

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

          {/* STEP 2: DIAGNOSTIC CENTER LOOKUP */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              2. Select Diagnostic Center
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                value={centerName}
                onChange={(e) => setCenterName(e.target.value)}
                placeholder="Search diagnostic center by name (or leave empty for all)..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-3 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
              <button
                type="button"
                onClick={handleSearchCenters}
                disabled={searchCenters.isPending}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 disabled:opacity-50"
              >
                <Search className="h-3.5 w-3.5" />
                <span>{searchCenters.isPending ? "Searching..." : "Search Centers"}</span>
              </button>
            </div>

            {centersList.length > 0 && !selectedCenter && (
              <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/50 p-2 dark:border-slate-800 dark:bg-slate-950/40 space-y-1">
                {centersList.map((center) => (
                  <button
                    key={center.id}
                    type="button"
                    onClick={() => setSelectedCenter(center)}
                    className="flex w-full items-center justify-between rounded-lg p-2 text-left hover:bg-white dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {center.centerName}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          {center.city || "Location N/A"} {center.address ? `• ${center.address}` : ""}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-md bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
                      Select
                    </span>
                  </button>
                ))}
              </div>
            )}

            {selectedCenter && (
              <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50/50 p-3 dark:border-blue-900/50 dark:bg-blue-950/20">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {selectedCenter.centerName}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {selectedCenter.city || "City N/A"} {selectedCenter.address ? `• ${selectedCenter.address}` : ""}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedCenter(null)}
                  className="text-xs font-semibold text-rose-600 hover:underline dark:text-rose-400"
                >
                  Change
                </button>
              </div>
            )}
          </div>

          {/* STEP 3: TEST SELECTION */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              3. Required Tests
            </label>

            {/* Presets */}
            <div className="flex flex-wrap gap-1.5">
              {COMMON_TESTS.map((test) => {
                const isSelected = selectedTests.includes(test);
                return (
                  <button
                    key={test}
                    type="button"
                    onClick={() => toggleTest(test)}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-2xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                    <span>{test}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Test Input */}
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={customTestInput}
                onChange={(e) => setCustomTestInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomTest();
                  }
                }}
                placeholder="Type custom test name (e.g. Vitamin D3) & press Add"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-3 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
              <button
                type="button"
                onClick={handleAddCustomTest}
                className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add</span>
              </button>
            </div>

            {/* Selected Tests List */}
            {selectedTests.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60">
                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Selected Tests ({selectedTests.length}):
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTests.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1.5 rounded-md bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-800 dark:bg-blue-900/70 dark:text-blue-200"
                    >
                      {t}
                      <button
                        type="button"
                        onClick={() => handleRemoveTest(t)}
                        className="text-blue-600 hover:text-rose-600 dark:text-blue-300 dark:hover:text-rose-400"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* STEP 4: CLINICAL NOTES */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              4. Clinical Notes / Instructions (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Fasting required for 12 hours prior to sample collection. Advise urgent report."
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
              disabled={createReferral.isPending}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <FlaskConical className="h-3.5 w-3.5" />
              <span>{createReferral.isPending ? "Submitting..." : "Issue Referral"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
