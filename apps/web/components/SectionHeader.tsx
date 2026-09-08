"use client";

import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";

export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  viewAllHref,
  viewAllLabel,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
}) {
  return (
    <div className="mb-3.5 sm:mb-4 flex items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#1C63E7] dark:text-[var(--color-primary-text)]">
            {eyebrow}
          </p>
        )}

        <h2 className="text-2xl font-extrabold tracking-tight text-[#0F1B33] md:text-[1.7rem] dark:text-ink-900">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-1 text-sm text-slate-500 dark:text-ink-500">{subtitle}</p>
        )}
      </div>

      {viewAllHref && viewAllLabel && (
        <Link
          href={viewAllHref}
          className="group inline-flex shrink-0 items-center gap-1 text-sm font-bold text-[#1C63E7] transition hover:gap-1.5 dark:text-[var(--color-primary-text)]"
        >
          {viewAllLabel}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
