"use client";

import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  useDoctorReceivedRequests,
  useDoctorSentRequests,
  useDoctorDashboard,
  useDoctorLeaves,
} from "@/lib/hooks/useDoctor";
import type { DoctorLeave } from "@doctor-contract/shared";
import { Building2 } from "lucide-react";

import { ScheduleHeader } from "./components/ScheduleHeader";
import { ClinicSelector } from "./components/ClinicSelector";
import { ConsultationTimeCard } from "./components/ConsultationTimeCard";
import { LeaveCalendar } from "./components/LeaveCalendar";
import { LeaveList } from "./components/LeaveList";
import { MarkLeaveModal } from "./components/MarkLeaveModal";
import { CancelLeaveModal } from "./components/CancelLeaveModal";
import { DelayNotificationCard } from "./components/DelayNotificationCard";
import { ScheduleSkeleton } from "./components/ScheduleSkeleton";
import { ScheduleError } from "./components/ScheduleError";

export default function DoctorSchedulePage() {
  const { user } = useAuth();

  // Date state in YYYY-MM-DD format
  const todayDate = useMemo(() => new Date().toISOString().split("T")[0], []);
  const [selectedDate, setSelectedDate] = useState<string>(todayDate);
  const [selectedClinicId, setSelectedClinicId] = useState<string>("");

  // Modals state
  const [isMarkModalOpen, setIsMarkModalOpen] = useState(false);
  const [markModalInitialDate, setMarkModalInitialDate] = useState<string | undefined>(undefined);
  const [leaveToCancel, setLeaveToCancel] = useState<DoctorLeave | null>(null);

  // 1. Fetch Doctor Requests to resolve active associations
  const {
    data: receivedRequests,
    isLoading: loadingReceived,
    isError: isErrorReceived,
    refetch: refetchReceived,
  } = useDoctorReceivedRequests();

  const {
    data: sentRequests,
    isLoading: loadingSent,
    isError: isErrorSent,
    refetch: refetchSent,
  } = useDoctorSentRequests();

  // 2. Fetch Doctor Dashboard Stats for practice average consultation time
  const {
    data: dashboardStats,
    isLoading: loadingDashboard,
    isError: isErrorDashboard,
    refetch: refetchDashboard,
  } = useDoctorDashboard();

  // Resolve unique accepted clinic associations
  const clinicsInfo = useMemo(() => {
    const accepted = [
      ...(receivedRequests || []),
      ...(sentRequests || []),
    ].filter((r) => r.status === "APPROVED");

    const map = new Map<
      string,
      {
        id: string;
        name: string;
        city?: string | null;
        address?: string | null;
        doctorId: string;
      }
    >();

    accepted.forEach((req) => {
      const cId = req.clinicId || req.clinic?.id;
      const dId = req.doctorId || req.doctor?.id || user?.id || "";
      if (cId && !map.has(cId)) {
        map.set(cId, {
          id: cId,
          name: req.clinic?.clinicName || "Clinic",
          city: req.clinic?.city || null,
          address: req.clinic?.address || null,
          doctorId: dId,
        });
      }
    });

    return Array.from(map.values());
  }, [receivedRequests, sentRequests, user?.id]);

  // Default clinic selection
  useEffect(() => {
    if (clinicsInfo.length > 0) {
      if (!selectedClinicId || !clinicsInfo.some((c) => c.id === selectedClinicId)) {
        setSelectedClinicId(clinicsInfo[0].id);
      }
    }
  }, [clinicsInfo, selectedClinicId]);

  const activeClinic = clinicsInfo.find((c) => c.id === selectedClinicId) || clinicsInfo[0];
  const doctorId = activeClinic?.doctorId || user?.id || "";

  // 3. Fetch Doctor Leaves for the active doctor-clinic association
  const {
    data: leaves = [],
    isLoading: loadingLeaves,
    isFetching: fetchingLeaves,
    isError: isErrorLeaves,
    error: leavesError,
    refetch: refetchLeaves,
  } = useDoctorLeaves(doctorId, selectedClinicId);

  const isInitialLoading =
    loadingReceived ||
    loadingSent ||
    (Boolean(selectedClinicId) && (loadingLeaves || loadingDashboard));

  const isRefreshing = fetchingLeaves;

  const handleRefreshAll = () => {
    refetchReceived();
    refetchSent();
    refetchDashboard();
    if (selectedClinicId) {
      refetchLeaves();
    }
  };

  const handleOpenMarkLeaveModal = (dateToMark?: string) => {
    setMarkModalInitialDate(dateToMark || selectedDate);
    setIsMarkModalOpen(true);
  };

  const handleOpenCancelLeaveModal = (leave: DoctorLeave) => {
    setLeaveToCancel(leave);
  };

  // Initial Loading State
  if (isInitialLoading) {
    return <ScheduleSkeleton />;
  }

  // Empty State: Zero associated clinics
  if (clinicsInfo.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-12 text-center shadow-xs transition-colors dark:border-slate-800 dark:bg-slate-900">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
          <Building2 className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
          No associated clinics found.
        </h2>
        <p className="mt-1 max-w-md text-xs text-slate-500 dark:text-slate-400">
          Connect with a clinic before managing your schedule. Accept a clinic connection request under Requests or search for a clinic under Clinics.
        </p>
      </div>
    );
  }

  // Error State: Requests loading failed
  if (isErrorReceived && isErrorSent) {
    return (
      <ScheduleError
        onRetry={handleRefreshAll}
        message="Unable to load clinic associations. Please check your network connection and try again."
      />
    );
  }

  // Error State: Leaves loading failed
  if (isErrorLeaves) {
    const errorMsg =
      leavesError instanceof Error ? leavesError.message : undefined;
    return <ScheduleError onRetry={() => refetchLeaves()} message={errorMsg} />;
  }

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <ScheduleHeader
        selectedClinic={activeClinic}
        onRefresh={handleRefreshAll}
        isRefreshing={isRefreshing}
      />

      {/* 2. Clinic Selector (Dropdown only when multiple clinics exist) */}
      <ClinicSelector
        clinics={clinicsInfo}
        selectedClinicId={selectedClinicId}
        onClinicChange={setSelectedClinicId}
      />

      {/* 3. Top Row Grid: Consultation Time & Delay Notification */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ConsultationTimeCard
          doctorId={doctorId}
          clinicId={selectedClinicId}
          avgConsultationMinutes={dashboardStats?.avgConsultationMinutes}
          isLoading={loadingDashboard}
        />

        <DelayNotificationCard
          doctorId={doctorId}
          clinicId={selectedClinicId}
          clinicName={activeClinic?.name}
        />
      </div>

      {/* 4. Bottom Row Grid: Leave Calendar & Leave List */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <LeaveCalendar
            leaves={leaves}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onOpenMarkLeaveModal={handleOpenMarkLeaveModal}
          />
        </div>

        <div className="lg:col-span-2">
          <LeaveList
            leaves={leaves}
            onCancelLeave={handleOpenCancelLeaveModal}
            isLoading={loadingLeaves}
          />
        </div>
      </div>

      {/* Modals */}
      <MarkLeaveModal
        isOpen={isMarkModalOpen}
        onClose={() => setIsMarkModalOpen(false)}
        doctorId={doctorId}
        clinicId={selectedClinicId}
        clinicName={activeClinic?.name}
        initialDate={markModalInitialDate}
      />

      <CancelLeaveModal
        isOpen={Boolean(leaveToCancel)}
        onClose={() => setLeaveToCancel(null)}
        leave={leaveToCancel}
        doctorId={doctorId}
        clinicId={selectedClinicId}
        clinicName={activeClinic?.name}
      />
    </div>
  );
}
