"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { FlaskConical, Search, Loader2, X, Plus, UserRound, Building2 } from "lucide-react";

import {
  useSearchPatientByPhone,
  useSearchDiagnosticCenters,
  useCreateReferral,
  useSentReferrals,
  type PatientLookup,
  type DiagnosticCenterLookup,
} from "@/lib/hooks/useReferrals";

export default function ReceptionistTestRecommendationsPage() {
  const searchPatient = useSearchPatientByPhone();
  const searchCenters = useSearchDiagnosticCenters();
  const createReferral = useCreateReferral();
  const { data: sent = [], isLoading: sentLoading } = useSentReferrals();

  const [phone, setPhone] = useState("");
  const [patient, setPatient] = useState<PatientLookup | null>(null);

  const [centerQuery, setCenterQuery] = useState("");
  const [centers, setCenters] = useState<DiagnosticCenterLookup[]>([]);
  const [center, setCenter] = useState<DiagnosticCenterLookup | null>(null);

  const [testInput, setTestInput] = useState("");
  const [tests, setTests] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  async function doPatientLookup() {
    if (phone.trim().length < 10) return toast.error("Enter a 10-digit phone number");
    const p = await searchPatient.mutateAsync(phone.trim());
    if (p) {
      setPatient(p);
      toast.success(`Patient: ${p.name}`);
    } else {
      setPatient(null);
      toast.error("No patient found — register them in Add Patient first");
    }
  }

  async function doCenterSearch() {
    if (!centerQuery.trim()) return;
    const list = await searchCenters.mutateAsync(centerQuery.trim());
    setCenters(list);
    if (list.length === 0) toast.error("No diagnostic centers matched");
  }

  function addTest() {
    const t = testInput.trim();
    if (!t) return;
    if (!tests.includes(t)) setTests([...tests, t]);
    setTestInput("");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!patient) return toast.error("Select a patient");
    if (!center) return toast.error("Select a diagnostic center");
    if (tests.length === 0) return toast.error("Add at least one test");
    try {
      await createReferral.mutateAsync({
        patientId: patient.id,
        diagnosticCenterId: center.id,
        testNames: tests,
        notes: notes.trim() || undefined,
      });
      toast.success("Test recommendation sent to the diagnostic center");
      setPhone("");
      setPatient(null);
      setCenter(null);
      setCenters([]);
      setCenterQuery("");
      setTests([]);
      setNotes("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Could not create recommendation");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-[#0F1B33] dark:text-white">
          <FlaskConical className="h-6 w-6 text-[#1C63E7]" /> Test Recommendations
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Recommend lab tests for a patient and send them to a diagnostic center.
        </p>
      </div>

      <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {/* patient */}
        <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">Patient phone</label>
        <div className="flex gap-2">
          <input
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
              setPatient(null);
            }}
            placeholder="10-digit mobile"
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#1C63E7] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          <button type="button" onClick={doPatientLookup} disabled={searchPatient.isPending} className="flex shrink-0 items-center gap-1 rounded-xl bg-slate-800 px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-50 dark:bg-slate-700">
            {searchPatient.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </button>
        </div>
        {patient && (
          <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-green-600">
            <UserRound className="h-3 w-3" /> {patient.name} · {patient.phone}
          </p>
        )}

        {/* center */}
        <label className="mb-1 mt-4 block text-xs font-semibold text-slate-600 dark:text-slate-300">Diagnostic center</label>
        {center ? (
          <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-3 py-2.5 text-sm dark:border-green-900 dark:bg-green-950/30">
            <span className="flex items-center gap-1.5 font-semibold text-green-700 dark:text-green-400">
              <Building2 className="h-4 w-4" /> {center.centerName}
            </span>
            <button type="button" onClick={() => setCenter(null)}><X className="h-4 w-4 text-slate-400" /></button>
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              <input
                value={centerQuery}
                onChange={(e) => setCenterQuery(e.target.value)}
                placeholder="Search by name"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#1C63E7] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <button type="button" onClick={doCenterSearch} disabled={searchCenters.isPending} className="flex shrink-0 items-center gap-1 rounded-xl bg-slate-800 px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-50 dark:bg-slate-700">
                {searchCenters.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </button>
            </div>
            {centers.length > 0 && (
              <div className="mt-2 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 dark:divide-slate-800 dark:border-slate-700">
                {centers.map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => { setCenter(c); setCenters([]); }}
                    className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <span className="font-medium text-slate-700 dark:text-slate-200">{c.centerName}</span>
                    <span className="text-xs text-slate-400">{c.city}</span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* tests */}
        <label className="mb-1 mt-4 block text-xs font-semibold text-slate-600 dark:text-slate-300">Tests</label>
        <div className="flex gap-2">
          <input
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTest(); } }}
            placeholder="e.g. CBC, Lipid Profile"
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#1C63E7] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          <button type="button" onClick={addTest} className="flex shrink-0 items-center gap-1 rounded-xl bg-[#1C63E7] px-3 py-2.5 text-sm font-semibold text-white">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        {tests.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {tests.map((t) => (
              <span key={t} className="inline-flex items-center gap-1 rounded-full bg-[#EAF2FF] px-2.5 py-1 text-xs font-semibold text-[#1C63E7]">
                {t}
                <button type="button" onClick={() => setTests(tests.filter((x) => x !== t))}><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
        )}

        <label className="mb-1 mt-4 block text-xs font-semibold text-slate-600 dark:text-slate-300">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#1C63E7] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />

        <button
          type="submit"
          disabled={createReferral.isPending || !patient || !center || tests.length === 0}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#1C63E7] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1550c4] disabled:opacity-50"
        >
          {createReferral.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Send recommendation
        </button>
      </form>

      {/* recent */}
      <div>
        <h2 className="mb-3 text-sm font-bold text-slate-800 dark:text-slate-100">Recent recommendations</h2>
        {sentLoading ? (
          <div className="h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
        ) : sent.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">
            None yet.
          </p>
        ) : (
          <div className="space-y-2">
            {sent.map((r) => (
              <div key={r.id} className="rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 dark:text-slate-100">
                    {r.patient?.user?.name ?? r.patient?.name ?? "Patient"}
                  </span>
                  <span className="text-xs text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                  {r.testNames.join(", ")} → {r.diagnosticCenter?.centerName}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
