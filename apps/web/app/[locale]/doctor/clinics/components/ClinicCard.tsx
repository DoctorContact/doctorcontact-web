"use client";

import { Link } from "@/i18n/routing";
import { Building2, MapPin, Calendar, Clock, DollarSign, ListOrdered, ArrowRight } from "lucide-react";
import type { DayOfWeek, DoctorRequestStatus } from "@doctor-contract/shared";
import { ClinicStatusBadge } from "./ClinicStatusBadge";
import { GradientCard } from "@/components/ui/GradientCard";

export interface DerivedClinicAssociation {
  clinicId: string;
  clinicName: string;
  city?: string | null;
  address?: string | null;
  status: DoctorRequestStatus;
  dayOfWeek?: DayOfWeek;
  startTime?: string;
  endTime?: string;
  fee?: number | null;
  requestId: string;
  requestType: "received" | "sent";
}

interface ClinicCardProps {
  clinic: DerivedClinicAssociation;
}

export function ClinicCard({ clinic }: ClinicCardProps) {
  const clinicName = clinic.clinicName || "Medical Clinic";
  const location = [clinic.address, clinic.city].filter(Boolean).join(", ");
  const isAccepted = clinic.status === "APPROVED";
  const cardVariant = isAccepted ? "cyan" : clinic.status === "PENDING" ? "amber" : "slate";

  return (
    <GradientCard variant={cardVariant} className="h-full">
      <div className="flex h-full flex-col justify-between p-5">
        <div>
          {/* Clinic Info Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400 shadow-xs">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {clinicName}
                </h3>
                {location ? (
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{location}</span>
                  </p>
                ) : (
                  <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                    Location not specified
                  </p>
                )}
              </div>
            </div>

            <ClinicStatusBadge status={clinic.status} />
          </div>

          {/* Practice Shift Details Grid */}
          <div className="mt-4 grid grid-cols-1 gap-2.5 rounded-xl bg-slate-50/80 p-3.5 text-xs dark:bg-slate-800/60 sm:grid-cols-3">
            {/* Day of Week */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">
                  Shift Day
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {clinic.dayOfWeek || "Not specified"}
                </span>
              </div>
            </div>

            {/* Timing */}
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">
                  Shift Timing
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {clinic.startTime && clinic.endTime
                    ? `${clinic.startTime} - ${clinic.endTime}`
                    : "Flexible"}
                </span>
              </div>
            </div>

            {/* Consultation Fee */}
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-slate-400" />
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">
                  Consultation Fee
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {clinic.fee !== undefined && clinic.fee !== null
                    ? `₹${clinic.fee}`
                    : "Not specified"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Footers */}
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            ID: {clinic.clinicId.slice(0, 8)}...
          </span>

          {isAccepted ? (
            <div className="flex items-center gap-2">
              <Link
                href="/doctor/queue"
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:scale-105 active:scale-95 transition-all"
              >
                <ListOrdered className="h-3.5 w-3.5" />
                <span>Live Queue</span>
              </Link>
            </div>
          ) : (
            <Link
              href="/doctor/requests"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              <span>Review Request</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>
    </GradientCard>
  );
}
