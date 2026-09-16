"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, CheckCircle2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { AppNotification } from "@doctor-contract/shared";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // 🟢 Dummy queryFn এবং enabled: false যোগ করা হলো
  const { data: notifications = [] } = useQuery<AppNotification[]>({
    queryKey: ["notifications", "me"],
    queryFn: () => [], // ডামি ফাংশন
    enabled: false,    // নিজে থেকে ফেচ করবে না, সকেটের ভরসায় থাকবে
  });

  const { data: unreadCount = 0 } = useQuery<number>({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => 0, // ডামি ফাংশন
    enabled: false,   // নিজে থেকে ফেচ করবে না
  });

  // স্ক্রিনের বাইরে কোথাও ক্লিক/টাচ করলে বক্স বন্ধ হওয়ার লজিক
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // নোটিফিকেশন ক্লিয়ার করার ফাংশন
  const markAsRead = () => {
    queryClient.setQueryData(["notifications", "unread-count"], 0);
  };

  return (
    <div className="relative" ref={bellRef}>
      {/* 🔔 বেল আইকন এবং আনরিড ব্যাজ */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && unreadCount > 0) markAsRead();
        }}
        className="relative flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-600 transition hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900" />
        )}
      </button>

      {/* ড্রপডাউন বক্স */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-2xl border border-slate-100 bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none dark:border-slate-700 dark:bg-slate-800 animate-in fade-in zoom-in-95 duration-200 z-50">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-700">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h3>
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              {notifications.length} New
            </span>
          </div>

          {/* Scrollable Body */}
          <div className="max-h-[350px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
            {notifications.length > 0 ? (
              <div className="space-y-1">
                {notifications.map((notification, idx) => (
                  <div
                    key={notification.id || idx}
                    className="flex items-start gap-3 rounded-xl p-3 transition hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {notification.title}
                      </p>
                      {notification.message && (
                        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                          {notification.message}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="mb-2 h-8 w-8 text-slate-200 dark:text-slate-600" />
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  You have no new notifications.
                </p>
              </div>
            )}
          </div>
          
        </div>
      )}
    </div>
  );
}