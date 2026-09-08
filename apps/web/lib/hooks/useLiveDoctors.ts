"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchLiveDoctorsCount } from "@/lib/api";
import { getSocket } from "@/lib/socket";

const LIVE_COUNT_KEY = ["doctors", "live", "count"];

/**
 * Real backend-driven "Live Doctors" count for the header pill.
 *
 * No polling (Rule 5): the count is fetched once, then refreshed only when
 *  - the backend emits `liveDoctorsChanged` (availability / leave / schedule /
 *    delay change), or
 *  - the browser window regains focus (covers the time-boundary case where a
 *    session starts/ends with no DB write).
 */
export function useLiveDoctorsCount() {
  const queryClient = useQueryClient();

  const query = useQuery<number>({
    queryKey: LIVE_COUNT_KEY,
    queryFn: fetchLiveDoctorsCount,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    const socket = getSocket();
    if (!socket.connected) socket.connect();

    const invalidate = () =>
      queryClient.invalidateQueries({ queryKey: LIVE_COUNT_KEY });

    socket.on("liveDoctorsChanged", invalidate);
    return () => {
      socket.off("liveDoctorsChanged", invalidate);
    };
  }, [queryClient]);

  return query;
}
