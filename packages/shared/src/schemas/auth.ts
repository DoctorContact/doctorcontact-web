import { z } from "zod";

export const loginSchema = z
  .object({
    email: z.string().email().optional(),
    phone: z.string().optional(),
    password: z.string().min(1, "Password is required"),
  })
  .refine((data) => data.email || data.phone, {
    message: "Email or phone number is required",
    path: ["email"],
  });
export type LoginInput = z.infer<typeof loginSchema>;

// Patients no longer register with email+password — see
// patientPhoneAuthSchema below. registerSchema is kept only for staff
// account creation flows (Admin creates Clinic/Doctor/Receptionist/Admin)
// where email+password still applies.
export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
});
export type RegisterInput = z.infer<typeof registerSchema>;

// Patient login AND signup in one call — idToken comes from Firebase Phone
// Auth on the client after the user confirms the SMS OTP. `name` is only
// required the first time (brand new phone number, no account yet).
export const patientPhoneAuthSchema = z.object({
  idToken: z.string().min(10),
  name: z.string().min(2).optional(),
});
export type PatientPhoneAuthInput = z.infer<typeof patientPhoneAuthSchema>;

// Phone-based password reset for Doctor/Clinic/Receptionist/Admin/Super
// Admin — same idToken pattern, one call instead of send-otp + verify-otp.
export const resetPasswordByPhoneSchema = z.object({
  idToken: z.string().min(10),
  newPassword: z.string().min(6),
});
export type ResetPasswordByPhoneInput = z.infer<typeof resetPasswordByPhoneSchema>;
