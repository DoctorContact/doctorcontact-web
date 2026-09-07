import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import type {
  Doctor,
  DoctorRequest,
  DoctorLeave,
  DoctorQueue,
  DashboardStats,
  ClinicSearchResult,
  DayOfWeek,
} from "@doctor-contract/shared";

// ------------------------------------------------------------
// 1. Doctor Dashboard
// GET /dashboard/doctor
// ------------------------------------------------------------
export function useDoctorDashboard() {
  return useQuery<DashboardStats>({
    queryKey: ["doctor", "dashboard"],
    queryFn: async () => {
      const res = await api.get("/dashboard/doctor");
      return res.data?.data?.stats ?? res.data?.data ?? {};
    },
  });
}

// ------------------------------------------------------------
// 2. Doctor Search
// GET /doctors/search?name={name}
// ------------------------------------------------------------
export function useSearchDoctors(name?: string) {
  return useQuery<Doctor[]>({
    queryKey: ["doctor", "search", name ?? ""],
    queryFn: async () => {
      const res = await api.get("/doctors/search", {
        params: name ? { name } : {},
      });
      return res.data?.data?.doctors ?? [];
    },
    enabled: Boolean(name && name.length > 0),
  });
}

// ------------------------------------------------------------
// 3. Clinic Search
// GET /doctors/clinics/search?name={name}
// ------------------------------------------------------------
export function useSearchClinics(name?: string) {
  return useQuery<ClinicSearchResult[]>({
    queryKey: ["doctor", "clinics", "search", name ?? ""],
    queryFn: async () => {
      const res = await api.get("/doctors/clinics/search", {
        params: name ? { name } : {},
      });
      return res.data?.data?.clinics ?? [];
    },
  });
}

// ------------------------------------------------------------
// 4. Clinic -> Doctor Request (Create Request)
// POST /doctors/requests
// ------------------------------------------------------------
export function useCreateClinicDoctorRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      doctorId: string;
      fee?: number;
      dayOfWeek: DayOfWeek;
      startTime: string;
      endTime: string;
    }) => {
      const body: Record<string, unknown> = {
        doctorId: payload.doctorId,
        dayOfWeek: payload.dayOfWeek,
        startTime: payload.startTime,
        endTime: payload.endTime,
      };
      if (payload.fee !== undefined) body.fee = payload.fee;
      const res = await api.post("/doctors/requests", body);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["doctor", "requests"] });
    },
  });
}

// ------------------------------------------------------------
// 5. Received Requests
// GET /doctors/requests/received
// ------------------------------------------------------------
export function useDoctorReceivedRequests() {
  return useQuery<DoctorRequest[]>({
    queryKey: ["doctor", "requests", "received"],
    queryFn: async () => {
      try {
        const res = await api.get("/doctors/requests/received");
        return res.data?.data?.requests ?? res.data?.requests ?? [];
      } catch {
        return [];
      }
    },
  });
}

// ------------------------------------------------------------
// 6. Respond to Clinic Request
// PATCH /doctors/requests/:associationId/respond
// ------------------------------------------------------------
export function useRespondDoctorRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      associationId,
      action,
    }: {
      associationId: string;
      action: "ACCEPT" | "REJECT";
    }) => {
      const res = await api.patch(`/doctors/requests/${associationId}/respond`, {
        action,
      });
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["doctor", "requests"] });
      qc.invalidateQueries({ queryKey: ["doctor", "dashboard"] });
    },
  });
}

// ------------------------------------------------------------
// 7. Doctor -> Clinic Request
// POST /doctors/clinic-requests
// ------------------------------------------------------------
export function useDoctorSendClinicRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      clinicId: string;
      fee?: number;
      dayOfWeek: DayOfWeek;
      startTime: string;
      endTime: string;
    }) => {
      const body: Record<string, unknown> = {
        clinicId: payload.clinicId,
        dayOfWeek: payload.dayOfWeek,
        startTime: payload.startTime,
        endTime: payload.endTime,
      };
      if (payload.fee !== undefined) body.fee = payload.fee;
      const res = await api.post("/doctors/clinic-requests", body);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["doctor", "requests", "sent"] });
    },
  });
}

// ------------------------------------------------------------
// 8. Sent Requests
// GET /doctors/requests/sent
// ------------------------------------------------------------
export function useDoctorSentRequests() {
  return useQuery<DoctorRequest[]>({
    queryKey: ["doctor", "requests", "sent"],
    queryFn: async () => {
      try {
        const res = await api.get("/doctors/requests/sent");
        return res.data?.data?.requests ?? res.data?.requests ?? [];
      } catch {
        return [];
      }
    },
  });
}

// ------------------------------------------------------------
// 9. Cancel Association
// PATCH /doctors/associations/:associationId/cancel
// ------------------------------------------------------------
export function useCancelAssociation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (associationId: string) => {
      const res = await api.patch(`/doctors/associations/${associationId}/cancel`);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["doctor", "requests"] });
    },
  });
}

// ------------------------------------------------------------
// 10. Profile Photo
// POST /doctors/profile-photo
// ------------------------------------------------------------
export function useUploadDoctorProfilePhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append("photo", file);
      const res = await api.post("/doctors/profile-photo", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.data.doctor as Doctor;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["doctor", "profile"] });
    },
  });
}

// ------------------------------------------------------------
// 11. Consultation Time
// PATCH /doctors/:doctorId/clinics/:clinicId/consultation-time
// ------------------------------------------------------------
export function useUpdateConsultationTime() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      doctorId,
      clinicId,
      avgConsultationMinutes,
    }: {
      doctorId: string;
      clinicId: string;
      avgConsultationMinutes: number;
    }) => {
      const res = await api.patch(
        `/doctors/${doctorId}/clinics/${clinicId}/consultation-time`,
        { avgConsultationMinutes }
      );
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["doctor", "dashboard"] });
      qc.invalidateQueries({ queryKey: ["doctor", "clinics"] });
    },
  });
}

// ------------------------------------------------------------
// 12. Mark Leave (date MUST be YYYY-MM-DD)
// POST /doctors/:doctorId/clinics/:clinicId/leave
// ------------------------------------------------------------
export function useMarkDoctorLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      doctorId,
      clinicId,
      date,
      reason,
    }: {
      doctorId: string;
      clinicId: string;
      date: string;
      reason?: string;
    }) => {
      const payload: { date: string; reason?: string } = { date };
      if (reason) payload.reason = reason;
      const res = await api.post(
        `/doctors/${doctorId}/clinics/${clinicId}/leave`,
        payload
      );
      return res.data.data;
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({
        queryKey: ["doctor", "leaves", variables.doctorId, variables.clinicId],
      });
    },
  });
}

// ------------------------------------------------------------
// 13. Cancel Leave
// DELETE /doctors/:doctorId/clinics/:clinicId/leave?date={date}
// ------------------------------------------------------------
export function useCancelDoctorLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      doctorId,
      clinicId,
      date,
    }: {
      doctorId: string;
      clinicId: string;
      date: string;
    }) => {
      const res = await api.delete(
        `/doctors/${doctorId}/clinics/${clinicId}/leave`,
        { params: { date } }
      );
      return res.data.data;
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({
        queryKey: ["doctor", "leaves", variables.doctorId, variables.clinicId],
      });
    },
  });
}

// ------------------------------------------------------------
// 14. List Leaves
// GET /doctors/:doctorId/clinics/:clinicId/leave
// ------------------------------------------------------------
export function useDoctorLeaves(doctorId: string, clinicId: string) {
  return useQuery<DoctorLeave[]>({
    queryKey: ["doctor", "leaves", doctorId, clinicId],
    queryFn: async () => {
      try {
        const res = await api.get(
          `/doctors/${doctorId}/clinics/${clinicId}/leave`
        );
        return res.data?.data?.leaves ?? res.data?.leaves ?? [];
      } catch {
        return [];
      }
    },
    enabled: Boolean(doctorId && clinicId),
  });
}

// ------------------------------------------------------------
// 15. Notify Delay
// POST /doctors/:doctorId/clinics/:clinicId/delay
// ------------------------------------------------------------
export function useNotifyDoctorDelay() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      doctorId,
      clinicId,
      delayMinutes,
    }: {
      doctorId: string;
      clinicId: string;
      delayMinutes: number;
    }) => {
      const res = await api.post(
        `/doctors/${doctorId}/clinics/${clinicId}/delay`,
        { delayMinutes }
      );
      return res.data.data;
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({
        queryKey: ["doctor", "queue", variables.doctorId, variables.clinicId],
      });
    },
  });
}

// ============================================================
// QUEUE API HOOKS (SECTION 11)
// ============================================================

// GET /queue/:doctorId/:clinicId/:date
export function useDoctorQueue(doctorId: string, clinicId: string, date: string) {
  const queryClient = useQueryClient();
  const queryKey = ["doctor", "queue", doctorId, clinicId, date];

  // Live updates — no polling. The backend broadcasts queueUpdate/
  // tokenCalled/appointmentCompleted/doctorDelay to room
  // queue:{doctorId}:{clinicId} on every queue-changing action; we just
  // refetch this exact query when any of them fire.
  useEffect(() => {
    if (!doctorId || !clinicId) return;

    const socket = getSocket();

    function join() {
      socket.emit("joinQueue", { doctorId, clinicId });
    }

    function refetch() {
      queryClient.invalidateQueries({ queryKey });
    }

    if (!socket.connected) {
      socket.connect();
    } else {
      join();
    }

    socket.on("connect", join);
    socket.on("queueUpdate", refetch);
    socket.on("tokenCalled", refetch);
    socket.on("appointmentCompleted", refetch);
    socket.on("doctorDelay", refetch);

    return () => {
      socket.emit("leaveQueue", { doctorId, clinicId });
      socket.off("connect", join);
      socket.off("queueUpdate", refetch);
      socket.off("tokenCalled", refetch);
      socket.off("appointmentCompleted", refetch);
      socket.off("doctorDelay", refetch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId, clinicId, date]);

  return useQuery<DoctorQueue>({
    queryKey,
    queryFn: async () => {
      try {
        const res = await api.get(`/queue/${doctorId}/${clinicId}/${date}`);
        return (
          res.data?.data?.queue ??
          res.data?.data ?? {
            doctorId,
            clinicId,
            date,
            currentToken: 0,
            lastTokenIssued: 0,
            status: "CLOSED",
            tokens: [],
          }
        );
      } catch {
        return {
          doctorId,
          clinicId,
          date,
          currentToken: 0,
          lastTokenIssued: 0,
          status: "CLOSED",
          tokens: [],
        };
      }
    },
    enabled: Boolean(doctorId && clinicId && date),
  });
}

// Helper for queue mutations
function useQueueAction(actionPath: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      doctorId,
      clinicId,
      date,
      body,
    }: {
      doctorId: string;
      clinicId: string;
      date: string;
      body?: Record<string, unknown>;
    }) => {
      const url = `/queue/${doctorId}/${clinicId}/${date}/${actionPath}`;
      const res =
        actionPath === "emergency"
          ? await api.post(url, body ?? {})
          : await api.patch(url, body);
      return res.data.data;
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({
        queryKey: [
          "doctor",
          "queue",
          variables.doctorId,
          variables.clinicId,
          variables.date,
        ],
      });
    },
  });
}

export function useQueueNext() {
  return useQueueAction("next");
}

export function useQueuePrevious() {
  return useQueueAction("previous");
}

export function useQueueSkip() {
  return useQueueAction("skip");
}

export function useQueueRecall() {
  return useQueueAction("recall");
}

export function useQueuePause() {
  return useQueueAction("pause");
}

export function useQueueResume() {
  return useQueueAction("resume");
}

export function useQueueClose() {
  return useQueueAction("close");
}

export function useQueueReopen() {
  return useQueueAction("reopen");
}

export function useQueueEmergency() {
  return useQueueAction("emergency");
}
