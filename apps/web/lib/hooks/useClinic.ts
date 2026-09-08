import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type DayOfWeek =
  | "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";

export type Clinic = {
  id: string;
  clinicName: string;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  logo: string | null;
  isApproved: boolean;
  onlineConsultationEnabled: boolean;
};

export type ClinicDoctor = {
  id: string;
  specialization: string | null;
  qualification: string | null;
  experience: number | null;
  fee: number | null;
  startTime: string | null;
  queueMode: "LIVE" | "PRIVATE" | "TIME_SLOT";
  user: { id: string; name: string; email: string; phone: string | null; isActive: boolean };
};

export type ClinicReceptionist = {
  id: string;
  user: { id: string; name: string; email: string; phone: string | null; isActive: boolean };
  assignedDoctors: { doctor: { user: { name: string } } }[];
};

export type WorkingHour = {
  dayOfWeek: DayOfWeek;
  isClosed: boolean;
  openTime: string | null;
  closeTime: string | null;
};

export type ClinicHoliday = { id: string; date: string; reason: string | null };

export type SentDoctorRequest = {
  id: string;
  status: string;
  dayOfWeek?: DayOfWeek;
  startTime?: string;
  endTime?: string;
  doctor?: { user?: { name: string } };
};

// ---------------- Profile ----------------

export function useClinicProfile() {
  return useQuery<Clinic>({
    queryKey: ["clinic", "profile"],
    queryFn: async () => (await api.get("/clinic/profile")).data.data.clinic,
  });
}

export function useUpdateClinicProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      clinicName: string;
      address?: string;
      city?: string;
      state?: string;
      pincode?: string;
    }) => (await api.patch("/clinic/profile", payload)).data.data.clinic,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clinic", "profile"] }),
  });
}

export function useUploadClinicLogo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append("photo", file);
      return (
        await api.post("/clinic/logo", form, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      ).data.data.clinic;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clinic", "profile"] }),
  });
}

export function useToggleOnlineConsultation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (enabled: boolean) =>
      (await api.patch("/clinic/online-consultation", { enabled })).data.data.clinic,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clinic", "profile"] }),
  });
}

// ON/OFF switch for automatic follow-up after 1 month with no visit.
export function useToggleAutoFollowup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (enabled: boolean) =>
      (await api.patch("/clinic/auto-followup", { enabled })).data.data.clinic,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clinic", "profile"] }),
  });
}

// ---------------- Doctors ----------------

export function useClinicDoctors() {
  return useQuery<ClinicDoctor[]>({
    queryKey: ["clinic", "doctors"],
    queryFn: async () => (await api.get("/clinic/doctors")).data.data.doctors,
  });
}

export function useAddDoctor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      name: string;
      email: string;
      password: string;
      phone?: string;
      specialization?: string;
      qualification?: string;
      experience?: number;
      fee?: number;
      startTime?: string;
    }) => (await api.post("/clinic/doctors", payload)).data.data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clinic", "doctors"] }),
  });
}

export function useEditDoctor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      doctorId,
      ...payload
    }: {
      doctorId: string;
      startTime?: string;
      specialization?: string;
      qualification?: string;
      experience?: number;
      fee?: number;
      queueMode?: "LIVE" | "PRIVATE" | "TIME_SLOT";
    }) => (await api.patch("/clinic/doctors/" + doctorId, payload)).data.data.doctor,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clinic", "doctors"] }),
  });
}

// ---------------- Receptionists ----------------

export function useClinicReceptionists() {
  return useQuery<ClinicReceptionist[]>({
    queryKey: ["clinic", "receptionists"],
    queryFn: async () => (await api.get("/clinic/receptionists")).data.data.receptionists,
  });
}

export function useAddReceptionist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      name: string;
      email: string;
      password: string;
      phone?: string;
    }) => (await api.post("/clinic/receptionists", payload)).data.data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clinic", "receptionists"] }),
  });
}

export function useAssignDoctorsToReceptionist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { receptionistId: string; doctorIds: string[] }) =>
      (await api.post("/clinic/receptionists/assign-doctors", payload)).data.data.assignments,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clinic", "receptionists"] }),
  });
}

export function useChangeStaffPassword() {
  return useMutation({
    mutationFn: async (payload: { userId: string; newPassword: string }) =>
      (await api.patch("/clinic/staff/change-password", payload)).data,
  });
}

// ---------------- Working hours / holidays ----------------

export function useWorkingHours() {
  return useQuery<WorkingHour[]>({
    queryKey: ["clinic", "working-hours"],
    queryFn: async () => (await api.get("/clinic/working-hours")).data.data.workingHours,
  });
}

export function useSetWorkingHours() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (workingHours: WorkingHour[]) =>
      (await api.post("/clinic/working-hours", { workingHours })).data.data.workingHours,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clinic", "working-hours"] }),
  });
}

export function useHolidays() {
  return useQuery<ClinicHoliday[]>({
    queryKey: ["clinic", "holidays"],
    queryFn: async () => (await api.get("/clinic/holidays")).data.data.holidays,
  });
}

export function useAddHoliday() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { date: string; reason?: string }) =>
      (await api.post("/clinic/holidays", payload)).data.data.holiday,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clinic", "holidays"] }),
  });
}

export function useRemoveHoliday() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (holidayId: string) =>
      (await api.delete("/clinic/holidays/" + holidayId)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clinic", "holidays"] }),
  });
}

// ---------------- Doctor connection requests (clinic <-> doctor) ----------------

export function useReceivedDoctorRequests() {
  return useQuery<SentDoctorRequest[]>({
    queryKey: ["clinic", "requests", "received"],
    queryFn: async () => (await api.get("/clinic/requests/received")).data.data.requests,
  });
}

export function useSentDoctorRequests() {
  return useQuery<SentDoctorRequest[]>({
    queryKey: ["clinic", "requests", "sent"],
    queryFn: async () => (await api.get("/doctors/requests/sent")).data.data.requests,
  });
}

export function useSendDoctorRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      doctorId: string;
      dayOfWeek: DayOfWeek;
      startTime: string;
      endTime: string;
      fee?: number;
    }) => (await api.post("/doctors/requests", payload)).data.data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clinic", "requests", "sent"] }),
  });
}

export function useRespondToDoctorRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      associationId,
      action,
    }: {
      associationId: string;
      action: "ACCEPT" | "REJECT";
    }) =>
      (await api.patch("/clinic/requests/" + associationId + "/respond", { action })).data.data
        .association,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clinic", "doctors"] });
      qc.invalidateQueries({ queryKey: ["clinic", "requests"] });
    },
  });
}