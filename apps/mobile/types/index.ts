/**
 * Core domain types for Dewasi Group Mobile.
 * Mirrored faithfully from backend and Web shared contracts.
 */

export type Role =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'CLINIC'
  | 'RECEPTIONIST'
  | 'DOCTOR'
  | 'PATIENT'
  | 'DIAGNOSTIC_CENTER'
  | 'DIAGNOSTIC_STAFF';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string | null;
}

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface PatientProfile {
  id: string;
  userId: string | null;
  dob: string | null;
  age?: number | null;
  gender: Gender | null;
  bloodGroup: string | null;
  address: string | null;
}

export interface UpdateProfileInput {
  dob?: string;
  gender?: Gender;
  bloodGroup?: string;
  address?: string;
}

export type AppointmentStatus =
  | 'WAITING'
  | 'CHECKED_IN'
  | 'ABSENT'
  | 'COMPLETED'
  | 'CANCELLED';

export interface Clinic {
  id: string;
  clinicName: string;
  city?: string | null;
  address?: string | null;
  state?: string | null;
  pincode?: string | null;
  phone?: string | null;
  logo?: string | null;
  isApproved?: boolean;
  onlineConsultationEnabled?: boolean;
}

export interface Doctor {
  id: string;
  specialization: string | null;
  qualification: string | null;
  experience: number | null;
  fee: number | null;
  clinicId: string;
  user: {
    id?: string;
    name: string;
    email?: string;
    phone?: string | null;
    isActive?: boolean;
  };
  clinic: {
    id: string;
    clinicName: string;
    city: string | null;
    address: string | null;
  };
}

export interface Appointment {
  id: string;
  token: number;
  date: string;
  status: AppointmentStatus;
  queueMode?: 'LIVE' | 'PRIVATE';
  patientsAhead?: number;
  estimatedWaitMinutes?: number | null;
  doctor?: { user?: { name: string } };
  clinic?: { clinicName: string };
}

export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export type DoctorRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface DoctorRequest {
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
}

export interface DoctorLeave {
  id: string;
  date: string; // YYYY-MM-DD
  reason?: string | null;
  doctorId?: string;
  clinicId?: string;
  createdAt?: string;
}

export type QueueStatus =
  | 'WAITING'
  | 'CHECKED_IN'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'ABSENT'
  | 'PAUSED'
  | 'CLOSED';

export interface QueueToken {
  id: string;
  token: number;
  patientName?: string;
  patientAge?: number | null;
  patientGender?: Gender | null;
  status: QueueStatus;
  bookedAt?: string;
}

export interface DoctorQueue {
  doctorId: string;
  clinicId: string;
  date: string;
  currentToken: number;
  lastTokenIssued: number;
  status: string;
  tokens?: QueueToken[];
}

export interface DashboardStats {
  totalAppointmentsToday?: number;
  completedToday?: number;
  waitingToday?: number;
  pendingRequestsCount?: number;
  associatedClinicsCount?: number;
  activeQueueStatus?: string;
  avgConsultationMinutes?: number;
  [key: string]: unknown;
}

export interface ClinicSearchResult {
  id: string;
  clinicName: string;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  logo: string | null;
  isApproved: boolean;
}

export interface DoctorPatientRecord {
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
}

export interface PrescriptionItem {
  id?: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string | null;
}

export interface DoctorPrescription {
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
}

export interface ClinicEarningsBreakdown {
  clinicId: string;
  clinicName: string;
  totalCompletedConsultations: number;
  consultationFee: number;
  totalEarnings: number;
}

export interface DoctorEarningsSummary {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  startDate?: string;
  endDate?: string;
  totalEarnings: number;
  totalConsultations: number;
  clinicBreakdown: ClinicEarningsBreakdown[];
}

export interface PatientLookup {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  age: number | null;
  gender: string | null;
  isGuest: boolean;
}

export interface DiagnosticCenterLookup {
  id: string;
  centerName: string;
  city: string | null;
  address: string | null;
  logo: string | null;
}

export interface SentReferral {
  id: string;
  testNames: string[];
  notes: string | null;
  createdAt: string;
  patient: { name: string; phone: string | null; user?: { name: string; phone: string | null } };
  diagnosticCenter: { centerName: string };
}

export type NotificationType =
  | 'APPOINTMENT_BOOKED'
  | 'APPOINTMENT_CANCELLED'
  | 'CLINIC_APPROVED'
  | 'CLINIC_REVOKED'
  | 'DOCTOR_VERIFIED'
  | 'CONNECTION_REQUEST_RECEIVED'
  | 'CONNECTION_REQUEST_RESPONDED'
  | 'GENERAL';

export interface AppNotification {
  id: string;
  userId?: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  meta?: Record<string, any> | null;
  createdAt: string;
}

export interface DoctorSettings {
  doctorId: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  autoAcceptClinicRequests: boolean;
  defaultConsultationFee: number | null;
  digitalSignatureUrl?: string | null;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponseData {
  accessToken: string;
  refreshToken?: string;
  user: AuthUser;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ClinicDoctor {
  id: string;
  specialization: string | null;
  qualification: string | null;
  experience: number | null;
  fee: number | null;
  startTime: string | null;
  queueMode: 'LIVE' | 'PRIVATE' | 'TIME_SLOT';
  user: { id: string; name: string; email: string; phone: string | null; isActive: boolean };
}

export interface ClinicReceptionist {
  id: string;
  user: { id: string; name: string; email: string; phone: string | null; isActive: boolean };
  assignedDoctors: { doctor: { user: { name: string } } }[];
}

export interface WorkingHour {
  dayOfWeek: DayOfWeek;
  isClosed: boolean;
  openTime: string | null;
  closeTime: string | null;
}

export interface ClinicHoliday {
  id: string;
  date: string;
  reason: string | null;
}

export interface SentDoctorRequest {
  id: string;
  status: string;
  dayOfWeek?: DayOfWeek;
  startTime?: string;
  endTime?: string;
  fee?: number;
  doctor?: { id?: string; user?: { name: string; email?: string } };
  clinic?: { id?: string; clinicName?: string; city?: string; address?: string };
}

export interface DailyDashboardQueueItem {
  doctorName: string;
  doctorId?: string;
  currentToken: number;
  lastTokenIssued: number;
  status: string;
}

export interface DailyDashboard {
  clinicName: string;
  date: string;
  totalPatients: number;
  totalAppointments: number;
  newPatients: number;
  returningPatients: number;
  statusBreakdown: Record<string, number>;
  doctorWise: Record<string, { totalAppointments: number; completed: number; waiting: number }>;
  queueSummary: DailyDashboardQueueItem[];
}

export interface PeriodReport {
  clinicName: string;
  date?: string;
  month?: string;
  year?: string | number;
  weekStart?: string;
  weekEnd?: string;
  startDate?: string;
  endDate?: string;
  totalAppointments: number;
  byStatus: Record<string, number>;
  bySource: Record<string, number>;
  byDoctor: Record<string, { totalAppointments: number; completed: number; revenue: number }>;
  estimatedRevenue: number;
}

export interface GrowthTrendPoint {
  period: string;
  newPatients: number;
  returningPatients: number;
  totalPatients: number;
  totalAppointments: number;
  doctorWise: Record<string, number>;
}

export interface GrowthReport {
  clinicName: string;
  granularity: string;
  startDate: string;
  endDate: string;
  trend: GrowthTrendPoint[];
  summary: {
    currentPeriodPatients: number;
    previousPeriodPatients: number;
    growthRatePercent: number;
  };
}

