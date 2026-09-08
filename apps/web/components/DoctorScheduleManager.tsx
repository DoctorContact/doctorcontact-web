"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, Calendar, Users, Clock, Plus, Check, Edit2, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";

const DAYS_OF_WEEK = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const WEEKS = [{ label: "1st", val: 1 }, { label: "2nd", val: 2 }, { label: "3rd", val: 3 }, { label: "4th", val: 4 }, { label: "Last", val: "LAST" }];

export default function DoctorScheduleManager({ clinicId }: { clinicId: string }) {
  const [email, setEmail] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [doctor, setDoctor] = useState<any>(null);

  // Existing Schedules List
  const [existingSchedules, setExistingSchedules] = useState<any[]>([]);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [editCapacity, setEditCapacity] = useState(20);

  // New Schedule State
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [maxPatients, setMaxPatients] = useState(20);
  const [recurrenceType, setRecurrenceType] = useState("DAILY");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [monthlyDate, setMonthlyDate] = useState(1);
  const [monthlyWeek, setMonthlyWeek] = useState<number | "LAST">(1);
  const [monthlyDay, setMonthlyDay] = useState("SUNDAY");
  const [specificDate, setSpecificDate] = useState(""); // For One-off exceptions

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fetch doctor by email
  const handleSearchDoctor = async () => {
    if (!email) return;
    setIsSearching(true);
    setDoctor(null);
    try {
      const res = await api.get(`/doctors/search?email=${email}`);
      if (res.data?.success && res.data.data.doctors.length > 0) {
        setDoctor(res.data.data.doctors[0]);
        fetchExistingSchedules(res.data.data.doctors[0].id);
      } else {
        toast.error("No doctor found with this email.");
      }
    } catch (err) {
      toast.error("Error searching for doctor.");
    } finally {
      setIsSearching(false);
    }
  };

  const fetchExistingSchedules = async (docId: string) => {
    setIsLoadingSchedules(true);
    try {
      // Not passing ?date= means it returns ALL schedules for admin view
      const res = await api.get(`/doctors/${docId}/clinics/${clinicId}/schedules`);
      if (res.data?.success) {
        setExistingSchedules(res.data.data.schedules);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingSchedules(false);
    }
  };

  const handleCreateSchedule = async () => {
    if (!doctor || !startTime || !endTime) {
      toast.error("Please fill all required fields.");
      return;
    }

    setIsSubmitting(true);
    
    let recurrencePattern = {};
    if (recurrenceType === "WEEKLY") recurrencePattern = { days: selectedDays };
    if (recurrenceType === "MONTHLY_DATE") recurrencePattern = { date: monthlyDate };
    if (recurrenceType === "MONTHLY_WEEKDAY") {
      if (monthlyWeek === "LAST") recurrencePattern = { isLast: true, day: monthlyDay };
      else recurrencePattern = { week: monthlyWeek, day: monthlyDay };
    }
    if (recurrenceType === "SPECIFIC_DATE") recurrencePattern = { exactDate: specificDate };

    try {
      await api.post(`/doctors/${doctor.id}/clinics/${clinicId}/schedules`, {
        startTime,
        endTime,
        maxPatients,
        recurrenceType,
        recurrencePattern,
        isActive: true
      });
      toast.success("Schedule added successfully!");
      fetchExistingSchedules(doctor.id);
      setStartTime("");
      setEndTime("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create schedule.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🟢 EASY EDIT CAPACITY
  const handleUpdateCapacity = async (scheduleId: string) => {
    try {
      await api.put(`/doctors/${doctor.id}/clinics/${clinicId}/schedules/${scheduleId}`, {
        maxPatients: editCapacity
      });
      toast.success("Capacity updated successfully!");
      setEditingScheduleId(null);
      fetchExistingSchedules(doctor.id);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update.");
    }
  };

  // Block ONLINE booking for one session (walk-in / reception still work)
  const handleToggleOnlineBooking = async (scheduleId: string, next: boolean) => {
    try {
      await api.put(`/doctors/${doctor.id}/clinics/${clinicId}/schedules/${scheduleId}`, {
        onlineBookingEnabled: next,
      });
      toast.success(next ? "Online booking enabled for this session" : "Online booking blocked — walk-in still works");
      fetchExistingSchedules(doctor.id);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update.");
    }
  };

  // DELETE SCHEDULE
  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!confirm("Are you sure you want to delete this session?")) return;
    try {
      await api.delete(`/doctors/${doctor.id}/clinics/${clinicId}/schedules/${scheduleId}`);
      toast.success("Schedule deleted.");
      fetchExistingSchedules(doctor.id);
    } catch (err: any) {
      toast.error("Failed to delete.");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 max-w-4xl mx-auto dark:bg-slate-900 dark:border-slate-800">
      <h2 className="text-xl font-bold text-slate-800 mb-6 dark:text-white">Doctor Schedule Manager</h2>
      
      {/* 1. DOCTOR LOOKUP */}
      <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
        <label className="text-xs font-bold text-slate-600 mb-2 block uppercase dark:text-slate-400">Search Doctor by Email</label>
        <div className="flex gap-2">
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="doctor@example.com" 
            className="flex-1 border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-[#252a67] dark:bg-slate-900 dark:border-slate-600 dark:text-white"
          />
          <button onClick={handleSearchDoctor} disabled={isSearching} className="bg-[#252a67] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Find
          </button>
        </div>

        {doctor && (
          <div className="mt-4 flex items-center gap-4 bg-emerald-50 border border-emerald-200 p-3 rounded-lg dark:bg-emerald-900/20 dark:border-emerald-900/50">
            <div className="h-10 w-10 rounded-full bg-emerald-200 flex items-center justify-center font-bold text-emerald-700">
              {doctor.user.name.substring(0,2).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-slate-800 dark:text-white">{doctor.user.name}</p>
              <p className="text-xs font-semibold text-emerald-600">{doctor.specialization}</p>
            </div>
          </div>
        )}
      </div>

      {doctor && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* LEFT SIDE: LIST OF EXISTING SCHEDULES */}
          <div>
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 dark:text-white"><Calendar className="h-4 w-4 text-[#14B8A6]" /> Existing Sessions</h3>
            {isLoadingSchedules ? (
              <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin text-[#14B8A6]"/></div>
            ) : existingSchedules.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No schedules configured yet.</p>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {existingSchedules.map(s => (
                  <div key={s.id} className="border border-slate-200 rounded-xl p-3 bg-slate-50 dark:bg-slate-800 dark:border-slate-700">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase bg-blue-100 text-blue-700 px-2 py-0.5 rounded dark:bg-blue-900/40 dark:text-blue-300">
                          {s.recurrenceType.replace("_", " ")}
                        </span>
                        <p className="font-bold text-sm text-slate-800 mt-1 dark:text-slate-200">{s.startTime} - {s.endTime}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingScheduleId(s.id); setEditCapacity(s.maxPatients); }} className="p-1.5 text-slate-400 hover:text-blue-600 bg-white rounded-md shadow-sm border"><Edit2 className="h-3 w-3" /></button>
                        <button onClick={() => handleDeleteSchedule(s.id)} className="p-1.5 text-slate-400 hover:text-red-600 bg-white rounded-md shadow-sm border"><Trash2 className="h-3 w-3" /></button>
                      </div>
                    </div>
                    
                    {/* EDIT CAPACITY INLINE */}
                    {editingScheduleId === s.id ? (
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t">
                        <input type="number" value={editCapacity} onChange={e=>setEditCapacity(Number(e.target.value))} className="w-20 border rounded p-1 text-sm font-bold text-center" />
                        <button onClick={() => handleUpdateCapacity(s.id)} className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded">Save</button>
                        <button onClick={() => setEditingScheduleId(null)} className="text-xs text-slate-500">Cancel</button>
                      </div>
                    ) : (
                      <p className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-1"><Users className="h-3 w-3"/> Capacity: <span className="font-bold text-slate-700 dark:text-slate-300">{s.maxPatients}</span></p>
                    )}

                    {/* Online booking toggle — walk-in/reception always work */}
                    <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-2 dark:border-slate-700">
                      <span className="text-[11px] font-semibold text-slate-500">Online booking</span>
                      <button
                        type="button"
                        onClick={() => handleToggleOnlineBooking(s.id, !(s.onlineBookingEnabled !== false))}
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold transition ${
                          s.onlineBookingEnabled !== false
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                            : "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {s.onlineBookingEnabled !== false ? "ON" : "OFF (walk-in only)"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT SIDE: ADD NEW SCHEDULE / OVERRIDE */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
            <h3 className="font-bold text-slate-800 mb-4 dark:text-white">Add New Session</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Start Time</label>
                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full border p-2 rounded-lg text-sm font-bold outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">End Time</label>
                <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full border p-2 rounded-lg text-sm font-bold outline-none" />
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs font-bold text-slate-600 mb-1 flex items-center gap-1"><Users className="h-3 w-3"/> Max Capacity</label>
              <input type="number" value={maxPatients} onChange={e => setMaxPatients(Number(e.target.value))} min={1} className="w-full border p-2 rounded-lg text-sm font-bold outline-none" />
            </div>

            <div className="mb-4">
              <label className="text-xs font-bold text-slate-600 mb-1 block uppercase">Recurrence Type</label>
              <select value={recurrenceType} onChange={e => setRecurrenceType(e.target.value)} className="w-full border p-2 rounded-lg text-sm font-bold bg-white mb-3 outline-none">
                <option value="DAILY">Daily (Every Day)</option>
                <option value="WEEKLY">Weekly (Custom Days)</option>
                <option value="MONTHLY_DATE">Monthly (Specific Date)</option>
                <option value="MONTHLY_WEEKDAY">Monthly (Specific Weekday)</option>
                <option value="SPECIFIC_DATE">Exception / Specific Date Override</option>
              </select>

              {/* SPECIFIC DATE EXCEPTION UI */}
              {recurrenceType === "SPECIFIC_DATE" && (
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-amber-600 font-bold">Use this to add a one-off extra session on a specific date.</span>
                  <input type="date" value={specificDate} onChange={e => setSpecificDate(e.target.value)} className="border p-2 rounded-lg font-bold" />
                </div>
              )}

              {/* WEEKLY UI */}
              {recurrenceType === "WEEKLY" && (
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map(day => (
                    <button key={day} onClick={() => setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])} className={`px-2 py-1 rounded-md text-[10px] font-bold border flex items-center gap-1 ${selectedDays.includes(day) ? 'bg-[#14B8A6] text-white border-[#14B8A6]' : 'bg-white text-slate-500 border-slate-200'}`}>
                      {selectedDays.includes(day) && <Check className="h-3 w-3"/>} {day.substring(0,3)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={handleCreateSchedule} disabled={isSubmitting} className="w-full bg-[#252a67] text-white font-bold py-3 rounded-lg shadow-md hover:bg-[#1e2251] transition-all flex justify-center gap-2 mt-6">
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />} Save Schedule
            </button>
          </div>
        </div>
      )}
    </div>
  );
}