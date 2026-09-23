"use client";

import { CheckCircle2, Clock, XCircle } from "lucide-react";
import type { DoctorRequestStatus } from "@doctor-contract/shared";

interface RequestStatusBadgeProps {
  status: DoctorRequestStatus;
}

export function RequestStatusBadge({ status }: RequestStatusBadgeProps) {
  if (status === "APPROVED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-500/30">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Accepted
      </span>
    );
  }

  if (status === "REJECTED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 ring-1 ring-rose-600/20 dark:bg-rose-950/40 dark:text-rose-400 dark:ring-rose-500/30">
        <XCircle className="h-3.5 w-3.5" />
        Rejected
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-400 dark:ring-amber-500/30">
      <Clock className="h-3.5 w-3.5" />
      Pending
    </span>
  );
}
