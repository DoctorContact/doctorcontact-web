// Types mirroring the backend's Prisma models / API response shapes.
// Keep these in sync with backend/prisma/schema.prisma when it changes.

export type Role =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "CLINIC"
  | "RECEPTIONIST"
  | "DOCTOR"
  | "PATIENT"
  | "DIAGNOSTIC_CENTER"
  | "DIAGNOSTIC_STAFF";

export type AuthUser = {
  id: string;
  name: string;
  email: string | null;
  role: Role;
  phone?: string | null;
};

export type Gender = "MALE" | "FEMALE" | "OTHER";

export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export type PatientProfile = {
  id: string;
  userId: string | null;
  dob: string | null;
  age: number | null;
  gender: Gender | null;
  bloodGroup: string | null;
  address: string | null;
};

export type AppointmentStatus =
  | "WAITING"
  | "CHECKED_IN"
  | "ABSENT"
  | "COMPLETED"
  | "CANCELLED";

export type Appointment = {
  id: string;
  token: number;
  date: string;
  status: AppointmentStatus;
  doctorId: string;
  clinicId: string;
  queueMode?: "LIVE" | "PRIVATE";
  patientsAhead?: number;
  estimatedWaitMinutes?: number | null;
  doctor?: { user?: { name: string } };
  clinic?: { clinicName: string };
};

export type DoctorScheduleSlot = {
  id: string;
  clinicId: string;
  startTime: string;
  endTime: string;
  maxPatients: number;
  recurrenceType: "DAILY" | "WEEKLY" | "MONTHLY_DATE" | "MONTHLY_WEEKDAY" | "SPECIFIC_DATE";
  recurrencePattern: Record<string, unknown>;
  isActive: boolean;
  onlineBookingEnabled?: boolean;
};

export type DoctorLiveStatus = {
  isAvailable: boolean;
  isLive: boolean;
  reason: string;
  capacity: { booked: number; max: number } | null;
  operationalStatus?: "NORMAL" | "RUNNING_LATE" | "PAUSED";
  delayMinutes?: number | null;
};

export type Doctor = {
  id: string;
  specialization: string | null;
  qualification: string | null;
  experience: number | null;
  fee: number | null;
  clinicId: string;
  isAvailable?: boolean;
  // Computed by the backend's Live/Available engine on every list/search
  // result. Schedules are deliberately NOT included here (too heavy for a
  // list) — fetch them separately per-doctor-per-clinic when booking.
  liveStatus?: DoctorLiveStatus;
  schedules?: DoctorScheduleSlot[];
  user: { id?: string; name: string; email?: string; phone?: string | null; isActive?: boolean };
  clinic: { id: string; clinicName: string; city: string | null; address: string | null };
};

export type DoctorRequestStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export type DoctorRequest = {
  id: string;
  status: DoctorRequestStatus;
  dayOfWeek?: DayOfWeek;
  startTime?: string;
  endTime?: string;
  fee?: number | null;
  doctorId?: string;
  clinicId?: string;
  doctor?: { id: string; user?: { name: string; email?: string; phone?: string | null } };
  clinic?: { id: string; clinicName: string; city?: string | null; address?: string | null };
  createdAt?: string;
};

export type DoctorLeave = {
  id: string;
  date: string; // YYYY-MM-DD
  reason?: string | null;
  doctorId?: string;
  clinicId?: string;
  createdAt?: string;
};

export type QueueStatus =
  | "WAITING"
  | "CHECKED_IN"
  | "COMPLETED"
  | "CANCELLED"
  | "ABSENT"
  | "PAUSED"
  | "CLOSED";

export type QueueToken = {
  id: string;
  token: number;
  patientName?: string;
  patientAge?: number | null;
  patientGender?: Gender | null;
  status: QueueStatus;
  bookedAt?: string;
};

export type DoctorQueue = {
  doctorId: string;
  clinicId: string;
  date: string;
  currentToken: number;
  lastTokenIssued: number;
  status: string;
  tokens?: QueueToken[];
};

export type DashboardStats = {
  totalAppointmentsToday?: number;
  completedToday?: number;
  waitingToday?: number;
  pendingRequestsCount?: number;
  associatedClinicsCount?: number;
  activeQueueStatus?: string;
  avgConsultationMinutes?: number;
  [key: string]: unknown;
};

export type ClinicSearchResult = {
  id: string;
  clinicName: string;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  logo: string | null;
  isApproved: boolean;
};

export type NotificationType =
  | "APPOINTMENT_BOOKED"
  | "APPOINTMENT_CANCELLED"
  | "CLINIC_APPROVED"
  | "CLINIC_REVOKED"
  | "DOCTOR_VERIFIED"
  | "CONNECTION_REQUEST_RECEIVED"
  | "CONNECTION_REQUEST_RESPONDED"
  | "GENERAL";

export type AppNotification = {
  id: string;
  userId?: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  meta?: Record<string, any> | null;
  createdAt: string;
};

// ============================================================
// PHASE 03A — DOCTOR PORTAL EXPANSION CONTRACT TYPES
// ============================================================

export type DoctorPatientRecord = {
  id: string;
  patientId: string;
  name: string;
  phone: string | null;
  email: string | null;
  age: number | null;
  gender: Gender | null;
  bloodGroup: string | null;
  totalConsultations: number;
  lastConsultationDate: string;
  clinicId: string;
  clinicName: string;
};

export type PrescriptionItem = {
  id: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string | null;
};

export type DoctorPrescription = {
  id: string;
  doctorId: string;
  patientId: string;
  clinicId: string;
  appointmentId?: string | null;
  patientName: string;
  clinicName: string;
  diagnosis: string;
  items: PrescriptionItem[];
  notes?: string | null;
  createdAt: string;
};

export type ClinicEarningsBreakdown = {
  clinicId: string;
  clinicName: string;
  totalCompletedConsultations: number;
  consultationFee: number;
  totalEarnings: number;
};

export type DoctorEarningsSummary = {
  period: "daily" | "weekly" | "monthly" | "yearly" | "custom";
  startDate?: string;
  endDate?: string;
  totalEarnings: number;
  totalConsultations: number;
  clinicBreakdown: ClinicEarningsBreakdown[];
};

export type DoctorSettings = {
  doctorId: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  autoAcceptClinicRequests: boolean;
  defaultConsultationFee: number | null;
  digitalSignatureUrl?: string | null;
};

// ============================================================
// PHASE 04 — ADMIN / SUPER ADMIN CONTRACT TYPES
// ============================================================

export type AdminPlatformStats = {
  totalUsers: number;
  totalClinics: number;
  approvedClinics: number;
  pendingClinics: number;
  totalDoctors: number;
  verifiedDoctors: number;
  unverifiedDoctors: number;
  totalPatients: number;
};

export type AdminUserRecord = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: Role;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt?: string;
};

export type AdminClinicRecord = {
  id: string;
  userId: string;
  clinicName: string;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  isApproved: boolean;
  isFeatured?: boolean;
  featuredOrder?: number;
  latitude?: number | null;
  longitude?: number | null;
  logo?: string | null;
  onlineConsultationEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
    email: string;
    phone: string | null;
    isActive: boolean;
  };
};

export type AdminDoctorRecord = {
  id: string;
  userId: string;
  clinicId: string;
  specialization: string | null;
  qualification: string | null;
  experience: number | null;
  fee: number | null;
  isVerified: boolean;
  isFeatured?: boolean;
  isAvailable?: boolean;
  featuredOrder?: number;
  queueMode?: string;
  startTime?: string | null;
  profilePhoto?: string | null;
  avgConsultationMinutes?: number | null;
  createdAt: string;
  updatedAt?: string;
  user: {
    name: string;
    email?: string;
    phone?: string | null;
  };
  clinic: {
    clinicName: string;
    city?: string | null;
  };
};

export type AdminDiagnosticCenterRecord = {
  id: string;
  userId: string;
  centerName: string;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
    email: string;
    phone: string | null;
    isActive: boolean;
  };
};

export type PlatformSettingsRecord = {
  id: string;
  bookingWindowMinutes: number;
  updatedAt: string;
};

export type AdminStatsResponse = {
  stats: AdminPlatformStats;
};

export type AdminUsersResponse = {
  users: AdminUserRecord[];
  total: number;
  page: number;
  limit: number;
};

export type AdminClinicsResponse = {
  clinics: AdminClinicRecord[];
  total: number;
  page: number;
  limit: number;
};

export type AdminDoctorsUnverifiedResponse = {
  doctors: AdminDoctorRecord[];
};

export type AdminDoctorsFeaturedResponse = {
  doctors: AdminDoctorRecord[];
};

export type AdminDiagnosticCentersResponse = {
  centers: AdminDiagnosticCenterRecord[];
};

export type AdminSettingsResponse = {
  settings: PlatformSettingsRecord;
};

export type CreateAdminInput = {
  name: string;
  email: string;
  password: string;
  phone?: string;
};

export type CreateClinicInput = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  clinicName: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
};

export type CreateDiagnosticCenterInput = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  centerName: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
};
export type SetFeaturedDoctorInput = {
  doctorId: string;
  isFeatured: boolean;
  featuredOrder?: number;
};

export type SetFeaturedClinicInput = {
  clinicId: string;
  isFeatured: boolean;
  featuredOrder?: number;
};

export type ToggleDoctorAvailabilityInput = {
  doctorId: string;
  isAvailable: boolean;
};

export type UpdatePlatformSettingsInput = {
  bookingWindowMinutes: number;
};



// ============================================================
// PHASE 01 — DIAGNOSTIC CENTER PORTAL CONTRACT TYPES
// ============================================================

export type DiagnosticCenter = {
  id: string;
  userId?: string;
  centerName: string;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  logo: string | null;
  isApproved: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type DiagnosticCenterStaff = {
  id: string;
  userId?: string;
  name?: string;
  email?: string;
  phone?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    isActive: boolean;
    createdAt?: string;
  };
};

export type UpdateDiagnosticCenterProfileInput = {
  centerName: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
};

export type CreateDiagnosticCenterStaffInput = {
  name: string;
  email: string;
  password: string;
  phone?: string;
};

export type ChangeDiagnosticCenterStaffPasswordInput = {
  userId: string;
  newPassword: string;
};

// ============================================================
// PHASE 02 — DIAGNOSTIC CENTER INCOMING REFERRALS
// ============================================================

export type DiagnosticCenterIncomingReferral = {
  id: string;
  patientId: string;
  appointmentId?: string | null;
  diagnosticCenterId: string;
  testNames: string[];
  notes?: string | null;
  referringClinicId?: string | null;
  createdByUserId?: string | null;
  createdByRole?: string | null;
  createdAt: string;
  updatedAt?: string;
  patient?: {
    id?: string;
    name?: string;
    address?: string | null;
    phone?: string | null;
    user?: {
      name?: string;
      phone?: string | null;
      email?: string | null;
    } | null;
  } | null;
  referringClinic?: {
    id?: string;
    clinicName?: string;
  } | null;
};

export type AdminReviewRecord = {
  id: string;
  appointmentId: string;
  rating: number;
  comment: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  isReported?: boolean;
  reportReason?: string | null;
  createdAt: string;
  patient?: { name: string } | null;
  doctor?: { user: { name: string } } | null;
  clinic?: { clinicName: string } | null;
};

export type ModerateReviewInput = {
  reviewId: string;
  action: "APPROVE" | "REJECT";
};

export type CreateGuestPatientInput = {
  name: string;
  age: number;
  phone?: string;
  gender?: Gender;
};

export type BookReceptionAppointmentInput = {
  doctorId: string;
  clinicId: string;
  date: string;
  bookingSource?: "RECEPTION" | "WALK_IN" | "PHONE";
  patientId?: string;
  newPatient?: { name: string; age: number; phone?: string };
};

export type PatientSearchResult = {
  id: string;
  userId: string | null;
  user?: { name: string; phone: string | null } | null;
  name?: string;
  phone?: string | null;
  age?: number | null;
};

export type AnnouncementType =
  | "DOCTOR_ABSENT"
  | "CLINIC_CLOSED"
  | "HOLIDAY"
  | "EMERGENCY"
  | "MAINTENANCE"
  | "GENERAL";

export type AdminAnnouncementRecord = {
  id: string;
  type: AnnouncementType;
  title: string;
  message: string;
  isActive: boolean;
  createdAt: string;
  clinicId?: string | null;
  doctorId?: string | null;
};

export type PublishAnnouncementInput = {
  type: AnnouncementType;
  title: string;
  message: string;
};


