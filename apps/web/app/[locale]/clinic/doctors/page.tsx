"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Plus, X, Search, Stethoscope, Mail, IndianRupee,
  GraduationCap, UserRound, CheckCircle2,
  Loader2, Award, Clock, Users, Trash2, Edit2, CalendarDays, Check,
  BadgeCheck, Globe, Activity,
  Globe2, PhoneOff 
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useClinicProfile, useClinicDoctors, useAddDoctor, useEditDoctor, type ClinicDoctor } from "@/lib/hooks/useClinic";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";

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

const EMPTY_ADD = {
  nameEn: "", nameBn: "", nameHi: "", email: "", password: "", phone: "", 
  medicalSystem: "ALLOPATHY", 
  specialization: "", qualification: "", experience: "", fee: "",
  startTime: "", endTime: "", capacity: "20",
  recurrenceType: "DAILY", recurrenceDays: [] as string[], recurrenceDate: "1", recurrenceWeek: "1", recurrenceWeekday: "SUNDAY", specificDate: ""
};

const inputClasses = "w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm font-medium text-gray-700 outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-[#252a67] focus:ring-[3px] focus:ring-[#252a67]/15 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500";
const PRIMARY_GRADIENT = "from-[#252a67] via-[#3b4a8f] to-[#14B8A6]";
const GREEN_GRADIENT = "from-[#047857] via-[#059669] to-[#14B8A6]";

function GradientCard({ children, className = "", gradient = PRIMARY_GRADIENT }: { children: React.ReactNode; className?: string; gradient?: string; }) {
  return (
    <div className={`rounded-[22px] bg-gradient-to-r ${gradient} p-[3px] shadow-sm ${className}`}>
      <div className="h-full rounded-[20px] bg-white dark:bg-slate-900">{children}</div>
    </div>
  );
}

export default function ClinicDoctorsPage() {
  const tDoc = useTranslations("ClinicDoctors");
  const tNav = useTranslations("ClinicNav");
  const locale = useLocale();
  
  const { data: clinic } = useClinicProfile();
  const { data: doctors, isLoading, refetch } = useClinicDoctors();
  const addDoctor = useAddDoctor();

  const [showAdd, setShowAdd] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState(EMPTY_ADD);
  const [error, setError] = useState("");
  const [specializations, setSpecializations] = useState<any[]>([]);

  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isExistingDoctor, setIsExistingDoctor] = useState(false);

  useEffect(() => {
    async function fetchSpecializations() {
      try {
        const res = await api.get("/specializations");
        if (res.data?.success) setSpecializations(res.data.data.specializations || res.data.data.items || res.data.data);
      } catch (err) {}
    }
    fetchSpecializations();
  }, []);

  const handleEmailBlur = async () => {
    if (!form.email || !form.email.includes("@")) return;
    setIsCheckingEmail(true);
    try {
      const res = await api.get(`/doctors/search-email?email=${form.email}`);
      const foundDoctor = res.data?.data?.doctors?.[0];
      if (foundDoctor) {
        const pName = parseMultiLangName(foundDoctor.user?.name);
        setForm(prev => ({
          ...prev,
          nameEn: pName.en || prev.nameEn,
          nameBn: pName.bn || prev.nameBn,
          nameHi: pName.hi || prev.nameHi,
          phone: foundDoctor.user?.phone || prev.phone,
          medicalSystem: foundDoctor.medicalSystem || prev.medicalSystem, 
          specialization: foundDoctor.specialization || prev.specialization,
          qualification: foundDoctor.qualification || prev.qualification,
          experience: foundDoctor.experience ? String(foundDoctor.experience) : prev.experience,
          fee: foundDoctor.fee ? String(foundDoctor.fee) : prev.fee,
        }));
        setIsExistingDoctor(true);
        toast.success("Doctor found! Details auto-filled.");
      } else {
        setIsExistingDoctor(false);
      }
    } catch (err) {
      setIsExistingDoctor(false);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.startTime || !form.endTime) {
      setError("Start Time and End Time are required for the initial schedule.");
      return;
    }

    if (!form.nameEn) {
      setError("English Name is required.");
      return;
    }

    const combinedName = `${form.nameEn.trim()} | ${form.nameBn.trim()} | ${form.nameHi.trim()}`;

    let recurrencePattern = {};
    if (form.recurrenceType === "WEEKLY") recurrencePattern = { days: form.recurrenceDays };
    if (form.recurrenceType === "MONTHLY_DATE") recurrencePattern = { date: Number(form.recurrenceDate) };
    if (form.recurrenceType === "MONTHLY_WEEKDAY") recurrencePattern = { week: form.recurrenceWeek === "LAST" ? "LAST" : Number(form.recurrenceWeek), day: form.recurrenceWeekday };
    if (form.recurrenceType === "SPECIFIC_DATE") recurrencePattern = { exactDate: form.specificDate };

    const doctorPayload: any = {
      name: combinedName,
      email: form.email,
      password: form.password ? form.password : undefined,
      phone: form.phone || undefined,
      medicalSystem: form.medicalSystem,
      specialization: form.specialization || undefined,
      qualification: form.qualification || undefined,
      experience: form.experience ? Number(form.experience) : undefined,
      fee: form.fee ? Number(form.fee) : undefined,
      startTime: form.startTime,
      endTime: form.endTime,
      recurrenceType: form.recurrenceType,
      recurrencePattern: recurrencePattern,
    };

    addDoctor.mutate(doctorPayload, {
      onSuccess: async (res: any) => {
        const doctorId = res?.data?.data?.doctor?.id || res?.data?.data?.id || res?.data?.doctor?.id || res?.doctor?.id || res?.id;

        if (doctorId && clinic?.id) {
          try {
            await api.post(`/doctors/${doctorId}/clinics/${clinic.id}/schedules`, {
              startTime: form.startTime,
              endTime: form.endTime,
              maxPatients: form.capacity ? Number(form.capacity) : 20,
              recurrenceType: form.recurrenceType,
              recurrencePattern
            });
            toast.success("Doctor and Schedule added successfully!"); 
          } catch (scheduleErr: any) {
            if (scheduleErr?.response?.status === 409) {
               toast.success("Doctor added successfully! (Schedule was auto-configured)");
            } else {
               toast.error("Doctor added, but failed to save the initial schedule.");
            }
          }
        } else {
          toast.success("Doctor added successfully!"); 
        }

        setForm(EMPTY_ADD); 
        setShowAdd(false); 
        setIsExistingDoctor(false); 
        refetch();
      },
      onError: (err: any) => setError(err?.response?.data?.message || "Failed to add doctor"),
    });
  }

  const filteredDoctors = useMemo(() => {
    const list = doctors || [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;

    return list.filter((doctor) => {
      const pName = parseMultiLangName(doctor.user?.name);
      return (
        pName.en.toLowerCase().includes(q) ||
        pName.bn.toLowerCase().includes(q) ||
        pName.hi.toLowerCase().includes(q) ||
        doctor.specialization?.toLowerCase().includes(q)
      );
    });
  }, [doctors, searchQuery]);

  return (
    <div className="space-y-4 pb-8 sm:space-y-6">
      <GradientCard>
        <div className="relative overflow-hidden p-4 sm:p-6">
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="mb-2.5 flex flex-wrap items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#252a67] to-[#14B8A6] text-white shadow-md">
                  <Stethoscope className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#252a67] sm:text-xs dark:text-blue-400">{tNav("doctors")}</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">{tDoc("heading")}</h1>
            </div>
            <button type="button" onClick={() => { setShowAdd(!showAdd); setForm(EMPTY_ADD); setIsExistingDoctor(false); setError(""); }} className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-bold transition-all sm:w-auto sm:text-sm ${showAdd ? "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100" : "bg-gradient-to-r from-[#252a67] to-[#3b4a8f] text-white shadow-md hover:-translate-y-0.5"}`}>
              {showAdd ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />} {showAdd ? tDoc("cancel") : tDoc("addDoctor")}
            </button>
          </div>
        </div>
      </GradientCard>

      {showAdd && (
        <GradientCard gradient={GREEN_GRADIENT}>
          <form onSubmit={handleAdd} className="p-4 sm:p-6 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#047857] to-[#14B8A6] text-white"><UserRound className="h-6 w-6" /></div>
                <div><h2 className="text-base font-bold text-slate-800 dark:text-white">{tDoc("addNewDoctor")}</h2><p className="mt-0.5 text-xs text-slate-500">{tDoc("addDoctorSub")}</p></div>
              </div>
              {isExistingDoctor && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400">
                  <BadgeCheck className="h-4 w-4" /> Doctor details auto-filled
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-4">
              <Field label="English Name" required><input required type="text" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} className={inputClasses} placeholder="Dr. John Doe" /></Field>
              <Field label="Bengali Name"><input type="text" value={form.nameBn} onChange={(e) => setForm({ ...form, nameBn: e.target.value })} className={inputClasses} placeholder="ডাঃ জন ডো" /></Field>
              <Field label="Hindi Name"><input type="text" value={form.nameHi} onChange={(e) => setForm({ ...form, nameHi: e.target.value })} className={inputClasses} placeholder="डॉ. जॉन डो" /></Field>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
              <Field label={tDoc("email")} required>
                <div className="relative">
                  <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} onBlur={handleEmailBlur} className={`${inputClasses} ${isExistingDoctor ? "border-emerald-300 bg-emerald-50 focus:border-emerald-500" : ""}`} placeholder="doctor@example.com" />
                  {isCheckingEmail && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-[#252a67]" />}
                </div>
              </Field>
              <Field label={tDoc("password")} required><input required={!isExistingDoctor} type="password" minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputClasses} placeholder={isExistingDoctor ? "Leave blank to keep existing" : "Min 6 chars"} /></Field>
              <Field label={tDoc("phone")}><input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClasses} placeholder="Phone number" /></Field>
              
              <Field label="Medical System" required>
                <select value={form.medicalSystem} onChange={(e) => setForm({ ...form, medicalSystem: e.target.value })} className={inputClasses}>
                  <option value="ALLOPATHY">Allopathy</option>
                  <option value="HOMEOPATHY">Homeopathy</option>
                  <option value="AYURVEDA">Ayurveda</option>
                </select>
              </Field>

              <Field label={tDoc("specialization")}>
                <select value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} className={inputClasses}>
                  <option value="">-- Select Category --</option>
                  {specializations.map((spec) => (<option key={spec.id} value={spec.name}>{spec.nameEn || spec.name}</option>))}
                </select>
              </Field>
              <Field label={tDoc("qualification")}><input type="text" value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} className={inputClasses} placeholder="e.g. MBBS, MD" /></Field>
              <Field label={tDoc("experience")}><input type="number" min={0} value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} className={inputClasses} placeholder="Years" /></Field>
              <Field label={tDoc("fee")}><input type="number" min={0} value={form.fee} onChange={(e) => setForm({ ...form, fee: e.target.value })} className={inputClasses} placeholder="Consultation fee" /></Field>
            </div>

            <div className="p-5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-900/50 mb-4">
              <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-400 mb-4 flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Initial Schedule Setup</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <Field label="Start Time" required>
                  <div className="relative"><Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#14B8A6] pointer-events-none" /><input required type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className={`${inputClasses} pl-10 font-bold tracking-widest`} /></div>
                </Field>
                <Field label="End Time" required>
                  <div className="relative"><Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#14B8A6] pointer-events-none" /><input required type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className={`${inputClasses} pl-10 font-bold tracking-widest`} /></div>
                </Field>
                <Field label="Capacity"><input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} className={inputClasses} placeholder="20" /></Field>
                <Field label="Schedule Type">
                  <select value={form.recurrenceType} onChange={e => setForm({...form, recurrenceType: e.target.value})} className={inputClasses}>
                    <option value="DAILY">Daily (Every Day)</option>
                    <option value="WEEKLY">Weekly (Custom Days)</option>
                    <option value="MONTHLY_DATE">Monthly (Specific Date)</option>
                    <option value="MONTHLY_WEEKDAY">Monthly (Specific Weekday)</option>
                    <option value="SPECIFIC_DATE">Specific Date (Exception)</option>
                  </select>
                </Field>
              </div>

              <div className="mt-4">
                {form.recurrenceType === "WEEKLY" && (
                  <div className="flex flex-wrap gap-2">
                    {DAYS_OF_WEEK.map(day => (
                      <button type="button" key={day} onClick={() => setForm({...form, recurrenceDays: form.recurrenceDays.includes(day) ? form.recurrenceDays.filter(d => d !== day) : [...form.recurrenceDays, day]})} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${form.recurrenceDays.includes(day) ? 'bg-[#14B8A6] text-white border-[#14B8A6]' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-600'}`}>
                        {form.recurrenceDays.includes(day) && <Check className="inline h-3 w-3 mr-1"/>} {day.substring(0,3)}
                      </button>
                    ))}
                  </div>
                )}
                {form.recurrenceType === "MONTHLY_DATE" && (
                  <div className="flex items-center gap-2"><span className="text-xs font-bold text-slate-600 dark:text-slate-300">Every Month on the</span><input type="number" min={1} max={31} value={form.recurrenceDate} onChange={e => setForm({...form, recurrenceDate: e.target.value})} className="border border-slate-200 p-2 rounded-lg w-20 text-center text-sm font-bold dark:bg-slate-800 dark:border-slate-700 dark:text-white" /><span className="text-xs font-bold text-slate-600 dark:text-slate-300">th</span></div>
                )}
                {form.recurrenceType === "MONTHLY_WEEKDAY" && (
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Every</span>
                    <select value={form.recurrenceWeek} onChange={e => setForm({...form, recurrenceWeek: e.target.value as any})} className="border border-slate-200 p-2 rounded-lg text-sm font-bold dark:bg-slate-800 dark:border-slate-700 dark:text-white">{WEEKS.map(w => <option key={w.label} value={w.val}>{w.label}</option>)}</select>
                    <select value={form.recurrenceWeekday} onChange={e => setForm({...form, recurrenceWeekday: e.target.value})} className="border border-slate-200 p-2 rounded-lg text-sm font-bold dark:bg-slate-800 dark:border-slate-700 dark:text-white">{DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d}</option>)}</select>
                  </div>
                )}
                {form.recurrenceType === "SPECIFIC_DATE" && (
                  <div><label className="text-xs font-bold text-amber-600 block mb-1">Select Exception Date</label><input type="date" value={form.specificDate} onChange={e=>setForm({...form, specificDate: e.target.value})} className="w-full border border-amber-200 bg-amber-50 rounded-lg p-2.5 text-sm font-bold outline-none focus:border-amber-400 dark:bg-amber-900/20 dark:text-white" /></div>
                )}
              </div>
            </div>

            {error && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">{error}</div>}
            
            <div className="mt-6">
              <button type="submit" disabled={addDoctor.isPending} className="w-full sm:w-auto px-8 rounded-xl bg-gradient-to-r from-[#252a67] to-[#3b4a8f] py-3.5 text-sm font-bold text-white shadow-md hover:-translate-y-0.5">{addDoctor.isPending ? "Creating Account..." : "Confirm & Save Doctor"}</button>
            </div>
          </form>
        </GradientCard>
      )}

      {!isLoading && doctors && doctors.length > 0 && (
        <div className="relative mt-2">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search doctors by name (English, Bengali, Hindi)..." className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-sm font-medium outline-none focus:border-[#252a67] dark:bg-slate-900 dark:border-slate-800 dark:text-white" />
        </div>
      )}

      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-4">
          {filteredDoctors.map((doctor) => (
            <DoctorRow key={doctor.id} doctor={doctor} clinicId={clinic?.id} specializations={specializations} locale={locale} refetch={refetch} />
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean; }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">{label}{required && <span className="text-red-500 ml-1">*</span>}</span>
      {children}
    </label>
  );
}

function DoctorRow({ doctor, clinicId, specializations, locale, refetch }: { doctor: ClinicDoctor; clinicId?: string; specializations: any[], locale: string, refetch: () => void }) {
  const editDoctor = useEditDoctor();
  
  const [editing, setEditing] = useState(false);
  const [showSchedules, setShowSchedules] = useState(false); 

  const initialOnlineStatus = (doctor as any).onlineBookingEnabled ?? true;
  const [isOnlineEnabled, setIsOnlineEnabled] = useState(initialOnlineStatus);
  const [isToggling, setIsToggling] = useState(false);

  const [form, setForm] = useState({
    medicalSystem: (doctor as any).medicalSystem ?? "ALLOPATHY",
    specialization: doctor.specialization ?? "", qualification: doctor.qualification ?? "",
    experience: doctor.experience?.toString() ?? "", fee: doctor.fee?.toString() ?? "",
  });

  const docAny = doctor as any;
  const photo = docAny.user?.avatar || docAny.profilePhoto || null;
  
  const parsedName = parseMultiLangName(doctor.user.name);
  const displayName = locale === "bn" && parsedName.bn ? parsedName.bn : 
                      locale === "hi" && parsedName.hi ? parsedName.hi : 
                      parsedName.en;

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const payload: any = {
      doctorId: doctor.id,
      medicalSystem: form.medicalSystem, 
      specialization: form.specialization || undefined,
      qualification: form.qualification || undefined,
      experience: form.experience ? Number(form.experience) : undefined,
      fee: form.fee ? Number(form.fee) : undefined,
    };
    editDoctor.mutate(payload, { onSuccess: () => { setEditing(false); toast.success("Profile updated"); refetch(); } });
  }

  const handleToggleOnlineBooking = async () => {
    if (!clinicId) return;
    setIsToggling(true);
    const newStatus = !isOnlineEnabled;
    try {
      // 🟢 FIX: Corrected URL from `/clinics` to `/clinic`
      await api.patch(`/clinic/doctors/${doctor.id}/online-booking`, { onlineBookingEnabled: newStatus });
      setIsOnlineEnabled(newStatus);
      toast.success(newStatus ? "Online Booking Enabled" : "Online Booking Disabled");
      refetch();
    } catch (error) {
      toast.error("Failed to update booking status");
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <GradientCard className="flex flex-col h-full">
      <div className="flex flex-col h-full p-4 sm:p-5">
        <div className="flex items-start gap-4 mb-4">
          <div className="relative h-[80px] w-[70px] shrink-0 overflow-hidden rounded-xl bg-slate-100 border border-slate-200">
            {photo ? <img src={photo} alt={displayName} className="h-full w-full object-cover object-top" /> : <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#252a67] to-[#14B8A6] text-white font-bold text-xl">{parsedName.en.replace("Dr. ", "").substring(0, 2).toUpperCase()}</div>}
            {doctor.user.isActive && <div className="absolute bottom-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white shadow-md"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /></div>}
          </div>
          <div className="min-w-0 flex-1 pt-1">
            <p className="truncate text-base font-extrabold text-slate-900 dark:text-white">
              {displayName.startsWith("Dr.") || displayName.startsWith("ডাঃ") || displayName.startsWith("डॉ.") ? displayName : `Dr. ${displayName}`}
            </p>
            
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{(doctor as any).medicalSystem}</span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-medium text-slate-500">{doctor.specialization || "General"}</span>
            </div>
            
            <div className="mt-1.5 flex items-center gap-1.5 text-[9px] font-medium text-slate-400 dark:text-slate-500">
              <Globe className="h-3 w-3" />
              <span className="truncate">EN: {parsedName.en} {parsedName.bn && `• BN: ${parsedName.bn}`} {parsedName.hi && `• HI: ${parsedName.hi}`}</span>
            </div>

            <div className="mt-1.5 flex items-center gap-1.5"><Mail className="h-3 w-3 text-slate-400" /><span className="text-[11px] font-medium text-slate-500 truncate">{doctor.user.email}</span></div>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-700 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            {isOnlineEnabled ? <Globe2 className="h-4 w-4 text-emerald-500" /> : <PhoneOff className="h-4 w-4 text-rose-500" />}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Online Booking</p>
              <p className="text-[9px] font-medium text-slate-400">{isOnlineEnabled ? "Accepting appts online" : "Booking by call only"}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleToggleOnlineBooking}
            disabled={isToggling}
            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${isOnlineEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'} ${isToggling ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${isOnlineEnabled ? 'translate-x-4' : 'translate-x-1'}`} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4 border-b border-slate-100 pb-4 dark:border-slate-800">
          <button onClick={() => { setShowSchedules(!showSchedules); setEditing(false); }} className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${showSchedules ? "bg-[#14B8A6] text-white shadow-sm" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400"}`}>
            <CalendarDays className="h-4 w-4" /> Sessions
          </button>
          <button onClick={() => { setEditing(!editing); setShowSchedules(false); }} className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${editing ? "bg-[#252a67] text-white shadow-sm" : "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400"}`}>
            <Edit2 className="h-4 w-4" /> Edit Profile
          </button>
        </div>

        {!editing && !showSchedules && (
          <div className="grid grid-cols-2 gap-2.5 mt-auto">
            <InfoItem icon={GraduationCap} label="Qualification" value={doctor.qualification || "N/A"} />
            <InfoItem icon={Award} label="Experience" value={doctor.experience ? `${doctor.experience} Yrs` : "N/A"} />
            <InfoItem icon={IndianRupee} label="Fee" value={doctor.fee != null ? `₹${doctor.fee}` : "N/A"} />
            <div className="flex items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-2 dark:border-slate-700 dark:bg-slate-800/30">
               <span className={`text-[10px] font-bold uppercase ${doctor.user.isActive ? "text-emerald-600" : "text-red-500"}`}>Status: {doctor.user.isActive ? "Active" : "Inactive"}</span>
            </div>
          </div>
        )}

        {editing && (
          <form onSubmit={handleSave} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Medical System">
                <select value={form.medicalSystem} onChange={(e) => setForm({ ...form, medicalSystem: e.target.value })} className={`${inputClasses} py-2.5`}>
                  <option value="ALLOPATHY">Allopathy</option>
                  <option value="HOMEOPATHY">Homeopathy</option>
                  <option value="AYURVEDA">Ayurveda</option>
                </select>
              </Field>
              <Field label="Specialization">
                <select value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} className={`${inputClasses} py-2.5`}>
                  <option value="">Select Category</option>
                  {specializations.map((spec) => (<option key={spec.id} value={spec.name}>{spec.nameEn || spec.name}</option>))}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Qualification"><input value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} className={`${inputClasses} py-2.5`} placeholder="MBBS" /></Field>
              <Field label="Exp (Yrs)"><input type="number" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} className={`${inputClasses} py-2.5`} /></Field>
              <Field label="Fee (₹)"><input type="number" value={form.fee} onChange={(e) => setForm({ ...form, fee: e.target.value })} className={`${inputClasses} py-2.5`} /></Field>
            </div>
            <button type="submit" disabled={editDoctor.isPending} className="w-full rounded-xl bg-[#252a67] py-3 text-sm font-bold text-white shadow-md hover:bg-[#1e2251] transition-all flex justify-center items-center gap-2">
              {editDoctor.isPending ? <Loader2 className="h-4 w-4 animate-spin"/> : <CheckCircle2 className="h-4 w-4"/>} Save Profile
            </button>
          </form>
        )}

        {showSchedules && clinicId && (
          <div className="animate-in fade-in zoom-in-95 duration-200">
            <InlineScheduleEditor doctorId={doctor.id} clinicId={clinicId} />
          </div>
        )}
      </div>
    </GradientCard>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string; }) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50 p-3 dark:bg-slate-800 dark:border-slate-700 hover:border-[#252a67]/20 transition-colors">
      <div className="flex items-center gap-1.5 mb-1.5"><Icon className="h-3.5 w-3.5 text-[#252a67] dark:text-blue-400" /><span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500">{label}</span></div>
      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{value}</p>
    </div>
  );
}

function InlineScheduleEditor({ doctorId, clinicId }: { doctorId: string; clinicId: string; }) {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [maxPatients, setMaxPatients] = useState(20);
  const [recurrenceType, setRecurrenceType] = useState("DAILY");
  
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [monthlyDate, setMonthlyDate] = useState(1);
  const [monthlyWeek, setMonthlyWeek] = useState<number | "LAST">(1);
  const [monthlyDay, setMonthlyDay] = useState("SUNDAY");
  const [specificDate, setSpecificDate] = useState("");
  
  const [editingCapacityId, setEditingCapacityId] = useState<string | null>(null);
  const [editCapValue, setEditCapValue] = useState(20);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/doctors/${doctorId}/clinics/${clinicId}/schedules`);
      if (res.data?.success) setSchedules(res.data.data.schedules);
    } catch (err) { toast.error("Failed to fetch schedules"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSchedules(); }, [doctorId, clinicId]);

  const handleAdd = async () => {
    if (!startTime || !endTime) return toast.error("Start and End times are required");
    
    let recurrencePattern = {};
    if (recurrenceType === "WEEKLY") {
      if (selectedDays.length === 0) return toast.error("Select at least one day");
      recurrencePattern = { days: selectedDays };
    }
    if (recurrenceType === "MONTHLY_DATE") recurrencePattern = { date: monthlyDate };
    if (recurrenceType === "MONTHLY_WEEKDAY") {
      if (monthlyWeek === "LAST") recurrencePattern = { isLast: true, day: monthlyDay };
      else recurrencePattern = { week: monthlyWeek, day: monthlyDay };
    }
    if (recurrenceType === "SPECIFIC_DATE") {
      if (!specificDate) return toast.error("Please select an exception date");
      recurrencePattern = { exactDate: specificDate };
    }
    
    try {
      await api.post(`/doctors/${doctorId}/clinics/${clinicId}/schedules`, { startTime, endTime, maxPatients, recurrenceType, recurrencePattern });
      toast.success("Session added!");
      setStartTime(""); setEndTime(""); fetchSchedules();
    } catch (err: any) { toast.error(err.response?.data?.message || "Failed to add session"); }
  };

  const handleUpdateCapacity = async (id: string) => {
    try {
      await api.put(`/doctors/${doctorId}/clinics/${clinicId}/schedules/${id}`, { maxPatients: editCapValue });
      toast.success("Capacity updated");
      setEditingCapacityId(null); fetchSchedules();
    } catch (err) { toast.error("Failed to update"); }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Delete this session completely?")) return;
    try {
      await api.delete(`/doctors/${doctorId}/clinics/${clinicId}/schedules/${id}`);
      toast.success("Session removed"); fetchSchedules();
    } catch (err) { toast.error("Failed to delete"); }
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
        <p className="text-[10px] font-extrabold uppercase text-slate-500 mb-4 tracking-wider">Add New Time Slot</p>
        
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Start Time</label>
            <div className="relative group">
              <Clock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#14B8A6] group-focus-within:text-[#252a67] transition-colors" />
              <input type="time" value={startTime} onChange={e=>setStartTime(e.target.value)} className="w-full border border-slate-200 rounded-xl p-2.5 pl-9 text-xs font-bold outline-none transition-all focus:border-[#252a67] focus:ring-[3px] focus:ring-[#252a67]/15 bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white tracking-widest" />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">End Time</label>
            <div className="relative group">
              <Clock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#14B8A6] group-focus-within:text-[#252a67] transition-colors" />
              <input type="time" value={endTime} onChange={e=>setEndTime(e.target.value)} className="w-full border border-slate-200 rounded-xl p-2.5 pl-9 text-xs font-bold outline-none transition-all focus:border-[#252a67] focus:ring-[3px] focus:ring-[#252a67]/15 bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white tracking-widest" />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Capacity</label>
            <div className="relative"><Users className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" /><input type="number" min={1} value={maxPatients} onChange={e=>setMaxPatients(Number(e.target.value))} className="w-full border border-slate-200 rounded-xl p-2.5 pl-8 text-xs font-bold outline-none transition-all focus:border-[#252a67] bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white" /></div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Schedule Type</label>
            <select value={recurrenceType} onChange={e=>setRecurrenceType(e.target.value)} className="w-full border border-slate-200 bg-slate-600 text-white rounded-xl p-2.5 text-[10px] font-bold outline-none cursor-pointer">
              <option value="DAILY">Daily (Every Day)</option>
              <option value="WEEKLY">Weekly (Custom Days)</option>
              <option value="MONTHLY_DATE">Monthly (Specific Date)</option>
              <option value="MONTHLY_WEEKDAY">Monthly (Specific Weekday)</option>
              <option value="SPECIFIC_DATE">Specific Date (Exception)</option>
            </select>
          </div>
        </div>
        
        {recurrenceType === "WEEKLY" && (
          <div className="flex flex-wrap gap-1.5 mb-4 border-t border-slate-200 pt-3 dark:border-slate-700">
            {DAYS_OF_WEEK.map(day => (
              <button key={day} onClick={() => setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])} className={`px-2.5 py-1.5 rounded-lg text-[9px] font-bold border flex items-center gap-1 transition-colors ${selectedDays.includes(day) ? 'bg-[#14B8A6] text-white border-[#14B8A6]' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-600'}`}>
                {selectedDays.includes(day) && <Check className="h-3 w-3"/>} {day.substring(0,3)}
              </button>
            ))}
          </div>
        )}
        
        {recurrenceType === "MONTHLY_DATE" && (
          <div className="flex items-center gap-2 mb-4 border-t border-slate-200 pt-3 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Every Month on the</span>
            <input type="number" min={1} max={31} value={monthlyDate} onChange={e => setMonthlyDate(Number(e.target.value))} className="border border-slate-200 p-2 rounded-xl w-16 text-center text-xs font-bold outline-none focus:border-[#252a67] dark:bg-slate-800 dark:border-slate-600 dark:text-white" />
            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">th</span>
          </div>
        )}

        {recurrenceType === "MONTHLY_WEEKDAY" && (
          <div className="flex items-center gap-2 mb-4 border-t border-slate-200 pt-3 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Every</span>
            <select value={monthlyWeek} onChange={e => setMonthlyWeek(e.target.value === "LAST" ? "LAST" : Number(e.target.value))} className="border border-slate-200 p-2 rounded-xl text-xs font-bold outline-none focus:border-[#252a67] dark:bg-slate-800 dark:border-slate-600 dark:text-white">
              {WEEKS.map(w => <option key={w.label} value={w.val}>{w.label}</option>)}
            </select>
            <select value={monthlyDay} onChange={e => setMonthlyDay(e.target.value)} className="border border-slate-200 p-2 rounded-xl text-xs font-bold outline-none focus:border-[#252a67] dark:bg-slate-800 dark:border-slate-600 dark:text-white">
              {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        )}

        {recurrenceType === "SPECIFIC_DATE" && (
          <div className="mb-4 border-t border-slate-200 pt-3 dark:border-slate-700">
            <label className="text-[10px] font-bold text-amber-600 block mb-1">Select Exception Date</label>
            <input type="date" value={specificDate} onChange={e=>setSpecificDate(e.target.value)} className="w-full border border-amber-200 bg-amber-50 rounded-xl p-2.5 text-xs font-bold outline-none focus:border-amber-400 focus:ring-[3px] focus:ring-amber-400/20 dark:bg-amber-900/20 dark:text-white tracking-widest" />
          </div>
        )}
        
        <button onClick={handleAdd} className="w-full bg-[#14B8A6] text-white font-bold py-2.5 text-sm rounded-xl shadow-sm hover:bg-[#0f766e] transition-colors">Save Time Slot</button>
      </div>

      <div>
        <p className="text-[10px] font-extrabold uppercase text-slate-400 mb-3 tracking-wider flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> Active Sessions</p>
        <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
          {loading ? <div className="p-3 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto text-slate-400"/></div> : schedules.length === 0 ? <p className="text-xs text-slate-400 italic text-center p-4 border border-dashed rounded-xl">No sessions configured.</p> : schedules.map((s, index) => (
            <div key={s.id || `schedule-${index}`} className="flex flex-col border border-slate-200 rounded-xl p-3.5 bg-white shadow-sm hover:border-[#14B8A6]/40 transition-colors dark:bg-slate-800 dark:border-slate-700">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded tracking-wide ${s.recurrenceType === 'SPECIFIC_DATE' ? 'bg-amber-100 text-amber-700' : 'bg-blue-50 text-blue-600'}`}>
                      {s.recurrenceType.replace("_", " ")}
                    </span>
                    {s.recurrenceType === "WEEKLY" && s.recurrencePattern?.days && (
                      <span className="text-[10px] font-bold text-slate-500">
                        ({s.recurrencePattern.days.map((d: string) => d.substring(0,3)).join(", ")})
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-extrabold text-slate-800 mt-2 dark:text-slate-200 flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-slate-400" /> {s.startTime} - {s.endTime}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={()=>{setEditingCapacityId(s.id); setEditCapValue(s.maxPatients);}} className="h-8 w-8 flex items-center justify-center text-slate-500 hover:text-blue-600 border border-slate-200 rounded-lg bg-slate-50 transition-colors shadow-sm"><Edit2 className="h-3.5 w-3.5"/></button>
                  <button onClick={()=>handleDelete(s.id)} className="h-8 w-8 flex items-center justify-center text-slate-500 hover:text-red-600 border border-slate-200 rounded-lg bg-slate-50 transition-colors shadow-sm"><Trash2 className="h-3.5 w-3.5"/></button>
                </div>
              </div>
              
              {editingCapacityId === s.id ? (
                <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Max Limit:</span>
                  <input type="number" value={editCapValue} onChange={e=>setEditCapValue(Number(e.target.value))} className="w-16 border border-slate-300 rounded-lg p-1.5 text-xs text-center font-bold outline-none focus:border-[#14B8A6] focus:ring-[2px] focus:ring-[#14B8A6]/15 shadow-sm dark:bg-slate-900 dark:border-slate-600 dark:text-white" />
                  <button onClick={()=>handleUpdateCapacity(s.id)} className="bg-[#14B8A6] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-[#0f766e]">Save</button>
                  <button onClick={()=>setEditingCapacityId(null)} className="text-[10px] font-bold text-slate-500 hover:text-slate-700">Cancel</button>
                </div>
              ) : (
                <div className="mt-3 border-t border-slate-50 pt-2.5 dark:border-slate-700/50">
                  <p className="text-[10px] font-semibold text-slate-500 flex items-center gap-1.5"><Users className="h-3 w-3 text-[#252a67] dark:text-blue-400"/> Limit: <span className="font-bold text-slate-700 dark:text-slate-300">{s.maxPatients} Patients</span></p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}