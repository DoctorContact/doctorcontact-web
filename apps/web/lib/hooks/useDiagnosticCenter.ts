import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  DiagnosticCenter,
  DiagnosticCenterStaff,
  DiagnosticCenterIncomingReferral,
  UpdateDiagnosticCenterProfileInput,
  CreateDiagnosticCenterStaffInput,
  ChangeDiagnosticCenterStaffPasswordInput,
} from "@doctor-contract/shared";


export interface DiagnosticTest {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
}

export interface CenterTest {
  id: string;
  diagnosticCenterId: string;
  testId: string;
  price: number;
  isAvailable: boolean;
  diagnosticTest: DiagnosticTest;
}

export interface AddCenterTestInput {
  testId: string;
  price: number;
  isAvailable?: boolean;
}

export interface UpdateCenterTestInput {
  price?: number;
  isAvailable?: boolean;
}

// ============================================================
// 1. Diagnostic Center Profile Hooks
// ============================================================

export function useDiagnosticCenterProfile() {
  return useQuery<DiagnosticCenter>({
    queryKey: ["diagnostic-center", "profile"],
    queryFn: async () => {
      const res = await api.get("/diagnostic-centers/profile");
      return res.data.data.center;
    },
  });
}

export function useUpdateDiagnosticCenterProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateDiagnosticCenterProfileInput) => {
      const res = await api.patch("/diagnostic-centers/profile", payload);
      return res.data.data.center as DiagnosticCenter;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["diagnostic-center", "profile"] });
    },
  });
}

export function useUploadDiagnosticCenterLogo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append("photo", file);
      const res = await api.post("/diagnostic-centers/logo", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.data.center as DiagnosticCenter;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["diagnostic-center", "profile"] });
    },
  });
}

// ============================================================
// 2. Diagnostic Center Staff Hooks
// ============================================================

export function useDiagnosticCenterStaff() {
  return useQuery<DiagnosticCenterStaff[]>({
    queryKey: ["diagnostic-center", "staff"],
    queryFn: async () => {
      const res = await api.get("/diagnostic-centers/staff");
      return res.data.data.staff;
    },
  });
}

export function useAddDiagnosticCenterStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateDiagnosticCenterStaffInput) => {
      const res = await api.post("/diagnostic-centers/staff", payload);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["diagnostic-center", "staff"] });
    },
  });
}

export function useChangeDiagnosticCenterStaffPassword() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ChangeDiagnosticCenterStaffPasswordInput) => {
      const res = await api.patch("/diagnostic-centers/staff/change-password", payload);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["diagnostic-center", "staff"] });
    },
  });
}

// ============================================================
// 3. Incoming Test Referrals Hook (Phase 02)
// ============================================================

export function useDiagnosticCenterIncomingReferrals(
  params: { page?: number; limit?: number } = {}
) {
  const { page = 1, limit = 20 } = params;
  return useQuery<DiagnosticCenterIncomingReferral[]>({
    queryKey: ["diagnostic-center", "referrals", "incoming", page, limit],
    queryFn: async () => {
      const res = await api.get("/test-referrals/incoming", {
        params: { page, limit },
      });
      return (
        res.data?.data?.referrals ??
        res.data?.data ??
        res.data?.referrals ??
        []
      );
    },
  });
}

// ============================================================
// 4. Test Management Hooks (NEW)
// ============================================================

// গ্লোবাল টেস্ট লিস্ট ফেচ করার জন্য
export function useGlobalTests() {
  return useQuery<DiagnosticTest[]>({
    queryKey: ["diagnostic-center", "global-tests"],
    queryFn: async () => {
      const res = await api.get("/diagnostic-centers/global-tests");
      return res.data.data.tests;
    },
  });
}

// ল্যাবের নিজস্ব টেস্ট লিস্ট ফেচ করার জন্য
export function useCenterTests() {
  return useQuery<CenterTest[]>({
    queryKey: ["diagnostic-center", "center-tests"],
    queryFn: async () => {
      const res = await api.get("/diagnostic-centers/tests");
      return res.data.data.tests;
    },
  });
}

// ল্যাবে নতুন টেস্ট অ্যাড করার জন্য
export function useAddCenterTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: AddCenterTestInput) => {
      const res = await api.post("/diagnostic-centers/tests", payload);
      return res.data.data.test;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["diagnostic-center", "center-tests"] });
    },
  });
}

// ল্যাবের টেস্টের দাম বা স্ট্যাটাস আপডেট করার জন্য
export function useUpdateCenterTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ testId, payload }: { testId: string; payload: UpdateCenterTestInput }) => {
      const res = await api.patch(`/diagnostic-centers/tests/${testId}`, payload);
      return res.data.data.test;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["diagnostic-center", "center-tests"] });
    },
  });
}

// ল্যাব থেকে টেস্ট রিমুভ করার জন্য
export function useRemoveCenterTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (testId: string) => {
      const res = await api.delete(`/diagnostic-centers/tests/${testId}`);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["diagnostic-center", "center-tests"] });
    },
  });
}

export function usePublicCenterDetails(centerId: string) {
  return useQuery({
    queryKey: ["public-center", centerId],
    queryFn: async () => {
      const res = await api.get(`/diagnostic-centers/public/${centerId}`);
      return res.data.data; // এটি { center, tests } রিটার্ন করবে
    },
    enabled: !!centerId,
  });
}

// সব অ্যাপ্রুভড ল্যাব ফেচ করার জন্য
export function useAllDiagnosticCenters() {
  return useQuery({
    queryKey: ["diagnostic-centers", "all"],
    queryFn: async () => {
      const res = await api.get("/diagnostic-centers/all");
      return res.data.data.centers; 
    },
  });
}

// ============================================================
// 5. Working Hours Hooks (Lab Manager)
// ============================================================
export function useCenterWorkingHours() {
  return useQuery({
    queryKey: ["diagnostic-center", "working-hours"],
    queryFn: async () => {
      const res = await api.get("/diagnostic-centers/working-hours");
      return res.data.data.hours;
    },
  });
}

export function useUpdateCenterWorkingHours() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (hoursData: any[]) => {
      const res = await api.put("/diagnostic-centers/working-hours", { hours: hoursData });
      return res.data.data.hours;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["diagnostic-center", "working-hours"] });
      qc.invalidateQueries({ queryKey: ["diagnostic-center", "profile"] });
      qc.invalidateQueries({ queryKey: ["diagnostic-centers", "all"] });
      qc.invalidateQueries({ queryKey: ["public-center"] });
    },
  });
}

// ============================================================
// 6. Admin Global Test Hooks (Super Admin)
// ============================================================
export function useAdminAddGlobalTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; description?: string; isActive: boolean }) => {
      const res = await api.post("/diagnostic-centers/admin/global-tests", payload);
      return res.data.data.test;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["diagnostic-center", "global-tests"] }),
  });
}

export function useAdminUpdateGlobalTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      const res = await api.patch(`/diagnostic-centers/admin/global-tests/${id}`, payload);
      return res.data.data.test;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["diagnostic-center", "global-tests"] }),
  });
}

export function useAdminDeleteGlobalTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/diagnostic-centers/admin/global-tests/${id}`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["diagnostic-center", "global-tests"] }),
  });
}