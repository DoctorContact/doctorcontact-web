"use client";

import { useEffect, useMemo } from "react";
import { usePathname, Link, useRouter } from "@/i18n/routing";
import {
  LayoutDashboard,
  Building2,
  Users,
  Inbox,
  ChevronRight,
  FlaskConical,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useTranslations } from "next-intl";

const ALL_NAV = [
  {
    href: "/diagnosticCenter/dashboard",
    key: "dashboard",
    icon: LayoutDashboard,
    exact: true,
    ownerOnly: true,
  },
  {
    href: "/diagnosticCenter/profile",
    key: "profile",
    icon: Building2,
    ownerOnly: true,
  },
  {
    href: "/diagnosticCenter/staff",
    key: "staff",
    icon: Users,
    ownerOnly: true,
  },
  {
    href: "/diagnosticCenter/referrals",
    key: "referrals",
    icon: Inbox,
    ownerOnly: false,
  },
];

export default function DiagnosticCenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tNav = useTranslations("DiagnosticCenterNav");
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isStaff = user?.role === "DIAGNOSTIC_STAFF";
  const isOwner = user?.role === "DIAGNOSTIC_CENTER";
  const isAuthorized = isOwner || isStaff;

  useEffect(() => {
    if (!loading) {
      if (!user || !isAuthorized) {
        router.push("/login");
      } else if (isStaff) {
        // Diagnostic staff have their own dedicated portal.
        router.push("/diagnosticStaff/dashboard");
      }
    }
  }, [loading, user, isAuthorized, isStaff, router]);

  const visibleNav = useMemo(() => {
    if (isStaff) {
      return ALL_NAV.filter((item) => !item.ownerOnly);
    }
    return ALL_NAV;
  }, [isStaff]);

  if (loading || !user || !isAuthorized) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div
            className="
              h-7 w-7 animate-spin rounded-full
              border-[2.5px]
              border-blue-600
              border-t-transparent
            "
          />
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1440px] items-start gap-6 px-4 py-6 md:px-6 lg:px-8">
      {/* =====================================================
          DESKTOP SIDEBAR
      ====================================================== */}
      <aside className="hidden w-60 shrink-0 md:block">
        <div className="sticky top-20 space-y-3">
          {/* Sidebar Header / Brand Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs transition-colors dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
                <FlaskConical className="h-4.5 w-4.5" />
              </div>

              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {tNav("portalTitle")}
                </span>
                <p className="truncate text-xs font-bold text-slate-900 dark:text-slate-100">
                  {user.name || "Diagnostic Center"}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="rounded-xl border border-slate-200 bg-white p-1.5 shadow-xs transition-colors dark:border-slate-800 dark:bg-slate-900">
            <div className="space-y-0.5">
              {visibleNav.map(({ href, key, icon: Icon, exact }) => {
                const active = exact
                  ? pathname === href
                  : pathname.startsWith(href);

                return (
                  <Link
                    key={href}
                    href={href}
                    className={
                      active
                        ? "group flex items-center gap-3 rounded-lg bg-blue-600 px-3 py-2.5 text-xs font-semibold text-white shadow-xs transition-all"
                        : "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-200"
                    }
                  >
                    <span
                      className={
                        active
                          ? "flex h-7 w-7 items-center justify-center rounded-md bg-white/15"
                          : "flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 transition-colors group-hover:bg-slate-200/70 dark:bg-slate-800 dark:group-hover:bg-slate-700/60"
                      }
                    >
                      <Icon
                        className={
                          active
                            ? "h-3.5 w-3.5 text-white"
                            : "h-3.5 w-3.5 text-slate-500 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-slate-200"
                        }
                      />
                    </span>

                    <span className="flex-1">{tNav(key)}</span>

                    {active && (
                      <ChevronRight className="h-3.5 w-3.5 text-white/70" />
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </aside>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}
      <main className="min-w-0 flex-1 pb-24 md:pb-6">{children}</main>

      {/* =====================================================
          MOBILE BOTTOM NAVIGATION (SCROLLABLE & TOUCH-FRIENDLY)
      ====================================================== */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 shadow-lg backdrop-blur-md md:hidden dark:border-slate-800 dark:bg-slate-950/95">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          {visibleNav.map(({ href, key, icon: Icon, exact }) => {
            const active = exact
              ? pathname === href
              : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                className={
                  active
                    ? "flex min-w-[64px] shrink-0 flex-col items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold text-blue-600 dark:text-blue-400"
                    : "flex min-w-[64px] shrink-0 flex-col items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-medium text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                }
              >
                <span
                  className={
                    active
                      ? "flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 dark:bg-slate-900"
                      : "flex h-7 w-7 items-center justify-center rounded-lg"
                  }
                >
                  <Icon
                    className={
                      active
                        ? "h-3.5 w-3.5 text-blue-600 dark:text-blue-400"
                        : "h-3.5 w-3.5 text-slate-400 dark:text-slate-500"
                    }
                  />
                </span>

                <span className="max-w-[70px] truncate">{tNav(key)}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
