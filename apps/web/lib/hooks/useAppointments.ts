import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Appointment, PatientProfile } from "@doctor-contract/shared";
import { api } from "@/lib/api";
import { getSocket } from "@/lib/socket";

export function useMyAppointments() {
  const queryClient = useQueryClient();
  const query = useQuery<Appointment[]>({
    queryKey: ["appointments", "me"],
    queryFn: async () => {
      const { data } = await api.get("/appointments/me");
      return data.data.appointments;
    },
  });

  // Live updates for "patients ahead" / queue position — join the queue
  // room for every doctor+clinic this patient currently has an active
  // (WAITING/CHECKED_IN) appointment with, and refetch this list whenever
  // that queue moves. No polling — purely push-driven.
  const activeRooms = (query.data ?? [])
    .filter((a) => a.status === "WAITING" || a.status === "CHECKED_IN")
    .map((a) => `${a.doctorId}:${a.clinicId}`)
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .join(",");

  useEffect(() => {
    if (!activeRooms) return;

    const socket = getSocket();
    const rooms = activeRooms.split(",").map((r) => {
      const [doctorId, clinicId] = r.split(":");
      return { doctorId, clinicId };
    });

    function joinAll() {
      rooms.forEach((r) => socket.emit("joinQueue", r));
    }

    function refetch() {
      queryClient.invalidateQueries({ queryKey: ["appointments", "me"] });
    }

    if (!socket.connected) {
      socket.connect();
    } else {
      joinAll();
    }

    socket.on("connect", joinAll);
    socket.on("queueUpdate", refetch);
    socket.on("tokenCalled", refetch);
    socket.on("appointmentCompleted", refetch);
    socket.on("doctorDelay", refetch);

    return () => {
      rooms.forEach((r) => socket.emit("leaveQueue", r));
      socket.off("connect", joinAll);
      socket.off("queueUpdate", refetch);
      socket.off("tokenCalled", refetch);
      socket.off("appointmentCompleted", refetch);
      socket.off("doctorDelay", refetch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRooms]);

  return query;
}

export function useMyPatientProfile() {
  return useQuery<PatientProfile>({
    queryKey: ["patient", "me"],
    queryFn: async () => {
      const { data } = await api.get("/patient/me");
      return data.data.patient;
    },
  });
}
