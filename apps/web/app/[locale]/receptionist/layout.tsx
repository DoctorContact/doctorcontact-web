"use client";

import { useEffect } from "react";
import { usePathname, Link, useRouter } from "@/i18n/routing";
import { LayoutDashboard, Stethoscope, Users, LogOut, Loader2, ClipboardList, FlaskConical } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/receptionist/dashboard", label: "Doctors", icon: LayoutDashboard, exact: true },
  { href: "/receptionist/queue", label: "Queue", icon: ClipboardList },
  { href: "/receptionist/patients", label: "Patients", icon: Users },
  { href: "/receptionist/test-recommendations", label: "Test Recs", icon: FlaskConical },
];

function LoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
    </div>
  );
}

export default function ReceptionistLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isReceptionist = user?.role === "RECEPTIONIST";

  useEffect(() => {
    if (!loading && (!user || !isReceptionist)) {
      router.push("/login");
    }
  }, [loading, user, isReceptionist, router]);

  if (loading || !user || !isReceptionist) {
    return <LoadingSpinner />;
  }

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  function isActive(item: NavItem) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[var(--color-bg)]">
      {/* ================= TOP BAR ================= */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white dark:border-soft-300 dark:bg-surface">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white shadow-sm">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-[var(--color-primary-dark-text)]">
                {user.name}
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-ink-400">
                Receptionist
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            aria-label="Logout"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 dark:border-soft-300 dark:text-ink-600 dark:hover:bg-soft-100"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl">
        {/* ================= DESKTOP SIDEBAR ================= */}
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
                      ? "bg-[var(--color-bg-soft)] text-[var(--color-primary-text)]"
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

        {/* ================= CONTENT ================= */}
        {/* Bottom padding on mobile reserves space for the fixed tab bar below. */}
        <main className="min-w-0 flex-1 p-4 pb-24 md:p-6 md:pb-6">{children}</main>
      </div>

      {/* ================= MOBILE BOTTOM TAB BAR ================= */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_10px_rgba(0,0,0,0.04)] md:hidden dark:border-soft-300 dark:bg-surface"
        aria-label="Primary"
      >
        <div className="grid grid-cols-4">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-bold transition ${
                  active
                    ? "text-[var(--color-primary-text)]"
                    : "text-gray-400 dark:text-ink-400"
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