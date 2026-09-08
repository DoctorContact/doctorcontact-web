import type { ReferralStatus } from "@/lib/hooks/useReferrals";

export const REFERRAL_STATUS_META: Record<
  ReferralStatus,
  { label: string; badge: string; dot: string }
> = {
  PENDING: { label: "Pending", badge: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  IN_PROGRESS: { label: "In progress", badge: "bg-blue-50 text-blue-700", dot: "bg-blue-500" },
  COMPLETED: { label: "Completed", badge: "bg-green-50 text-green-700", dot: "bg-green-500" },
  CANCELLED: { label: "Cancelled", badge: "bg-red-50 text-red-600", dot: "bg-red-500" },
};

export const REFERRAL_STATUS_ORDER: ReferralStatus[] = [
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];
