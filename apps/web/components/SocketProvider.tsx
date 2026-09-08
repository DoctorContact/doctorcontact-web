"use client";

import { useEffect } from "react";
import { getSocket } from "../lib/socket";
import { useNotificationSocket } from "./notifications/useNotificationSocket";

export default function SocketProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const socket = getSocket();

    // Explicitly connect the socket
    if (!socket.connected) {
      socket.connect();
    }

    if (process.env.NODE_ENV !== "production") {
      const onConnect = () => console.log("Connected to WebSocket Server:", socket.id);
      socket.on("connect", onConnect);
      return () => {
        socket.off("connect", onConnect);
      };
    }
  }, []);

  // Global real-time notification stream (joins user:<id>, updates the React
  // Query cache on every `newNotification` event). Replaces the old 30s poll.
  useNotificationSocket();

  return <>{children}</>;
}
