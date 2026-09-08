import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

// ============================================================
// Follow-up types (mirrors backend followup module)
// ============================================================

export type FollowupStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";

export interface Followup {
  id: string;
  patientId: string;
  doctorId: string;
  clinicId: string;
  appointmentId: string | null;
  followUpDate: string;
  notes: string | null;
  status: FollowupStatus;
  reminderSentAt: string | null;
  createdByRole: string;
  createdAt: string;
  patient?: { user?: { name?: string; phone?: string } | null; name?: string; phone?: string };
  doctor?: { user?: { name?: string } };
  clinic?: { clinicName?: string };
}

// ------------------------------------------------------------
// Patient: my own follow-ups  (GET /followups/me)
// ------------------------------------------------------------

export function useMyFollowups() {
  return useQuery<Followup[]>({
    queryKey: ["followups", "me"],
    queryFn: async () => {
      const { data } = await api.get("/followups/me");
      return data.data.followups ?? [];
    },
  });
}

// ------------------------------------------------------------
// Clinic / Doctor / Receptionist: follow-ups scheduled by a clinic
// (GET /followups/clinic/:clinicId)
// ------------------------------------------------------------

export function useClinicFollowups(
  clinicId: string | undefined,
  filters: { doctorId?: string; status?: FollowupStatus; upcomingOnly?: boolean } = {},
) {
  return useQuery<Followup[]>({
    queryKey: ["followups", "clinic", clinicId, filters],
    enabled: !!clinicId,
    queryFn: async () => {
      const { data } = await api.get(`/followups/clinic/${clinicId}`, { params: filters });
      return data.data.followups ?? [];
    },
  });
}

// ------------------------------------------------------------
// Mutations
// ------------------------------------------------------------

export interface ScheduleFollowupInput {
  patientId: string;
  doctorId: string;
  clinicId: string;
  appointmentId?: string | null;
  followUpDate: string; // yyyy-mm-dd
  notes?: string;
}

export function useScheduleFollowup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ScheduleFollowupInput) => {
      const { data } = await api.post("/followups", input);
      return data.data.followup as Followup;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["followups"] });
    },
  });
}

export function useCancelFollowup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (followupId: string) => {
      const { data } = await api.patch(`/followups/${followupId}/cancel`);
      return data.data.followup as Followup;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["followups"] }),
  });
}

export function useCompleteFollowup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (followupId: string) => {
      const { data } = await api.patch(`/followups/${followupId}/complete`);
      return data.data.followup as Followup;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["followups"] }),
  });
}
