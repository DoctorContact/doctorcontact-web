"use client";

import { Building2, Calendar, Clock, DollarSign, MapPin, Check, X, Ban } from "lucide-react";
import type { DoctorRequest } from "@doctor-contract/shared";
import { RequestStatusBadge } from "./RequestStatusBadge";
import { GradientCard } from "@/components/ui/GradientCard";

interface RequestCardProps {
  request: DoctorRequest;
  type: "received" | "sent";
  onAccept?: (request: DoctorRequest) => void;
  onReject?: (request: DoctorRequest) => void;
  onCancel?: (request: DoctorRequest) => void;
}

export function RequestCard({
  request,
  type,
  onAccept,
  onReject,
  onCancel,
}: RequestCardProps) {
  const clinicName = request.clinic?.clinicName || "Medical Clinic";
  const location = [request.clinic?.address, request.clinic?.city]
    .filter(Boolean)
    .join(", ");

  const formatTime = (time?: string) => {
    if (!time) return "--";
    return time;
  };

  const isPending = request.status === "PENDING";
  
  // 🟢 FIX: Changed "ACCEPTED" to "APPROVED" to match the database Enum
  const cardVariant =
    request.status === "PENDING"
      ? "indigo"
      : request.status === "APPROVED" 
      ? "emerald"
      : request.status === "REJECTED"
      ? "rose"
      : "slate";

  return (
    <GradientCard variant={cardVariant} className="h-full">
      <div className="flex h-full flex-col justify-between p-5">
        <div>
          {/* Top bar: Clinic info & Status badge */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 shadow-xs">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {clinicName}
                </h3>
                {location ? (
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span>{location}</span>
                  </p>
                ) : (
                  <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                    Location not specified
                  </p>
                )}
              </div>
            </div>

            <RequestStatusBadge status={request.status} />
          </div>

          {/* Shift and Practice Info */}
          <div className="mt-4 grid grid-cols-1 gap-2.5 rounded-xl bg-slate-50/80 p-3.5 text-xs dark:bg-slate-800/60 sm:grid-cols-3">
            {/* Day of Week */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">
                  Shift Day
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {request.dayOfWeek || "Not specified"}
                </span>
              </div>
            </div>

            {/* Timing */}
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">
                  Timing
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {request.startTime && request.endTime
                    ? `${formatTime(request.startTime)} - ${formatTime(request.endTime)}`
                    : "Flexible"}
                </span>
              </div>
            </div>

            {/* Fee */}
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-slate-400" />
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">
                  Consultation Fee
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {request.fee !== undefined && request.fee !== null
                    ? `₹${request.fee}`
                    : "--"}
                </span>
              </div>
            </div>
          </div>

          {/* Date Sent / Received metadata */}
          {request.createdAt && (
            <p className="mt-3 text-[11px] font-medium text-slate-400 dark:text-slate-500">
              {type === "received" ? "Invitation received" : "Request sent"} on{" "}
              {new Date(request.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        {isPending && (
          <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
            {type === "received" && (
              <>
                {onReject && (
                  <button
                    type="button"
                    onClick={() => onReject(request)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-rose-600 shadow-xs hover:bg-rose-50 hover:text-rose-700 dark:border-slate-700 dark:bg-slate-800 dark:text-rose-400 dark:hover:bg-rose-950/30 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>Reject</span>
                  </button>
                )}

                {onAccept && (
                  <button
                    type="button"
                    onClick={() => onAccept(request)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:scale-105 active:scale-95 transition-all"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Accept Invitation</span>
                  </button>
                )}
              </>
            )}

            {type === "sent" && onCancel && (
              <button
                type="button"
                onClick={() => onCancel(request)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 transition-colors"
              >
                <Ban className="h-3.5 w-3.5" />
                <span>Cancel Request</span>
              </button>
            )}
          </div>
        )}
      </div>
    </GradientCard>
  );
}