import { z } from "zod";

export const updateProfileSchema = z.object({
  dob: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  bloodGroup: z.string().optional(),
  address: z.string().optional(),
  name:z.string().optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
