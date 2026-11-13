"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { type Socket } from "socket.io-client";
import { getSocket } from "../lib/socket";
import { useNotificationSocket } from "./notifications/useNotificationSocket";

// 🟢 Context তৈরি করা হলো
type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export default function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketInstance = getSocket();
    setSocket(socketInstance);

    if (!socketInstance.connected) {
      socketInstance.connect();
    }

    const onConnect = () => {
      setIsConnected(true);
      if (process.env.NODE_ENV !== "production") {
        console.log("Connected to WebSocket Server:", socketInstance.id);
      }
    };

    const onDisconnect = () => {
      setIsConnected(false);
      if (process.env.NODE_ENV !== "production") {
        console.log("Disconnected from WebSocket Server");
      }
    };

    socketInstance.on("connect", onConnect);
    socketInstance.on("disconnect", onDisconnect);

    // Initial check in case it connects before listener is attached
    if (socketInstance.connected) {
      setIsConnected(true);
    }

    return () => {
      socketInstance.off("connect", onConnect);
      socketInstance.off("disconnect", onDisconnect);
    };
  }, []);

  // Global real-time notification stream (joins user:<id>, updates the React
  // Query cache on every `newNotification` event). Replaces the old 30s poll.
  useNotificationSocket();

  // 🟢 Provider-এর মাধ্যমে সকেটটাকে পুরো অ্যাপে পাস করা হচ্ছে
  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

// 🟢 এই হুকটাই NotificationBell.tsx ফাইলে ইম্পোর্ট করা হবে!
export const useSocket = () => {
  return useContext(SocketContext);
};