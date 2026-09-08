"use client";

import {
  UserCheck,
  CalendarCheck,
  ShieldCheck,
  Headphones,
  HeartHandshake,
} from "lucide-react";

const ITEMS = [
  { icon: UserCheck, label: "Verified Doctors & Clinics" },
  { icon: CalendarCheck, label: "Easy Online Booking" },
  { icon: ShieldCheck, label: "Safe & Secure" },
  { icon: Headphones, label: "24×7 Support" },
  { icon: HeartHandshake, label: "Better Healthcare for All" },
];

export default function TrustBar() {
  return (
    <section className="border-t border-slate-200/80 bg-white py-6 dark:border-soft-300 dark:bg-surface">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 lg:px-8">
        {ITEMS.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-2.5 text-slate-600 transition-colors hover:text-[#1C63E7] dark:text-ink-600 dark:hover:text-[var(--color-primary-text)]"
          >
            <Icon className="h-5 w-5 shrink-0 text-[#1C63E7]" />
            <span className="text-xs sm:text-sm font-semibold tracking-tight">
              {label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
