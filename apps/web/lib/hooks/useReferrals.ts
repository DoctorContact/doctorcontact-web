import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type PatientLookup = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  age: number | null;
  gender: string | null;
  isGuest: boolean;
};

export type DiagnosticCenterLookup = {
  id: string;
  centerName: string;
  city: string | null;
  address: string | null;
  logo: string | null;
};

export type SentReferral = {
  id: string;
  testNames: string[];
  notes: string | null;
  createdAt: string;
  patient: { name: string; phone: string | null; user?: { name: string; phone: string | null } };
  diagnosticCenter: { centerName: string };
};

export function useSearchPatientByPhone() {
  return useMutation({
    mutationFn: async (phone: string) => {
      try {
        const { data } = await api.get("/patient/search", { params: { phone } });
        return (data?.data?.patient ?? data?.data ?? null) as PatientLookup | null;
      } catch {
        return null;
      }
    },
  });
}

export function useSearchDiagnosticCenters() {
  return useMutation({
    mutationFn: async (name: string) => {
      try {
        const { data } = await api.get("/diagnostic-centers/search", { params: { name } });
        return (data?.data?.centers ?? data?.data ?? []) as DiagnosticCenterLookup[];
      } catch {
        return [];
      }
    },
  });
}

export function useCreateReferral() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      patientId: string;
      diagnosticCenterId: string;
      testNames: string[];
      notes?: string;
      appointmentId?: string;
    }) => {
      const res = await api.post("/test-referrals", payload);
      return res.data?.data?.referral ?? res.data?.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["referrals", "sent"] }),
  });
}

export function useSentReferrals() {
  return useQuery<SentReferral[]>({
    queryKey: ["referrals", "sent"],
    queryFn: async () => {
      try {
        const res = await api.get("/test-referrals/sent");
        return (
          res.data?.data?.referrals ??
          res.data?.data ??
          res.data?.referrals ??
          []
        );
      } catch {
        return [];
      }
    },
  });
}

// ============================================================
// Diagnostic-side processing workflow
// ============================================================

export type ReferralStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface Referral {
  id: string;
  testNames: string[];
  notes: string | null;
  status: ReferralStatus;
  resultNotes: string | null;
  completedAt: string | null;
  createdAt: string;
  createdByRole: string;
  patientId: string;
  diagnosticCenterId: string;
  referringClinicId: string | null;
  patient?: { name?: string; phone?: string | null; address?: string | null; user?: { name?: string; phone?: string | null; email?: string | null } | null };
  referringClinic?: { clinicName?: string } | null;
  diagnosticCenter?: { centerName?: string } | null;
}

export interface CenterStats {
  PENDING: number;
  IN_PROGRESS: number;
  COMPLETED: number;
  CANCELLED: number;
  TOTAL: number;
}

export function useIncomingReferrals(filters: { status?: ReferralStatus } = {}) {
  return useQuery<Referral[]>({
    queryKey: ["referrals", "incoming", filters],
    queryFn: async () => {
      const res = await api.get("/test-referrals/incoming", { params: filters });
      return res.data?.data?.referrals ?? [];
    },
  });
}

export function useCenterStats() {
  return useQuery<CenterStats>({
    queryKey: ["referrals", "stats"],
    queryFn: async () => {
      const res = await api.get("/test-referrals/stats");
      return res.data?.data?.stats;
    },
  });
}

export function useReferralDetails(id: string | undefined) {
  return useQuery<Referral>({
    queryKey: ["referrals", "detail", id],
    enabled: !!id,
    queryFn: async () => {
      const res = await api.get(`/test-referrals/${id}`);
      return res.data?.data?.referral;
    },
  });
}

export function useUpdateReferralStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, resultNotes }: { id: string; status: ReferralStatus; resultNotes?: string }) => {
      const res = await api.patch(`/test-referrals/${id}/status`, { status, resultNotes });
      return res.data?.data?.referral as Referral;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["referrals"] }),
  });
}

export function useStaffProfile() {
  return useQuery<{
    id: string;
    diagnosticCenterId: string;
    user?: { name?: string; email?: string | null; phone?: string | null };
    diagnosticCenter?: { centerName?: string; city?: string | null; address?: string | null; phone?: string | null };
  }>({
    queryKey: ["diagnosticStaff", "me"],
    queryFn: async () => {
      const res = await api.get("/diagnostic-centers/staff/me");
      return res.data?.data?.profile;
    },
  });
}

// Patient's own test recommendations / referrals
export function useMyReferrals() {
  return useQuery<Referral[]>({
    queryKey: ["referrals", "me"],
    queryFn: async () => {
      const res = await api.get("/test-referrals/me");
      return res.data?.data?.referrals ?? [];
    },
  });
}