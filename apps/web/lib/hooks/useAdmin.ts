import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  AdminPlatformStats,
  AdminUserRecord,
  AdminClinicRecord,
  AdminDoctorRecord,
  AdminDiagnosticCenterRecord,
  PlatformSettingsRecord,
  AdminUsersResponse,
  AdminClinicsResponse,
  CreateAdminInput,
  CreateClinicInput,
  CreateDiagnosticCenterInput,
  SetFeaturedDoctorInput,
  SetFeaturedClinicInput,
  ToggleDoctorAvailabilityInput,
  UpdatePlatformSettingsInput,
} from "@doctor-contract/shared";

// ============================================================
// 1. Platform Statistics
// ============================================================

export function useAdminStats() {
  return useQuery<AdminPlatformStats>({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const res = await api.get("/admin/stats");
      return res.data.data.stats;
    },
  });
}

// ============================================================
// 2. User Management & Admin Creation
// ============================================================

export type AdminUsersFilterParams = {
  role?: string;
  page?: number;
  limit?: number;
};

export function useAdminUsers(params: AdminUsersFilterParams = {}) {
  return useQuery<AdminUsersResponse>({
    queryKey: ["admin", "users", params],
    queryFn: async () => {
      const res = await api.get("/admin/users", { params });
      return res.data.data;
    },
  });
}

export function useCreateAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateAdminInput) => {
      const res = await api.post("/admin/admins", payload);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}


export function useToggleUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const res = await api.patch(`/admin/users/${userId}/status`, { isActive });
      return res.data.data.user as AdminUserRecord;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

// ============================================================
// 3. Clinic Management
// ============================================================

export type AdminClinicsFilterParams = {
  isApproved?: boolean;
  page?: number;
  limit?: number;
};

export function useAdminClinics(params: AdminClinicsFilterParams = {}) {
  return useQuery<AdminClinicsResponse>({
    queryKey: ["admin", "clinics", params],
    queryFn: async () => {
      const queryParams: Record<string, unknown> = {};
      if (params.isApproved !== undefined) {
        queryParams.isApproved = params.isApproved;
      }
      if (params.page) queryParams.page = params.page;
      if (params.limit) queryParams.limit = params.limit;

      const res = await api.get("/admin/clinics", { params: queryParams });
      return res.data.data;
    },
  });
}

export function useCreateClinic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateClinicInput) => {
      const res = await api.post("/admin/clinics", payload);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "clinics"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

export function useApproveClinic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (clinicId: string) => {
      const res = await api.patch(`/admin/clinics/${clinicId}/approve`);
      return res.data.data.clinic as AdminClinicRecord;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "clinics"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

export function useRevokeClinic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (clinicId: string) => {
      const res = await api.patch(`/admin/clinics/${clinicId}/revoke`);
      return res.data.data.clinic as AdminClinicRecord;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "clinics"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

// ============================================================
// 3b. Featured Clinics
//
// Matches clinic.routes.js exactly:
//   GET   /clinic/featured          -> currently featured clinics
//   PATCH /clinic/:clinicId/featured (ADMIN, SUPER_ADMIN) -> toggle
// ============================================================

export function useAdminFeaturedClinics() {
  return useQuery<AdminClinicRecord[]>({
    queryKey: ["admin", "clinics", "featured"],
    queryFn: async () => {
      const res = await api.get("/clinic/featured");
      const data = res.data?.data;
      return (data?.clinics ?? data ?? []) as AdminClinicRecord[];
    },
  });
}

export function useSetFeaturedClinic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ clinicId, isFeatured, featuredOrder }: SetFeaturedClinicInput) => {
      const res = await api.patch(`/clinic/${clinicId}/featured`, {
        isFeatured,
        featuredOrder,
      });
      return res.data.data.clinic as AdminClinicRecord;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "clinics", "featured"] });
      qc.invalidateQueries({ queryKey: ["admin", "clinics"] });
      qc.invalidateQueries({ queryKey: ["public", "clinics"] });
    },
  });
}

// ============================================================
// 4. Doctor Verification & Featured Doctors
// ============================================================

export function useUnverifiedDoctors() {
  return useQuery<AdminDoctorRecord[]>({
    queryKey: ["admin", "doctors", "unverified"],
    queryFn: async () => {
      const res = await api.get("/admin/doctors/unverified");
      return res.data.data.doctors;
    },
  });
}

export interface CreateDoctorInput {
  name: string;
  email?: string;
  phone?: string;
  password: string;
  clinicId?: string; // optional — a doctor can be added without a clinic
  specialization?: string;
  qualification?: string;
  experience?: number;
  fee?: number;
}

export function useCreateDoctor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateDoctorInput) => {
      const res = await api.post("/admin/doctors", payload);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "doctors"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

// Global bookings feed (Super Admin only)
export interface AdminBookingsParams {
  clinicId?: string;
  status?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export function useAdminBookings(params: AdminBookingsParams = {}) {
  return useQuery({
    queryKey: ["admin", "bookings", params],
    queryFn: async () => {
      const res = await api.get("/admin/bookings", { params });
      return res.data.data as {
        items: any[];
        total: number;
        page: number;
        limit: number;
      };
    },
  });
}

export function useVerifyDoctor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (doctorId: string) => {
      const res = await api.patch(`/admin/doctors/${doctorId}/verify`);
      return res.data.data.doctor as AdminDoctorRecord;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "doctors", "unverified"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

export function useFeaturedDoctors() {
  return useQuery<AdminDoctorRecord[]>({
    queryKey: ["admin", "doctors", "featured"],
    queryFn: async () => {
      const res = await api.get("/admin/doctors/featured");
      return res.data.data.doctors;
    },
  });
}

export function useSetFeaturedDoctor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ doctorId, isFeatured, featuredOrder }: SetFeaturedDoctorInput) => {
      const res = await api.patch(`/admin/doctors/${doctorId}/featured`, {
        isFeatured,
        featuredOrder,
      });
      return res.data.data.doctor as AdminDoctorRecord;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "doctors", "featured"] });
    },
  });
}

// ============================================================
// 4b. Doctor Availability
//
// Matches doctor.routes.js exactly:
//   PATCH /doctors/:doctorId/available (ADMIN, SUPER_ADMIN, CLINIC, DOCTOR)
// ============================================================

export function useToggleDoctorAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ doctorId, isAvailable }: ToggleDoctorAvailabilityInput) => {
      const res = await api.patch(`/doctors/${doctorId}/available`, {
        isAvailable,
      });
      return res.data.data.doctor as AdminDoctorRecord;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "doctors"] });
      qc.invalidateQueries({ queryKey: ["public", "doctors", "available"] });
    },
  });
}

// ============================================================
// 5. Diagnostic Center Management
// ============================================================

export type AdminDiagnosticCentersFilterParams = {
  isApproved?: boolean;
};

export function useAdminDiagnosticCenters(params: AdminDiagnosticCentersFilterParams = {}) {
  return useQuery<AdminDiagnosticCenterRecord[]>({
    queryKey: ["admin", "diagnostic-centers", params],
    queryFn: async () => {
      const queryParams: Record<string, unknown> = {};
      if (params.isApproved !== undefined) {
        queryParams.isApproved = params.isApproved ? "true" : "false";
      }

      const res = await api.get("/admin/diagnostic-centers", { params: queryParams });
      return res.data.data.centers;
    },
  });
}

export function useCreateDiagnosticCenter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateDiagnosticCenterInput) => {
      const res = await api.post("/admin/diagnostic-centers", payload);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "diagnostic-centers"] });
    },
  });
}

export function useApproveDiagnosticCenter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (centerId: string) => {
      const res = await api.patch(`/admin/diagnostic-centers/${centerId}/approve`);
      return res.data.data.center as AdminDiagnosticCenterRecord;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "diagnostic-centers"] });
    },
  });
}

export function useRevokeDiagnosticCenter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (centerId: string) => {
      const res = await api.patch(`/admin/diagnostic-centers/${centerId}/revoke`);
      return res.data.data.center as AdminDiagnosticCenterRecord;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "diagnostic-centers"] });
    },
  });
}

// ============================================================
// 6. Platform Settings
// ============================================================

export function usePlatformSettings() {
  return useQuery<PlatformSettingsRecord>({
    queryKey: ["admin", "settings"],
    queryFn: async () => {
      const res = await api.get("/admin/settings");
      return res.data.data.settings;
    },
  });
}

export function useUpdatePlatformSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdatePlatformSettingsInput) => {
      const res = await api.patch("/admin/settings", payload);
      return res.data.data.settings as PlatformSettingsRecord;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "settings"] });
    },
  });
}