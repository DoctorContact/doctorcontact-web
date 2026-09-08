"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname, Link, useRouter } from "@/i18n/routing";
import {
  LayoutDashboard,
  Users,
  Building2,
  Stethoscope,
  Sparkles,
  Activity,
  Settings,
  ShieldCheck,
  ChevronRight,
  Menu,
  X,
  Shield,
  CalendarClock,
  Star,
  Megaphone,
  ClipboardList,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import type { LucideIcon } from "lucide-react";
import { GradientCard } from "@/components/ui/GradientCard";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const SUPER_ADMIN_NAV_SECTIONS: NavSection[] = [
  {
    title: "Overview",
    items: [
      {
        href: "/super_admin/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        exact: true, // Dashboard-এর জন্য exact true রাখা জরুরি
      },
    ],
  },
  {
    title: "Medical Ecosystem",
    items: [
      {
        href: "/super_admin/clinics",
        label: "Clinics Directory",
        icon: Building2,
      },
      {
        href: "/super_admin/doctors",
        label: "Doctors Directory",
        icon: Stethoscope,
      },
      {
        href: "/super_admin/diagnostic-centers",
        label: "Diagnostic Centers",
        icon: Activity,
      },
      {
        href: "/super_admin/doctor-availability",
        label: "Doctor Availability",
        icon: CalendarClock,
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        href: "/super_admin/bookings",
        label: "All Bookings",
        icon: ClipboardList,
      },
    ],
  },
  {
    title: "Engagement & Moderation",
    items: [
      {
        href: "/super_admin/featured-doctors",
        label: "Featured Doctors",
        icon: Sparkles,
      },
      {
        href: "/super_admin/featured-clinics",
        label: "Featured Clinics",
        icon: Sparkles,
      },
      {
        href: "/super_admin/reviews",
        label: "Reviews Moderation",
        icon: Star,
      },
      {
        href: "/super_admin/announcements",
        label: "Announcements",
        icon: Megaphone,
      },
    ],
  },
  {
    title: "System & Access",
    items: [
      {
        href: "/super_admin/users",
        label: "User Management",
        icon: Users,
      },
      {
        href: "/super_admin/settings",
        label: "Platform Settings",
        icon: Settings,
      },
    ],
  },
];

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tNav = useTranslations("AdminNav");
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  useEffect(() => {
    if (!loading) {
      if (!user || !isSuperAdmin) {
        router.push("/login");
      }
    }
  }, [loading, user, isSuperAdmin, router]);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (loading || !user || !isSuperAdmin) {
    return <LoadingSpinner text={tNav("loadingPortal")} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-500/5 dark:from-slate-950 dark:to-slate-900">
      {/* Mobile Floating Action Button (FAB) */}
      <MobileFabButton onClick={() => setIsMobileMenuOpen(true)} />

      {/* Mobile Drawer Menu */}
      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        sections={SUPER_ADMIN_NAV_SECTIONS}
        pathname={pathname}
        userName={user.name || "Super Administrator"}
        userEmail={user.email || ""}
        userRole={user.role}
      />

      {/* Main Container */}
      <div className="mx-auto flex w-full max-w-[1440px] items-start gap-6 px-4 py-6 md:px-6 md:py-8 lg:px-8">
        {/* Desktop Sidebar */}
        <DesktopSidebar
          sections={SUPER_ADMIN_NAV_SECTIONS}
          pathname={pathname}
          userName={user.name || "Super Administrator"}
          userRole={user.role}
        />

        {/* Main Content Area */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-Components
// ---------------------------------------------------------------------------

function LoadingSpinner({ text }: { text: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Shield className="h-5 w-5 text-amber-600" />
          </div>
        </div>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {text}
        </p>
      </div>
    </div>
  );
}

function MobileFabButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/40 transition-all hover:scale-110 hover:shadow-xl active:scale-95 md:hidden"
      aria-label="Open navigation menu"
    >
      <Menu className="h-6 w-6" />
    </button>
  );
}

function MobileDrawer({
  isOpen,
  onClose,
  sections,
  pathname,
  userName,
  userEmail,
  userRole,
}: {
  isOpen: boolean;
  onClose: () => void;
  sections: NavSection[];
  pathname: string;
  userName: string;
  userEmail: string;
  userRole: string;
}) {
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
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity md:hidden"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] transform bg-white shadow-2xl transition-transform duration-300 ease-out dark:bg-slate-900 md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header Banner */}
        <div className="flex items-center justify-between bg-gradient-to-r from-amber-500 to-orange-600 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-sm">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Super Admin</p>
              <p className="text-xs text-amber-100">{userName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-white transition-colors hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex h-[calc(100vh-140px)] flex-col overflow-y-auto p-3">
          <div className="space-y-4">
            {sections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1">
                <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-600/70 dark:text-amber-400">
                  {section.title}
                </p>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`group flex items-center gap-3 rounded-xl px-3 py-3 transition-all ${
                        active
                          ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/30"
                          : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                      }`}
                    >
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all ${
                          active
                            ? "bg-white/20 text-white"
                            : "bg-slate-100 text-slate-600 group-hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-slate-700"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="flex-1 text-sm font-medium">{item.label}</span>
                      {active && <ChevronRight className="h-4 w-4 text-white/70" />}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>

          {/* User Info Footer Section */}
          <div className="mt-auto border-t border-slate-200 pt-4 dark:border-slate-800">
            <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-transparent p-3 dark:bg-slate-800/60">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md">
                <span className="text-sm font-bold">
                  {userName.charAt(0) || "S"}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {userName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {userEmail || userRole}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function DesktopSidebar({
  sections,
  pathname,
  userName,
  userRole,
}: {
  sections: NavSection[];
  pathname: string;
  userName: string;
  userRole: string;
}) {
  return (
    <aside className="hidden w-72 shrink-0 md:block">
      <div className="sticky top-20 space-y-6">
        {/* Sidebar Header Card */}
        <GradientCard variant="amber">
          <div className="flex items-center gap-3 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                  {userRole?.replace("_", " ")}
                </span>
              </div>
              <p className="truncate text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                {userName}
              </p>
              <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 truncate">
                Central Platform Control
              </p>
            </div>
          </div>
        </GradientCard>

        {/* Categorized Navigation Container */}
        <GradientCard variant="slate">
          <nav className="p-2 space-y-4">
            {sections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1">
                <p className="px-3 pb-1 pt-1 text-[10px] font-bold uppercase tracking-wider text-amber-600/70 dark:text-amber-400">
                  {section.title}
                </p>
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    // Exact match checking for Dashboard, loose matching for others
                    const active = item.exact
                      ? pathname === item.href
                      : pathname.startsWith(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${
                          active
                            ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/30"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200"
                        }`}
                      >
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
                            active
                              ? "bg-white/20 text-white"
                              : "bg-slate-100 text-slate-600 group-hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="flex-1 text-sm font-medium">{item.label}</span>
                        {active && <ChevronRight className="h-4 w-4 text-white/70" />}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </GradientCard>
      </div>
    </aside>
  );
}