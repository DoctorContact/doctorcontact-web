import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Doctor, DoctorScheduleSlot } from "@doctor-contract/shared";
import { api } from "@/lib/api";

export function useDoctorSearch(
  query: string,
  city?: string,
  filters?: { specializationId?: string; maxFee?: number; availableToday?: boolean; liveNow?: boolean }
) {
  return useQuery<Doctor[]>({
    queryKey: ["doctors", "search", query, city ?? "", filters ?? {}],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (query) params.query = query;
      if (city) params.city = city;
      if (filters?.specializationId) params.specializationId = filters.specializationId;
      if (filters?.maxFee) params.maxFee = String(filters.maxFee);
      if (filters?.availableToday) params.availableToday = "true";
      if (filters?.liveNow) params.liveNow = "true";
      const { data } = await api.get("/doctors/search", { params });
      return data.data.doctors;
    },
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