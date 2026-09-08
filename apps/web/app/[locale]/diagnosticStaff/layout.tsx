"use client";

import { useEffect } from "react";
import { usePathname, Link, useRouter } from "@/i18n/routing";
import { LayoutDashboard, FlaskConical, UserRound, LogOut, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/diagnosticStaff/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/diagnosticStaff/tests", label: "Assigned Tests", icon: FlaskConical },
  { href: "/diagnosticStaff/profile", label: "Profile", icon: UserRound },
];

export default function DiagnosticStaffLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isStaff = user?.role === "DIAGNOSTIC_STAFF";

  useEffect(() => {
    if (!loading && (!user || !isStaff)) router.push("/login");
  }, [loading, user, isStaff, router]);

  if (loading || !user || !isStaff) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#1C63E7]" />
      </div>
    );
  }

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[var(--color-bg)]">
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white dark:border-soft-300 dark:bg-surface">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1C63E7] to-[#3b82f6] text-white shadow-sm">
              <FlaskConical className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-[#0F1B33] dark:text-white">{user.name}</p>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Diagnostic Staff</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 dark:border-soft-300 dark:text-ink-600"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl">
        <aside className="sticky top-[57px] hidden h-[calc(100vh-57px)] w-56 shrink-0 border-r border-gray-200 p-4 md:block dark:border-soft-300">
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                    active
                      ? "bg-[#EAF2FF] text-[#1C63E7] dark:bg-surface"
                      : "text-gray-600 hover:bg-gray-50 dark:text-ink-600 dark:hover:bg-soft-100"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 p-4 pb-24 md:p-6 md:pb-6">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden dark:border-soft-300 dark:bg-surface">
        <div className="grid grid-cols-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-bold transition ${
                  active ? "text-[#1C63E7]" : "text-gray-400"
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? "" : "opacity-70"}`} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
