"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  useMyNotifications,
  useUnreadCount,
  useMarkAllNotificationsRead,
} from "@/lib/hooks/useNotifications";

export default function NotificationBell() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Query cache is kept live by useNotificationSocket (mounted in SocketProvider) —
  // every `newNotification` socket event prepends here and bumps the unread count.
  // No polling.
  const { data: notifications = [] } = useMyNotifications(!!user);
  const { data: unreadCount = 0 } = useUnreadCount();
  const markAllRead = useMarkAllNotificationsRead();

  function toggleOpen() {
    const next = !isOpen;
    setIsOpen(next);
    if (next && unreadCount > 0) {
      markAllRead.mutate();
    }
  }

  return (
    <div className="relative">
      <button
        onClick={toggleOpen}
        className="relative p-2 rounded-full text-slate-600 hover:bg-slate-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 flex min-h-[16px] min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white shadow-lg ring-1 ring-slate-200 z-50">
          <div className="p-4 border-b border-slate-100 font-semibold text-slate-800">
            Notifications
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500">
                No notifications yet.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors"
                >
                  <p className="text-sm font-medium text-slate-800">{notif.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{notif.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
