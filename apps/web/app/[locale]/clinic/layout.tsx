"use client";

import { useEffect, useState } from "react";
import { usePathname, Link, useRouter } from "@/i18n/routing";
import {
  LayoutDashboard,
  Stethoscope,
  Users,
  CalendarClock,
  Inbox,
  FlaskConical,
  BarChart3,
  ChevronRight,
  Building2,
  Menu,
  X,
  Settings,
  UserPlus, // <-- Added new icon here
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useTranslations } from "next-intl";
import type { LucideIcon } from "lucide-react";

// ----------------------------------------------------------------------
// Types & Configuration
// ----------------------------------------------------------------------
interface NavItem {
  href: string;
  key: string;
  icon: LucideIcon;
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  // MAIN MENU (Indices 0, 1, 2, 3)
  { href: "/clinic/dashboard", key: "dashboard", icon: LayoutDashboard, exact: true },
  { href: "/clinic", key: "overview", icon: Building2, exact: true },
  { href: "/clinic/doctors", key: "doctors", icon: Stethoscope },
  { href: "/clinic/receptionists", key: "receptionists", icon: Users },
  
  // MANAGEMENT (Indices 4, 5, 6, 7, 8)
  { href: "/clinic/add-patient", key: "addPatient", icon: UserPlus }, // <-- Placed here
  { href: "/clinic/schedule", key: "schedule", icon: CalendarClock },
  { href: "/clinic/follow-ups", key: "followUps", icon: CalendarClock },
  { href: "/clinic/requests", key: "requests", icon: Inbox },
  { href: "/clinic/referrals", key: "referrals", icon: FlaskConical },
  { href: "/clinic/reports", key: "reports", icon: BarChart3 },
  
  // SYSTEM (Index 9)
  { href: "/clinic/settings", key: "settings", icon: Settings },
];

// ----------------------------------------------------------------------
// Loading Spinner Component
// ----------------------------------------------------------------------
function LoadingSpinner() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="relative">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#1e40af] border-t-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Building2 className="h-5 w-5 text-[#1e40af]" />
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Mobile Floating Menu Button (FAB)
// ----------------------------------------------------------------------
function MobileFabButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#1e3a8a] to-[#3b82f6] text-white shadow-lg shadow-[#1e3a8a]/40 transition-all hover:scale-110 hover:shadow-xl active:scale-95 md:hidden"
      aria-label="Open navigation menu"
    >
      <Menu className="h-6 w-6" />
    </button>
  );
}

// ----------------------------------------------------------------------
// Mobile Drawer Menu Component
// ----------------------------------------------------------------------
function MobileDrawer({
  isOpen,
  onClose,
  pathname,
  tNav,
}: {
  isOpen: boolean;
  onClose: () => void;
  pathname: string;
  tNav: (key: string) => string;
}) {
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity md:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] transform bg-white shadow-2xl transition-transform duration-300 ease-out md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-sm">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Clinic Portal</p>
              <p className="text-xs text-blue-100">{user?.name || "Administrator"}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-white transition-colors hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex h-[calc(100vh-140px)] flex-col overflow-y-auto p-3">
          <div className="space-y-1">
            <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#1e40af]/60">Main Menu</p>
            {NAV_ITEMS.slice(0, 4).map((item) => (
              <DrawerNavItem key={item.href} item={item} pathname={pathname} tNav={tNav} onClose={onClose} />
            ))}

            <p className="px-3 py-2 pt-4 text-[10px] font-bold uppercase tracking-wider text-[#1e40af]/60">Management</p>
            {NAV_ITEMS.slice(4, 9).map((item) => (
              <DrawerNavItem key={item.href} item={item} pathname={pathname} tNav={tNav} onClose={onClose} />
            ))}

            <p className="px-3 py-2 pt-4 text-[10px] font-bold uppercase tracking-wider text-[#1e40af]/60">System</p>
            {NAV_ITEMS.slice(9).map((item) => (
              <DrawerNavItem key={item.href} item={item} pathname={pathname} tNav={tNav} onClose={onClose} />
            ))}
          </div>

          <div className="mt-auto border-t border-slate-200 pt-4">
            <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-[#1e40af]/5 to-transparent p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#1e3a8a] to-[#3b82f6] text-white shadow-md">
                <span className="text-sm font-bold">{user?.name?.charAt(0) || "U"}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">{user?.name || "User"}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ----------------------------------------------------------------------
// Drawer Navigation Item Component
// ----------------------------------------------------------------------
function DrawerNavItem({ item, pathname, tNav, onClose }: { item: NavItem; pathname: string; tNav: (key: string) => string; onClose: () => void }) {
  const { href, key, icon: Icon, exact } = item;
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onClose}
      className={`group flex items-center gap-3 rounded-xl px-3 py-3 transition-all ${
        isActive ? "bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] text-white shadow-md shadow-[#1e3a8a]/30" : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all ${isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"}`}>
        <Icon className="h-4 w-4" />
      </div>
      <span className="flex-1 text-sm font-medium">{tNav(key)}</span>
      {isActive && <ChevronRight className="h-4 w-4 text-white/70" />}
    </Link>
  );
}

// ----------------------------------------------------------------------
// Desktop Sidebar Component
// ----------------------------------------------------------------------
function DesktopSidebar({ pathname, tNav }: { pathname: string; tNav: (key: string) => string }) {
  return (
    <aside className="hidden w-72 shrink-0 md:block">
      <div className="sticky top-20 space-y-6">
        <div className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#1e40af]/30 hover:shadow-[0_18px_45px_rgba(0,0,0,0.09)]">
          <div className="absolute -top-4 -right-4 h-16 w-16 rounded-full bg-[#3b82f6]/5 opacity-50 transition-transform duration-300 group-hover:scale-150" />
          <div className="relative flex items-center gap-3">
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1e3a8a] to-[#3b82f6] text-white shadow-lg shadow-[#1e3a8a]/30">
                <Building2 className="h-5 w-5" />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#059669] ring-2 ring-white">
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
              </span>
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900">Clinic Portal</p>
              <p className="text-[11px] text-slate-500">Professional Dashboard</p>
            </div>
          </div>
        </div>

        <nav className="space-y-1 rounded-3xl border border-slate-200/80 bg-white p-2 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-[#1e40af]/60">Main Menu</p>
          {NAV_ITEMS.slice(0, 4).map((item) => (
            <DesktopNavItem key={item.href} item={item} pathname={pathname} tNav={tNav} />
          ))}

          <p className="px-3 pb-1 pt-3 text-[10px] font-bold uppercase tracking-wider text-[#1e40af]/60">Management</p>
          {NAV_ITEMS.slice(4, 9).map((item) => (
            <DesktopNavItem key={item.href} item={item} pathname={pathname} tNav={tNav} />
          ))}

          <p className="px-3 pb-1 pt-3 text-[10px] font-bold uppercase tracking-wider text-[#1e40af]/60">System</p>
          {NAV_ITEMS.slice(9).map((item) => (
            <DesktopNavItem key={item.href} item={item} pathname={pathname} tNav={tNav} />
          ))}
        </nav>
      </div>
    </aside>
  );
}

// ----------------------------------------------------------------------
// Desktop Nav Item Component
// ----------------------------------------------------------------------
function DesktopNavItem({ item, pathname, tNav }: { item: NavItem; pathname: string; tNav: (key: string) => string }) {
  const { href, key, icon: Icon, exact } = item;
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${
        isActive ? "bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] text-white shadow-md shadow-[#1e3a8a]/30" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      <div className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"}`}>
        <Icon className="h-4 w-4" />
      </div>
      <span className="flex-1 text-sm font-medium">{tNav(key)}</span>
      {isActive && <ChevronRight className="h-4 w-4 text-white/70" />}
    </Link>
  );
}

// ----------------------------------------------------------------------
// Main Layout Component
// ----------------------------------------------------------------------
export default function ClinicDashboardLayout({ children }: { children: React.ReactNode }) {
  const tNav = useTranslations("ClinicNav");
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "CLINIC")) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading || !user || user.role !== "CLINIC") {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-[#3b82f6]/5 dark:from-slate-950 dark:to-slate-900">
      <MobileFabButton onClick={() => setIsMobileMenuOpen(true)} />
      <MobileDrawer isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} pathname={pathname} tNav={tNav} />
      <div className="mx-auto flex w-full max-w-[1440px] items-start gap-6 px-4 py-6 md:px-6 md:py-8 lg:px-8">
        <DesktopSidebar pathname={pathname} tNav={tNav} />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}