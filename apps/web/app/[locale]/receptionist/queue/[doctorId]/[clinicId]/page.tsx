"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Building2 } from "lucide-react";
import { Link } from "@/i18n/routing";

import { useMyAssignedDoctors } from "@/lib/hooks/useReceptionist";
import { useDoctorQueue } from "@/lib/hooks/useDoctor";
import { useDoctorSchedules } from "@/lib/hooks/useDoctorSearch";
import { QueueHeader } from "../../../../doctor/queue/components/QueueHeader";
import { QueueStatusCard } from "../../../../doctor/queue/components/QueueStatusCard";
import { CurrentPatientCard } from "../../../../doctor/queue/components/CurrentPatientCard";
import { QueueActions } from "../../../../doctor/queue/components/QueueActions";
import { QuickQueueControl } from "../../../../doctor/queue/components/QuickQueueControl";
import { DelayQuickNotify } from "../../../../doctor/queue/components/DelayQuickNotify";
import { SessionSelector } from "../../../../doctor/queue/components/SessionSelector";
import { QueueList } from "../../../../doctor/queue/components/QueueList";
import { QueueSkeleton } from "../../../../doctor/queue/components/QueueSkeleton";
import { QueueError } from "../../../../doctor/queue/components/QueueError";

export default function ReceptionistDoctorQueuePage() {
  const params = useParams<{ doctorId: string; clinicId: string }>();
  const doctorId = params.doctorId;
  const clinicId = params.clinicId;

  const todayDate = useMemo(() => new Date().toISOString().split("T")[0], []);
  const [selectedDate, setSelectedDate] = useState<string>(todayDate);

  const { data: doctors, isLoading: loadingDoctors } = useMyAssignedDoctors();
  const doctor = doctors?.find((d) => d.id === doctorId && d.clinic?.id === clinicId);

  // Same fix as the doctor's own queue page: a session (scheduleId) MUST be
  // known before we can ask the backend for a queue — the route is
  // /queue/:doctorId/:clinicId/:date/:scheduleId/... , there's no
  // "just give me the queue" endpoint without it.
  const { data: schedules, isLoading: loadingSchedules } = useDoctorSchedules(doctorId, clinicId);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>("");

  useEffect(() => {
    const active = (schedules ?? []).filter((s) => s.isActive);
    if (active.length > 0 && !active.some((s) => s.id === selectedScheduleId)) {
      setSelectedScheduleId(active[0].id);
    }
    if (active.length === 0) {
      setSelectedScheduleId("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedules]);

  const {
    data: queue,
    isLoading: loadingQueue,
    isFetching: fetchingQueue,
    isError: isErrorQueue,
    error: queueError,
    refetch: refetchQueue,
  } = useDoctorQueue(doctorId, clinicId, selectedDate, selectedScheduleId);

  if (loadingDoctors || loadingSchedules || loadingQueue) {
    return <QueueSkeleton />;
  }

  if (isErrorQueue) {
    const errorMsg = queueError instanceof Error ? queueError.message : undefined;
    return <QueueError onRetry={() => refetchQueue()} message={errorMsg} />;
  }

  if (!selectedScheduleId) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-12 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
          <Building2 className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
          No session set up for this doctor at this clinic
        </h2>
      </div>
    );
  }

  const currentPatientToken = queue?.tokens?.find((t) => t.token === queue.currentToken);
  const waitingTokens = (queue?.tokens ?? []).filter(
    (t) => t.status === "WAITING" || t.status === "CHECKED_IN"
  );

  // Single-entry "clinics" list so QueueHeader's selector just shows this
  // doctor's context — the real doctor switch happens via the back link.
  const clinicOption = [
    {
      id: clinicId,
      name: doctor
        ? `${doctor.user.name}${doctor.clinic?.clinicName ? ` — ${doctor.clinic.clinicName}` : ""}`
        : "Queue",
      address: doctor?.clinic?.address ?? null,
    },
  ];

  return (
    <div className="space-y-6">
      <Link
        href="/receptionist/queue"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[var(--color-primary-text)] dark:text-ink-500"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to doctor list
      </Link>

      <QueueHeader
        clinics={clinicOption}
        selectedClinicId={clinicId}
        onClinicChange={() => {}}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        status={queue?.status}
        isFetching={fetchingQueue}
        onRefresh={() => refetchQueue()}
      />

      <SessionSelector
        schedules={schedules ?? []}
        selectedScheduleId={selectedScheduleId}
        onSelect={setSelectedScheduleId}
      />

      {/* The big, simple Next/Previous control — this is what most
          receptionists will tap dozens of times a day, so it sits right at
          the top and is sized for a phone screen. */}
      <QuickQueueControl
        doctorId={doctorId}
        clinicId={clinicId}
        date={selectedDate}
        scheduleId={selectedScheduleId}
        currentToken={queue?.currentToken}
        lastTokenIssued={queue?.lastTokenIssued}
        queueStatus={queue?.status}
      />

      {/* One-tap "running late" notification to everyone waiting */}
      <DelayQuickNotify doctorId={doctorId} clinicId={clinicId} />

      <QueueStatusCard queue={queue} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col lg:col-span-1">
          <CurrentPatientCard
            currentPatientToken={currentPatientToken}
            currentTokenNumber={queue?.currentToken}
            nextPatientToken={waitingTokens[0]}
          />
        </div>
        <div className="flex flex-col lg:col-span-2">
          <QueueActions
            doctorId={doctorId}
            clinicId={clinicId}
            date={selectedDate}
            scheduleId={selectedScheduleId}
            queueStatus={queue?.status}
            waitingTokens={waitingTokens}
          />
        </div>
      </div>

      <QueueList tokens={queue?.tokens} currentTokenNumber={queue?.currentToken} />
    </div>
  );
}
