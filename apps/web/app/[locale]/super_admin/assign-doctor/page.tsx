"use client";

import { useEffect, useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";
import { 
  Building2, 
  Stethoscope, 
  Search, 
  CheckCircle2, 
  Loader2,
  Clock,
  CalendarDays,
  IndianRupee,
  Users,
  Check,
  Globe
} from "lucide-react";
import { GradientCard } from "@/components/ui/GradientCard";
import type { AdminClinicRecord, AdminDoctorRecord } from "@doctor-contract/shared";

const DAYS_OF_WEEK = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const WEEKS = [{ label: "1st", val: 1 }, { label: "2nd", val: 2 }, { label: "3rd", val: 3 }, { label: "4th", val: 4 }, { label: "Last", val: "LAST" }];

const parseMultiLangName = (rawName: string = "") => {
  const parts = rawName.split(" | ");
  return {
    en: parts[0]?.trim() || rawName,
    bn: parts[1]?.trim() || "",
    hi: parts[2]?.trim() || "",
  };
};

const inputClasses = "w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm font-medium text-gray-700 outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-[#252a67] focus:ring-[3px] focus:ring-[#252a67]/15 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500";

export default function AssignDoctorPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [clinicSearch, setClinicSearch] = useState("");
  const [doctorSearch, setDoctorSearch] = useState("");
  
  const [selectedClinic, setSelectedClinic] = useState<AdminClinicRecord | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<AdminDoctorRecord | null>(null);

  // 🟢 Advanced Schedule Form State matching clinic portal
  const [form, setForm] = useState({
    fee: "",
    startTime: "09:00",
    endTime: "17:00",
    capacity: "20",
    recurrenceType: "WEEKLY",
    recurrenceDays: ["MONDAY"] as string[],
    recurrenceDate: "1",
    recurrenceWeek: 1 as number | "LAST",
    recurrenceWeekday: "SUNDAY",
    specificDate: "",
  });

  // Fetch all approved clinics
  const { data: allClinics = [], isLoading: isLoadingClinics } = useQuery({
    queryKey: ["adminAllClinicsForAssignment"],
    queryFn: async () => {
      const res = await api.get("/admin/clinics?limit=1000");
      return res.data?.data?.clinics || [];
    },
  });

  // Fetch all verified doctors
  const { data: allDoctors = [], isLoading: isLoadingDoctors } = useQuery({
    queryKey: ["adminAllDoctorsForAssignment"],
    queryFn: async () => {
      const res = await api.get("/admin/doctors");
      return res.data?.data?.doctors || [];
    },
  });

  // Filtered Clinics
  const filteredClinics = useMemo(() => {
    return allClinics.filter((c: any) => {
      if (!c.isApproved) return false;
      if (!clinicSearch) return true;
      const name = parseMultiLangName(c.clinicName).en.toLowerCase();
      return name.includes(clinicSearch.toLowerCase());
    });
  }, [allClinics, clinicSearch]);

  // Filtered Doctors
  const filteredDoctors = useMemo(() => {
    return allDoctors.filter((d: any) => {
      if (!d.isVerified) return false;
      if (!doctorSearch) return true;
      const q = doctorSearch.toLowerCase();
      const p = parseMultiLangName(d.user?.name);
      return (
        p.en.toLowerCase().includes(q) || 
        p.bn.toLowerCase().includes(q) || 
        p.hi.toLowerCase().includes(q) || 
        d.user?.email?.toLowerCase().includes(q) || 
        d.user?.phone?.includes(q)
      );
    });
  }, [allDoctors, doctorSearch]);

  // 🟢 Fixed Mutation: Only calls the single backend endpoint that handles both association and schedule
  const assignMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post(`/admin/clinics/${selectedClinic?.id}/assign-doctor`, payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Doctor successfully assigned to clinic with schedule!");
      setStep(1);
      setSelectedClinic(null);
      setSelectedDoctor(null);
      setForm({
        fee: "", startTime: "09:00", endTime: "17:00", capacity: "20",
        recurrenceType: "WEEKLY", recurrenceDays: ["MONDAY"], recurrenceDate: "1",
        recurrenceWeek: 1, recurrenceWeekday: "SUNDAY", specificDate: ""
      });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to assign doctor");
    }
  });

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClinic || !selectedDoctor) return;

    if (!form.startTime || !form.endTime) {
      toast.error("Start Time and End Time are required.");
      return;
    }

    let recurrencePattern = {};
    if (form.recurrenceType === "WEEKLY") {
      if (form.recurrenceDays.length === 0) return toast.error("Select at least one day for weekly schedule.");
      recurrencePattern = { days: form.recurrenceDays };
    }
    if (form.recurrenceType === "MONTHLY_DATE") recurrencePattern = { date: Number(form.recurrenceDate) };
    if (form.recurrenceType === "MONTHLY_WEEKDAY") recurrencePattern = { week: form.recurrenceWeek, day: form.recurrenceWeekday };
    if (form.recurrenceType === "SPECIFIC_DATE") {
      if (!specificDateCheck(form.specificDate)) return;
      recurrencePattern = { exactDate: form.specificDate };
    }

    assignMutation.mutate({
      doctorId: selectedDoctor.id,
      fee: form.fee ? Number(form.fee) : undefined,
      dayOfWeek: form.recurrenceDays[0] || "MONDAY",
      startTime: form.startTime,
      endTime: form.endTime,
      maxPatients: form.capacity ? Number(form.capacity) : 20,
      recurrenceType: form.recurrenceType,
      recurrencePattern: recurrencePattern,
    });
  };

  const specificDateCheck = (dateStr: string) => {
    if (!dateStr) {
      toast.error("Please select an exception date.");
      return false;
    }
    return true;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <GradientCard>
        <div className="p-6">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Assign Doctor to Clinic</h1>
          <p className="mt-1 text-sm text-slate-500">Directly assign a verified doctor to an approved clinic with custom schedules and fees.</p>
        </div>
      </GradientCard>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* STEP 1: SELECT CLINIC */}
        <div className={`col-span-1 border rounded-2xl p-4 transition-all ${step === 1 ? "border-blue-500 bg-blue-50/20 dark:bg-blue-900/10 shadow-md" : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 opacity-75"}`}>
          <div className="flex items-center gap-2 mb-4">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold text-sm ${step === 1 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500 dark:bg-slate-800"}`}>1</div>
            <h2 className="font-semibold text-slate-900 dark:text-white">Select Clinic</h2>
          </div>
          
          {step === 1 && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search clinic..."
                  value={clinicSearch}
                  onChange={(e) => setClinicSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div className="h-[320px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {isLoadingClinics ? (
                  <div className="flex justify-center py-8"><Loader2 className="animate-spin text-slate-400 h-5 w-5" /></div>
                ) : filteredClinics.map((c: any) => {
                  const pName = parseMultiLangName(c.clinicName);
                  return (
                    <div 
                      key={c.id} 
                      onClick={() => { setSelectedClinic(c); setStep(2); }}
                      className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all dark:border-slate-800 dark:hover:bg-slate-800/80"
                    >
                      <Building2 className="h-5 w-5 text-blue-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate text-slate-900 dark:text-slate-100">{pName.en}</p>
                        <p className="text-[10px] text-slate-500 truncate">{c.city || c.address || "Main Branch"}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {step > 1 && selectedClinic && (
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Selected Clinic</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{parseMultiLangName(selectedClinic.clinicName).en}</p>
              </div>
              <button type="button" onClick={() => { setStep(1); setSelectedClinic(null); setSelectedDoctor(null); }} className="text-xs font-bold text-blue-600 hover:underline">Change</button>
            </div>
          )}
        </div>

        {/* STEP 2: SELECT DOCTOR */}
        <div className={`col-span-1 border rounded-2xl p-4 transition-all ${step === 2 ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-900/10 shadow-md" : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 opacity-75"}`}>
          <div className="flex items-center gap-2 mb-4">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold text-sm ${step === 2 ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500 dark:bg-slate-800"}`}>2</div>
            <h2 className="font-semibold text-slate-900 dark:text-white">Select Doctor</h2>
          </div>

          {step === 2 && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search doctor..."
                  value={doctorSearch}
                  onChange={(e) => setDoctorSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div className="h-[320px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {isLoadingDoctors ? (
                  <div className="flex justify-center py-8"><Loader2 className="animate-spin text-slate-400 h-5 w-5" /></div>
                ) : filteredDoctors.map((d: any) => {
                  const pName = parseMultiLangName(d.user?.name);
                  return (
                    <div 
                      key={d.id} 
                      onClick={() => { 
                        setSelectedDoctor(d);
                        setForm(prev => ({ ...prev, fee: d.fee ? String(d.fee) : "" }));
                        setStep(3); 
                      }}
                      className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50 cursor-pointer transition-all dark:border-slate-800 dark:hover:bg-slate-800/80"
                    >
                      {d.profilePhoto || d.user?.avatar ? (
                        <img src={d.profilePhoto || d.user?.avatar} alt="" className="h-9 w-9 rounded-full object-cover shrink-0 border" />
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {pName.en.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate text-slate-900 dark:text-slate-100">Dr. {pName.en}</p>
                        <p className="text-[10px] text-slate-500 truncate">{d.specialization || "General"}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {step > 2 && selectedDoctor && (
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Selected Doctor</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">Dr. {parseMultiLangName(selectedDoctor.user?.name).en}</p>
              </div>
              <button type="button" onClick={() => { setStep(2); setSelectedDoctor(null); }} className="text-xs font-bold text-emerald-600 hover:underline">Change</button>
            </div>
          )}
        </div>

        {/* STEP 3: CONFIGURE & SCHEDULE */}
        <div className={`col-span-1 border rounded-2xl p-4 transition-all ${step === 3 ? "border-amber-500 bg-white shadow-xl dark:border-amber-600/50 dark:bg-slate-900" : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900 opacity-75"}`}>
          <div className="flex items-center gap-2 mb-4">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold text-sm ${step === 3 ? "bg-amber-500 text-white" : "bg-slate-200 text-slate-500 dark:bg-slate-800"}`}>3</div>
            <h2 className="font-semibold text-slate-900 dark:text-white">Fee & Schedule Setup</h2>
          </div>

          {step === 3 && selectedClinic && selectedDoctor && (
            <form onSubmit={handleAssign} className="space-y-4">
              
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 rounded-xl">
                <p className="text-xs font-medium text-amber-800 dark:text-amber-400">
                  Assigning <strong>Dr. {parseMultiLangName(selectedDoctor.user?.name).en}</strong> to <strong>{parseMultiLangName(selectedClinic.clinicName).en}</strong>.
                </p>
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <IndianRupee className="h-3 w-3" /> Clinic Specific Fee (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.fee}
                  onChange={(e) => setForm({ ...form, fee: e.target.value })}
                  placeholder={`e.g. ${selectedDoctor.fee || "500"}`}
                  className={inputClasses}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <Clock className="h-3 w-3" /> Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className={`${inputClasses} tracking-widest font-bold`}
                  />
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <Clock className="h-3 w-3" /> End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className={`${inputClasses} tracking-widest font-bold`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <Users className="h-3 w-3" /> Max Capacity
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                    className={inputClasses}
                    placeholder="20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <CalendarDays className="h-3 w-3" /> Schedule Type
                  </label>
                  <select
                    value={form.recurrenceType}
                    onChange={(e) => setForm({ ...form, recurrenceType: e.target.value })}
                    className={inputClasses}
                  >
                    <option value="DAILY">Daily (Every Day)</option>
                    <option value="WEEKLY">Weekly (Custom Days)</option>
                    <option value="MONTHLY_DATE">Monthly (Specific Date)</option>
                    <option value="MONTHLY_WEEKDAY">Monthly (Specific Weekday)</option>
                    <option value="SPECIFIC_DATE">Specific Date (Exception)</option>
                  </select>
                </div>
              </div>

              {/* Recurrence Pattern Configuration */}
              <div className="pt-2">
                {form.recurrenceType === "WEEKLY" && (
                  <div>
                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Select Visiting Days</label>
                    <div className="flex flex-wrap gap-1.5">
                      {DAYS_OF_WEEK.map(day => (
                        <button
                          type="button"
                          key={day}
                          onClick={() => setForm(prev => ({
                            ...prev,
                            recurrenceDays: prev.recurrenceDays.includes(day)
                              ? prev.recurrenceDays.filter(d => d !== day)
                              : [...prev.recurrenceDays, day]
                          }))}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                            form.recurrenceDays.includes(day)
                              ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {form.recurrenceDays.includes(day) && <Check className="inline h-3 w-3 mr-1" />}
                          {day.substring(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {form.recurrenceType === "MONTHLY_DATE" && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Every Month on the</span>
                    <input
                      type="number"
                      min={1}
                      max={31}
                      value={form.recurrenceDate}
                      onChange={(e) => setForm({ ...form, recurrenceDate: e.target.value })}
                      className="border border-slate-200 p-2 rounded-xl w-16 text-center text-xs font-bold outline-none focus:border-amber-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    />
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">th</span>
                  </div>
                )}

                {form.recurrenceType === "MONTHLY_WEEKDAY" && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Every</span>
                    <select
                      value={form.recurrenceWeek}
                      onChange={(e) => setForm({ ...form, recurrenceWeek: e.target.value === "LAST" ? "LAST" : Number(e.target.value) })}
                      className="border border-slate-200 p-2 rounded-xl text-xs font-bold outline-none focus:border-amber-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    >
                      {WEEKS.map(w => <option key={w.label} value={w.val}>{w.label}</option>)}
                    </select>
                    <select
                      value={form.recurrenceWeekday}
                      onChange={(e) => setForm({ ...form, recurrenceWeekday: e.target.value })}
                      className="border border-slate-200 p-2 rounded-xl text-xs font-bold outline-none focus:border-amber-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    >
                      {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                )}

                {form.recurrenceType === "SPECIFIC_DATE" && (
                  <div>
                    <label className="text-xs font-bold text-amber-600 block mb-1">Select Exception Date</label>
                    <input
                      type="date"
                      value={form.specificDate}
                      onChange={(e) => setForm({ ...form, specificDate: e.target.value })}
                      className="w-full border border-amber-200 bg-amber-50 rounded-xl p-2.5 text-xs font-bold outline-none focus:border-amber-400 dark:bg-amber-900/20 dark:text-white tracking-widest"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={assignMutation.isPending}
                className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-sm font-bold text-white shadow-md transition hover:bg-amber-600 disabled:opacity-50"
              >
                {assignMutation.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                Assign Doctor & Schedule
              </button>
            </form>
          )}

          {step < 3 && (
            <div className="flex h-56 items-center justify-center text-center">
              <p className="text-xs text-slate-400">Complete previous steps<br />to configure assignment & schedule.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}