"use client";

import { FlaskConical, Ambulance, Check, Phone } from "lucide-react";
import { Link } from "@/i18n/routing";

const LAB_POINTS = [
  "Wide range of tests",
  "Accurate & reliable reports",
  "Home sample collection",
];

const AMB_POINTS = [
  "24×7 ambulance service",
  "Trained medical staff",
  "Fast & safe transportation",
];

export default function LabsAmbulance() {
  return (
    <section id="labs" className="mx-auto max-w-7xl px-5 py-6 lg:px-8">
      <div className="grid gap-5 lg:grid-cols-2">
        {/* ================= LABS CARD ================= */}
        <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#E9D5FF] bg-[#FAF5FF]/90 p-6 shadow-sm transition-all duration-300 hover:shadow-md dark:border-soft-300 dark:bg-surface sm:flex-row sm:items-center">
          <div className="z-10 max-w-sm">
            {/* Header with Beaker Icon */}
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-[#7C3AED] shadow-sm">
                <FlaskConical className="h-6 w-6" />
              </span>
              <div>
                <h3 className="text-xl font-extrabold text-[#7C3AED] dark:text-ink-900">
                  Labs
                </h3>
                <p className="mt-0.5 text-xs text-slate-600 dark:text-ink-600">
                  Book lab tests at home or visit nearby labs
                </p>
              </div>
            </div>

            {/* Checklist */}
            <ul className="mt-4 space-y-2">
              {LAB_POINTS.map((point) => (
                <li
                  key={point}
                  className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-ink-700"
                >
                  <Check className="h-3.5 w-3.5 shrink-0 text-[#7C3AED]" strokeWidth={2.5} />
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <div className="mt-6">
              <Link
                href="/clinics"
                className="inline-block rounded-xl bg-[#7C3AED] px-5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#6D28D9]"
              >
                Book Test
              </Link>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative mt-4 sm:mt-0 h-36 w-full sm:w-44 shrink-0 overflow-hidden rounded-xl border border-white/80 bg-white shadow-sm">
            <img
              src="/assets/home/labs-tubes.jpg"
              alt="Medical Lab Testing"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* ================= AMBULANCE CARD ================= */}
        <div
          id="ambulance"
          className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#FECDD3] bg-[#FFF1F2]/90 p-6 shadow-sm transition-all duration-300 hover:shadow-md dark:border-soft-300 dark:bg-surface sm:flex-row sm:items-center"
        >
          <div className="z-10 max-w-sm">
            {/* Header with Ambulance Icon */}
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-[#DC2626] shadow-sm">
                <Ambulance className="h-6 w-6" />
              </span>
              <div>
                <h3 className="text-xl font-extrabold text-[#DC2626] dark:text-ink-900">
                  Ambulance
                </h3>
                <p className="mt-0.5 text-xs text-slate-600 dark:text-ink-600">
                  Emergency care, anytime, anywhere
                </p>
              </div>
            </div>

            {/* Checklist */}
            <ul className="mt-4 space-y-2">
              {AMB_POINTS.map((point) => (
                <li
                  key={point}
                  className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-ink-700"
                >
                  <Check className="h-3.5 w-3.5 shrink-0 text-[#DC2626]" strokeWidth={2.5} />
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <div className="mt-6">
              <a
                href="tel:102"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#DC2626] px-5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#B91C1C]"
              >
                <Phone className="h-3.5 w-3.5" />
                <span>Call Now</span>
              </a>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative mt-4 sm:mt-0 h-36 w-full sm:w-44 shrink-0 overflow-hidden rounded-xl border border-white/80 bg-white shadow-sm">
            <img
              src="/assets/home/ambulance.jpg"
              alt="Emergency Ambulance"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
