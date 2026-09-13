"use client";

import { useState, useMemo, useEffect } from "react";
import {
  useDoctorReceivedRequests,
  useDoctorSentRequests,
  useDoctorQueue,
} from "@/lib/hooks/useDoctor";
import { useDoctorSchedules } from "@/lib/hooks/useDoctorSearch";
import { useAuth } from "@/lib/auth-context";
import { QueueHeader } from "./components/QueueHeader";
import { QueueStatusCard } from "./components/QueueStatusCard";
import { CurrentPatientCard } from "./components/CurrentPatientCard";
import { QueueActions } from "./components/QueueActions";
import { QuickQueueControl } from "./components/QuickQueueControl";
import { DelayQuickNotify } from "./components/DelayQuickNotify";
import { SessionSelector } from "./components/SessionSelector";
import { QueueList } from "./components/QueueList";
import { QueueSkeleton } from "./components/QueueSkeleton";
import { QueueError } from "./components/QueueError";
import { Building2 } from "lucide-react";

export default function DoctorQueuePage() {
  const { user } = useAuth();

  // Today's date default in YYYY-MM-DD
  const todayDate = useMemo(() => new Date().toISOString().split("T")[0], []);
  const [selectedDate, setSelectedDate] = useState<string>(todayDate);
  const [selectedClinicId, setSelectedClinicId] = useState<string>("");

  // Fetch Doctor clinic requests to determine active associations
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

  // Extract unique accepted clinic associations
  const clinicsInfo = useMemo(() => {
    const accepted = [
      ...(receivedRequests || []),
      ...(sentRequests || []),
    ].filter((r) => r.status === "ACCEPTED");

    const map = new Map<
      string,
      { id: string; name: string; address?: string | null; doctorId: string }
    >();

    accepted.forEach((req) => {
      const cId = req.clinicId || req.clinic?.id;
      const dId = req.doctorId || req.doctor?.id || user?.id || "";
      if (cId && !map.has(cId)) {
        map.set(cId, {
          id: cId,
          name: req.clinic?.clinicName || "Clinic",
          address: req.clinic?.address || req.clinic?.city || null,
          doctorId: dId,
        });
      }
    });

    return Array.from(map.values());
  }, [receivedRequests, sentRequests, user?.id]);

  // Set default clinic selection when clinics load
  useEffect(() => {
    if (clinicsInfo.length > 0 && !selectedClinicId) {
      setSelectedClinicId(clinicsInfo[0].id);
    }
  }, [clinicsInfo, selectedClinicId]);

  // Get active clinic object & doctorId
  const activeClinic = clinicsInfo.find((c) => c.id === selectedClinicId);
  const doctorId = activeClinic?.doctorId || "";

  // A doctor can run more than one session/day at the same clinic (e.g.
  // morning + evening) — the queue is scoped per session, so we need to
  // know WHICH session before we can even ask the backend for its queue.
  const { data: schedules, isLoading: loadingSchedules } = useDoctorSchedules(doctorId || undefined, selectedClinicId || undefined);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>("");

  useEffect(() => {
    const active = (schedules ?? []).filter((s) => s.isActive);
    // Auto-pick the only session, or the first one, whenever the clinic
    // changes and nothing valid is currently selected.
    if (active.length > 0 && !active.some((s) => s.id === selectedScheduleId)) {
      setSelectedScheduleId(active[0].id);
    }
    if (active.length === 0) {
      setSelectedScheduleId("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedules, selectedClinicId]);

  // Fetch live queue data using existing hook
  const {
    data: queue,
    isLoading: loadingQueue,
    isFetching: fetchingQueue,
    isError: isErrorQueue,
    error: queueError,
    refetch: refetchQueue,
  } = useDoctorQueue(doctorId, selectedClinicId, selectedDate, selectedScheduleId);

  const isRequestsLoading = loadingReceived || loadingSent;

  // Initial loading state
  if (isRequestsLoading || (Boolean(selectedClinicId) && (loadingSchedules || loadingQueue))) {
    return <QueueSkeleton />;
  }

  // Empty state: No associated clinics
  if (clinicsInfo.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-12 text-center shadow-xs transition-colors dark:border-slate-800 dark:bg-slate-900">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
          <Building2 className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
          No associated clinics found
        </h2>
        <p className="mt-1 max-w-md text-xs text-slate-500 dark:text-slate-400">
          You do not currently have any active clinic associations. Accept a clinic connection request under Requests or search for a clinic under Clinics to begin managing live patient queues.
        </p>
      </div>
    );
  }

  // Error loading clinic requests
  if (isErrorReceived && isErrorSent) {
    return (
      <QueueError
        onRetry={() => {
          refetchReceived();
          refetchSent();
        }}
        message="Unable to load associated clinics for your doctor account."
      />
    );
  }

  // Error loading queue data
  if (isErrorQueue) {
    const errorMsg = queueError instanceof Error ? queueError.message : undefined;
    return <QueueError onRetry={() => refetchQueue()} message={errorMsg} />;
  }

  // No session defined for this clinic yet — nothing to show a queue for.
  if (selectedClinicId && !selectedScheduleId) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-12 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
          <Building2 className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
          No session set up at this clinic
        </h2>
        <p className="mt-1 max-w-md text-xs text-slate-500 dark:text-slate-400">
          Add a session (e.g. 10 AM – 2 PM) under Schedule before you can manage a live queue here.
        </p>
      </div>
    );
  }

  const currentPatientToken = queue?.tokens?.find(
    (t) => t.token === queue.currentToken
  );

  const waitingTokens = (queue?.tokens ?? []).filter(
    (t) => t.status === "WAITING" || t.status === "CHECKED_IN"
  );

  return (
    <div className="space-y-6">
      {/* 1. Queue Header & Selectors */}
      <QueueHeader
        clinics={clinicsInfo}
        selectedClinicId={selectedClinicId}
        onClinicChange={setSelectedClinicId}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        status={queue?.status}
        isFetching={fetchingQueue}
        onRefresh={() => refetchQueue()}
      />

      {/* Session picker — only renders if this doctor has more than one
          session at this clinic */}
      <SessionSelector
        schedules={schedules ?? []}
        selectedScheduleId={selectedScheduleId}
        onSelect={setSelectedScheduleId}
      />

      {/* Big, simple Next/Previous — the everyday control */}
      <QuickQueueControl
        doctorId={doctorId}
        clinicId={selectedClinicId}
        date={selectedDate}
        scheduleId={selectedScheduleId}
        currentToken={queue?.currentToken}
        lastTokenIssued={queue?.lastTokenIssued}
        queueStatus={queue?.status}
      />

      {/* One-tap "running late" notification to everyone waiting */}
      <DelayQuickNotify doctorId={doctorId} clinicId={selectedClinicId} />

      {/* 2. Key Operational Metric Cards */}
      <QueueStatusCard queue={queue} />

      {/* 3. Current Patient & Control Actions Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 flex flex-col">
          <CurrentPatientCard
            currentPatientToken={currentPatientToken}
            currentTokenNumber={queue?.currentToken}
            nextPatientToken={waitingTokens[0]}
          />
        </div>
        <div className="lg:col-span-2 flex flex-col">
          <QueueActions
            doctorId={doctorId}
            clinicId={selectedClinicId}
            date={selectedDate}
            scheduleId={selectedScheduleId}
            queueStatus={queue?.status}
            waitingTokens={waitingTokens}
          />
        </div>
      </div>

      {/* 4. Complete Patient Queue Table */}
      <QueueList tokens={queue?.tokens} currentTokenNumber={queue?.currentToken} />
    </div>
  );
}
