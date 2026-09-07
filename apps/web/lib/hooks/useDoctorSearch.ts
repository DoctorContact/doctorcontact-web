import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Doctor, DoctorScheduleSlot } from "@doctor-contract/shared";
import { api } from "@/lib/api";

export function useDoctorSearch(
  query: string,
  city?: string,
  filters?: { liveNow?: boolean; availableToday?: boolean }
) {
  return useQuery({
    // 🟢 FIX: queryKey-তে filters অ্যাড করা হলো, যাতে ট্যাব চেঞ্জ হলে নতুন করে API কল হয়
    queryKey: [
      "doctors", 
      "search", 
      query, 
      city, 
      filters?.liveNow, 
      filters?.availableToday
    ],
    queryFn: async () => {
      const res = await api.get('/doctors/advanced-search', {
        params: {
          query: query || undefined,
          city: city || undefined,
          liveNow: filters?.liveNow ? "true" : undefined,
          availableToday: filters?.availableToday ? "true" : undefined
        }
      });
      return res.data?.data?.doctors || res.data?.data || [];
    }
  });
}

// Schedules are deliberately left out of the search/list response (too
// heavy) — fetched on demand once a patient opens the booking panel for a
// specific doctor at a specific clinic.
export function useDoctorSchedules(doctorId: string | undefined, clinicId: string | undefined) {
  return useQuery<DoctorScheduleSlot[]>({
    queryKey: ["doctors", doctorId, "clinics", clinicId, "schedules"],
    enabled: !!doctorId && !!clinicId,
    queryFn: async () => {
      const { data } = await api.get(`/doctors/${doctorId}/clinics/${clinicId}/schedules`);
      return data.data.schedules;
    },
  });
}

type BookPayload = { doctorId: string; clinicId: string; scheduleId: string; date: string };

export function useBookAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: BookPayload) => {
      const { data } = await api.post("/appointments/book/online", payload);
      return data.data.appointment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments", "me"] });
    },
  });
}