"use client";

import { useEffect } from "react";
import { usePathname, Link, useRouter } from "@/i18n/routing";
import {
  LayoutDashboard,
  User,
  ChevronRight,
  HeartPulse,
  ShieldCheck,
  CalendarClock,
  FlaskConical,
} from "lucide-react";

import { useAuth } from "@/lib/auth-context";

// ============================================================
// NAVIGATION
// ============================================================

const NAV = [
  {
    href: "/patient",
    label: "Overview",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/patient/follow-ups",
    label: "Follow-ups",
    icon: CalendarClock,
    exact: false,
  },
  {
    href: "/patient/tests",
    label: "My Tests",
    icon: FlaskConical,
    exact: false,
  },
  {
    href: "/patient/profile",
    label: "Profile",
    icon: User,
    exact: false,
  },
];

// ============================================================
// COMPONENT
// ============================================================

export default function PatientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  const router = useRouter();
  const pathname = usePathname();

  // ============================================================
  // AUTH GUARD
  // ============================================================

  useEffect(() => {
    if (
      !loading &&
      (!user || user.role !== "PATIENT")
    ) {
      router.push("/login");
    }
  }, [loading, user, router]);

  // ============================================================
  // LOADING
  // ============================================================

  if (
    loading ||
    !user ||
    user.role !== "PATIENT"
  ) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[var(--color-bg)] px-5">
        <div className="flex flex-col items-center gap-3">

          <div className="relative flex h-11 w-11 items-center justify-center">

            <div className="absolute inset-0 animate-ping rounded-full bg-[#14B8A6]/15" />

            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#252a67] to-[#14B8A6] shadow-md">
              <HeartPulse className="h-5 w-5 text-white" />
            </div>

          </div>

          <p className="text-sm font-medium text-gray-500 dark:text-ink-500">
            Loading your dashboard...
          </p>

        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">

      {/* ======================================================
          DESKTOP LAYOUT
          ====================================================== */}

      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-5 sm:px-5 sm:py-6 lg:gap-8 lg:px-8 lg:py-8">

        {/* ====================================================
            DESKTOP SIDEBAR
            ==================================================== */}

        <aside className="hidden w-60 shrink-0 md:block lg:w-64">

          <div className="sticky top-24">

            <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_8px_30px_-18px_rgba(37,42,103,0.35)] dark:border-soft-300 dark:bg-surface">

              {/* ==================================================
                  SIDEBAR HEADER
                  ================================================== */}

              <div className="border-b border-gray-100 px-4 py-4 dark:border-soft-300">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#252a67] to-[#14B8A6] shadow-sm">
                    <HeartPulse className="h-5 w-5 text-white" />
                  </div>

                  <div className="min-w-0">

                    <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
                      Patient Portal
                    </p>

                    <p className="mt-0.5 text-[11px] font-medium text-gray-400 dark:text-ink-500">
                      Your healthcare space
                    </p>

                  </div>

                </div>

              </div>

              {/* ==================================================
                  NAVIGATION
                  ================================================== */}

              <nav className="p-3">

                <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-ink-500">
                  My Account
                </p>

                <div className="space-y-1">

                  {NAV.map(
                    ({
                      href,
                      label,
                      icon: Icon,
                      exact,
                    }) => {

                      const active = exact
                        ? pathname === href
                        : pathname.startsWith(href);

                      return (
                        <Link
                          key={href}
                          href={href}
                          className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
                            active
                              ? "bg-gradient-to-r from-[#252a67] to-[#3b4a8f] text-white shadow-[0_7px_18px_-8px_rgba(37,42,103,0.65)]"
                              : "text-gray-600 hover:bg-[#252a67]/[0.055] hover:text-[#252a67] dark:text-ink-600 dark:hover:bg-soft-50 dark:hover:text-white"
                          }`}
                        >

                          {/* Active accent */}

                          {active && (
                            <span className="absolute bottom-2 left-0 top-2 w-0.5 rounded-r-full bg-[#14B8A6]" />
                          )}

                          {/* Icon */}

                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                              active
                                ? "bg-white/12 text-white"
                                : "bg-gray-100 text-gray-500 group-hover:bg-[#252a67]/10 group-hover:text-[#252a67] dark:bg-soft-100 dark:text-ink-500"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </span>

                          <span className="min-w-0 flex-1 truncate">
                            {label}
                          </span>

                          <ChevronRight
                            className={`h-4 w-4 shrink-0 transition-all ${
                              active
                                ? "translate-x-0 text-white/80"
                                : "-translate-x-1 text-gray-300 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                            }`}
                          />

                        </Link>
                      );
                    }
                  )}

                </div>

              </nav>

              {/* ==================================================
                  TRUST FOOTER
                  ================================================== */}

              <div className="mx-3 mb-3 rounded-xl border border-[#14B8A6]/10 bg-gradient-to-r from-[#14B8A6]/[0.055] to-[#252a67]/[0.035] px-3 py-3">

                <div className="flex items-center gap-2">

                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-surface">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#14B8A6]" />
                  </div>

                  <div className="min-w-0">

                    <p className="text-[10px] font-bold text-gray-700 dark:text-ink-600">
                      Secure Patient Portal
                    </p>

                    <p className="mt-0.5 truncate text-[9px] text-gray-400 dark:text-ink-500">
                      Your information stays protected
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </aside>

        {/* ====================================================
            MAIN CONTENT
            ==================================================== */}

        <main className="min-w-0 flex-1 pb-28 md:pb-0">
          {children}
        </main>

      </div>

      {/* ======================================================
          MOBILE BOTTOM NAV
          ====================================================== */}

      <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.65rem,env(safe-area-inset-bottom))] md:hidden">

        <nav className="mx-auto flex max-w-md items-center justify-around rounded-2xl border border-gray-200/80 bg-white/95 p-2 shadow-[0_-5px_30px_-12px_rgba(37,42,103,0.28)] backdrop-blur-xl dark:border-soft-300 dark:bg-surface/95">

          {NAV.map(
            ({
              href,
              label,
              icon: Icon,
              exact,
            }) => {

              const active = exact
                ? pathname === href
                : pathname.startsWith(href);

              return (
                <Link
                  key={href}
                  href={href}
                  className={`group relative flex min-w-[90px] flex-1 flex-col items-center justify-center rounded-xl px-3 py-2 transition-all duration-200 ${
                    active
                      ? "bg-gradient-to-br from-[#252a67] to-[#3b4a8f] text-white shadow-[0_6px_15px_-7px_rgba(37,42,103,0.7)]"
                      : "text-gray-400 hover:bg-[#252a67]/[0.045] hover:text-[#252a67] dark:text-ink-500"
                  }`}
                >

                  {/* ==================================================
                      ACTIVE TEAL DOT
                      ================================================== */}

                  {active && (
                    <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#14B8A6] shadow-[0_0_7px_rgba(20,184,166,0.6)]" />
                  )}

                  {/* ==================================================
                      ICON
                      ================================================== */}

                  <span
                    className={`mb-1 flex h-7 w-7 items-center justify-center rounded-lg transition-all ${
                      active
                        ? "bg-white/10"
                        : "bg-transparent"
                    }`}
                  >
                    <Icon
                      className={`h-[17px] w-[17px] ${
                        active
                          ? "text-white"
                          : ""
                      }`}
                    />
                  </span>

                  {/* ==================================================
                      LABEL
                      ================================================== */}

                  <span
                    className={`text-[10px] leading-none ${
                      active
                        ? "font-bold"
                        : "font-semibold"
                    }`}
                  >
                    {label}
                  </span>

                </Link>
              );
            }
          )}

        </nav>

      </div>
    </div>
  );
}