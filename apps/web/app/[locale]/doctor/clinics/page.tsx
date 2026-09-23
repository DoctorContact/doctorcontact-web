"use client";

import { useMemo } from "react";
import {
  useDoctorReceivedRequests,
  useDoctorSentRequests,
} from "@/lib/hooks/useDoctor";

import { ClinicsHeader } from "./components/ClinicsHeader";
import { ClinicStats } from "./components/ClinicStats";
import { ClinicGrid } from "./components/ClinicGrid";
import { ClinicsEmptyState } from "./components/ClinicsEmptyState";
import { ClinicsSkeleton } from "./components/ClinicsSkeleton";
import { ClinicsError } from "./components/ClinicsError";
import type { DerivedClinicAssociation } from "./components/ClinicCard";
import { Clock } from "lucide-react";

export default function DoctorClinicsPage() {
  // Fetch incoming & outgoing requests
  const {
    data: receivedRequests = [],
    isLoading: loadingReceived,
    isFetching: fetchingReceived,
    isError: isErrorReceived,
    error: errorReceived,
    refetch: refetchReceived,
  } = useDoctorReceivedRequests();

  const {
    data: sentRequests = [],
    isLoading: loadingSent,
    isFetching: fetchingSent,
    isError: isErrorSent,
    error: errorSent,
    refetch: refetchSent,
  } = useDoctorSentRequests();

  const isInitialLoading = loadingReceived || loadingSent;
  const isRefreshing = fetchingReceived || fetchingSent;

  // Derive accepted and pending clinic associations
  const { acceptedClinics, pendingClinics, allClinics, citiesCount } =
    useMemo(() => {
      const allRequests = [
        ...receivedRequests.map((r) => ({ ...r, _type: "received" as const })),
        ...sentRequests.map((r) => ({ ...r, _type: "sent" as const })),
      ];

      const acceptedMap = new Map<string, DerivedClinicAssociation>();
      const pendingMap = new Map<string, DerivedClinicAssociation>();
      const citiesSet = new Set<string>();

      allRequests.forEach((req) => {
        const cId = req.clinicId || req.clinic?.id;
        if (!cId) return;

        const city = req.clinic?.city;
        if (city) citiesSet.add(city.trim().toLowerCase());

        const item: DerivedClinicAssociation = {
          clinicId: cId,
          clinicName: req.clinic?.clinicName || "Medical Clinic",
          city: req.clinic?.city,
          address: req.clinic?.address,
          status: req.status,
          dayOfWeek: req.dayOfWeek,
          startTime: req.startTime,
          endTime: req.endTime,
          fee: req.fee,
          requestId: req.id,
          requestType: req._type,
        };

        if (req.status === "APPROVED") {
          if (!acceptedMap.has(cId)) {
            acceptedMap.set(cId, item);
          }
        } else if (req.status === "PENDING") {
          if (!pendingMap.has(cId) && !acceptedMap.has(cId)) {
            pendingMap.set(cId, item);
          }
        }
      });

      const accepted = Array.from(acceptedMap.values());
      const pending = Array.from(pendingMap.values()).filter(
        (p) => !acceptedMap.has(p.clinicId)
      );

      return {
        acceptedClinics: accepted,
        pendingClinics: pending,
        allClinics: [...accepted, ...pending],
        citiesCount: citiesSet.size,
      };
    }, [receivedRequests, sentRequests]);

  const handleRefreshAll = () => {
    refetchReceived();
    refetchSent();
  };

  // Loading State
  if (isInitialLoading) {
    return <ClinicsSkeleton />;
  }

  // Error State
  if (isErrorReceived || isErrorSent) {
    const errorMsg =
      errorReceived instanceof Error
        ? errorReceived.message
        : errorSent instanceof Error
        ? errorSent.message
        : undefined;

    return <ClinicsError onRetry={handleRefreshAll} message={errorMsg} />;
  }

  const pendingRequestsCount =
    receivedRequests.filter((r) => r.status === "PENDING").length +
    sentRequests.filter((r) => r.status === "PENDING").length;

  const acceptedCount =
    receivedRequests.filter((r) => r.status === "APPROVED").length +
    sentRequests.filter((r) => r.status === "APPROVED").length;

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <ClinicsHeader
        activeClinicsCount={acceptedClinics.length}
        isRefreshing={isRefreshing}
        onRefresh={handleRefreshAll}
      />

      {/* 2. Key Operational Metrics */}
      <ClinicStats
        activeClinicsCount={acceptedClinics.length}
        pendingRequestsCount={pendingRequestsCount}
        acceptedCount={acceptedCount}
        connectedCitiesCount={citiesCount}
      />

      {/* 3. Clinics Content Grid / Empty State */}
      {allClinics.length === 0 ? (
        <ClinicsEmptyState />
      ) : (
        <div className="space-y-6">
          {/* Active Associations Section */}
          {acceptedClinics.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Active Associated Clinics ({acceptedClinics.length})
              </h2>
              <ClinicGrid clinics={acceptedClinics} />
            </div>
          )}

          {/* Pending Connection Requests Section */}
          {pendingClinics.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Pending Clinic Requests ({pendingClinics.length})
                </h2>
              </div>
              <ClinicGrid clinics={pendingClinics} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
