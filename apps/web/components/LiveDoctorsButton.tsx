"use client";

import { Radio } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export default function LiveDoctorsButton({ compact }: { compact?: boolean }) {
  const t = useTranslations("Header");

  return (
    <Link
      href="/doctors?live=true"
      className={
        compact
          ? "flex h-9 w-9 items-center justify-center rounded-lg text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
          : "flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
      }
      aria-label={t("liveDoctors")}
      title={t("liveDoctors")}
    >
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
      </span>
      {!compact && (
        <>
          <Radio className="h-3.5 w-3.5" />
          <span>{t("liveDoctors")}</span>
        </>
      )}
    </Link>
  );
}
