"use client";

import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  User,
  ChevronDown,
  MapPin,
  Radio,
  Building2,
  Stethoscope,
  Info,
  Megaphone,
  Globe,
} from "lucide-react";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";

import { useAuth } from "@/lib/auth-context";
import { Link, useRouter, usePathname } from "@/i18n/routing";

import NotificationBell from "./NotificationBell";

const LOCALES = [
  { code: "bn", label: "বাংলা" },
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
];

const LOCATIONS = ["Dubrajpur", "Suri", "Bolpur", "Rampurhat", "Kolkata"];

export default function Header() {
  const t = useTranslations("HomePage");
  const nav = useTranslations("Navbar");
  const dash = useTranslations("Dashboard");
  const currentLocale = useLocale();

  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("Dubrajpur");
  const [showLocationMenu, setShowLocationMenu] = useState(false);

  const moreRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const locRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (locRef.current && !locRef.current.contains(e.target as Node)) {
        setShowLocationMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function switchLanguage(code: string) {
    if (code === currentLocale) return;
    router.replace(pathname, { locale: code });
    setShowUserMenu(false);
  }

  const isClinic = user?.role === "CLINIC";
  const isDoctor = user?.role === "DOCTOR";
  const isDiagnosticCenter = user?.role === "DIAGNOSTIC_CENTER";
  const isDiagnosticStaff = user?.role === "DIAGNOSTIC_STAFF";
  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const isAdmin = user?.role === "ADMIN";
  const isReceptionist = user?.role === "RECEPTIONIST";

  const dashboardHref = isClinic
    ? "/clinic"
    : isDoctor
      ? "/doctor/dashboard"
      : isDiagnosticCenter
        ? "/diagnosticCenter/dashboard"
        : isDiagnosticStaff
          ? "/diagnosticStaff/dashboard"
          : isSuperAdmin
            ? "/super_admin/dashboard"
            : isAdmin
              ? "/admin/dashboard"
              : isReceptionist
                ? "/receptionist/dashboard"
                : "/patient";

  const dashboardLabel = isClinic
    ? dash("clinicPanel")
    : isDoctor
      ? dash("doctorPanel")
      : isDiagnosticCenter
        ? "Diagnostic Portal"
        : isDiagnosticStaff
          ? "Diagnostic Staff"
          : isSuperAdmin
            ? "Super Admin"
            : isAdmin
              ? "Admin Portal"
              : isReceptionist
                ? "Receptionist Portal"
                : dash("dashboard");

  async function handleLogout() {
    await logout();
    setOpen(false);
    setShowUserMenu(false);
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur-md shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-colors dark:border-soft-300 dark:bg-surface/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* ================= DEWASI GROUP LOGO ================= */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/main.png"
            alt="Dewasi Group"
            width={120}
            height={42}
            className="h-10 sm:h-11 w-auto object-contain"
            priority
          />
        </Link>

        {/* ================= CENTER NAV (Treatments, Labs, Ambulance visible directly) ================= */}
        <nav className="hidden items-center gap-5 xl:gap-6 lg:flex">
          <Link
            href="/"
            className="text-sm font-semibold text-[#1C63E7] hover:text-[#1550c4] transition-colors py-1"
          >
            Home
          </Link>

          <Link
            href="/doctors"
            className="text-sm font-medium text-slate-700 hover:text-[#1C63E7] transition-colors dark:text-ink-700 dark:hover:text-[var(--color-primary-text)]"
          >
            Doctors
          </Link>

          <Link
            href="/clinics"
            className="text-sm font-medium text-slate-700 hover:text-[#1C63E7] transition-colors dark:text-ink-700 dark:hover:text-[var(--color-primary-text)]"
          >
            Clinics
          </Link>

          {/* Treatments visible directly */}
          <Link
            href="/#treatments"
            className="text-sm font-medium text-slate-700 hover:text-[#1C63E7] transition-colors dark:text-ink-700 dark:hover:text-[var(--color-primary-text)]"
          >
            Treatments
          </Link>

          {/* Labs visible directly */}
          <Link
            href="/#labs"
            className="text-sm font-medium text-slate-700 hover:text-[#1C63E7] transition-colors dark:text-ink-700 dark:hover:text-[var(--color-primary-text)]"
          >
            Labs
          </Link>

          {/* Ambulance visible directly */}
          <Link
            href="/#ambulance"
            className="text-sm font-medium text-slate-700 hover:text-[#1C63E7] transition-colors dark:text-ink-700 dark:hover:text-[var(--color-primary-text)]"
          >
            Ambulance
          </Link>

          {/* Announcements Tab */}
          <Link
            href="/announcements"
            className="flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-[#1C63E7] transition-colors dark:text-ink-700 dark:hover:text-[var(--color-primary-text)]"
          >
            <Megaphone className="h-3.5 w-3.5 text-amber-500" />
            <span>Announcements</span>
          </Link>

          {/* More Dropdown */}
          <div className="relative" ref={moreRef}>
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-[#1C63E7] transition-colors dark:text-ink-700"
            >
              More
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {showMoreMenu && (
              <div className="absolute left-0 mt-2 w-52 rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl dark:border-soft-300 dark:bg-surface animate-in fade-in zoom-in-95 duration-100 z-50">
                <Link
                  href="/doctors/available"
                  onClick={() => setShowMoreMenu(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:text-ink-700"
                >
                  <Stethoscope className="h-4 w-4 text-[#1C63E7]" />
                  Available Doctors
                </Link>
                <Link
                  href="/clinics/available"
                  onClick={() => setShowMoreMenu(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:text-ink-700"
                >
                  <Building2 className="h-4 w-4 text-[#16A34A]" />
                  Available Clinics
                </Link>
                <Link
                  href="/#clinics"
                  onClick={() => setShowMoreMenu(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:text-ink-700"
                >
                  <Info className="h-4 w-4 text-amber-500" />
                  Apply for Listing
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* ================= RIGHT CONTROLS ================= */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Live Doctors Pill */}
          <Link
            href="/doctors/available"
            className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#e11d48] to-[#db2777] px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:opacity-95"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
            </span>
            <Radio className="h-3 w-3 text-white" />
            <span>Live</span>
          </Link>

          {/* Location Selector Pill */}
          <div className="relative hidden sm:block" ref={locRef}>
            <button
              onClick={() => setShowLocationMenu(!showLocationMenu)}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-soft-300 dark:bg-surface dark:text-ink-700"
            >
              <MapPin className="h-3.5 w-3.5 text-[#1C63E7]" />
              <span>{selectedLocation}</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {showLocationMenu && (
              <div className="absolute right-0 mt-2 w-36 rounded-xl border border-slate-100 bg-white p-1 shadow-lg dark:border-soft-300 dark:bg-surface z-50">
                {LOCATIONS.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => {
                      setSelectedLocation(loc);
                      setShowLocationMenu(false);
                    }}
                    className={`flex w-full items-center px-3 py-1.5 text-xs rounded-lg transition text-left ${
                      selectedLocation === loc
                        ? "bg-blue-50 font-bold text-[#1C63E7]"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notification Bell */}
          {user && <NotificationBell />}

          {/* ================= USER PROFILE (With Language embedded) ================= */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0F1B33] text-white shadow transition hover:bg-[#1e293b]"
              aria-label="User profile & language settings"
            >
              {user ? (
                <span className="text-xs font-bold">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </span>
              ) : (
                <User className="h-4 w-4" />
              )}
            </button>

            {/* Profile & Settings Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-100 bg-white p-2 shadow-2xl dark:border-soft-300 dark:bg-surface z-50 animate-in fade-in zoom-in-95 duration-100">
                {user ? (
                  <>
                    <div className="border-b border-slate-100 px-3 py-2.5 dark:border-soft-200">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-slate-900 dark:text-ink-900 truncate">
                          {user.name}
                        </p>
                        <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[#1C63E7] uppercase">
                          {user.role}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500 truncate">{user.email}</p>
                    </div>

                    <div className="py-1.5 space-y-0.5">
                      <Link
                        href={dashboardHref}
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:text-ink-700 dark:hover:bg-soft-50"
                      >
                        <LayoutDashboard className="h-4 w-4 text-[#1C63E7]" />
                        {dashboardLabel}
                      </Link>

                      {!isClinic && !isDoctor && !isDiagnosticCenter && !isDiagnosticStaff && !isAdmin && (
                        <Link
                          href="/patient/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:text-ink-700 dark:hover:bg-soft-50"
                        >
                          <User className="h-4 w-4 text-slate-500" />
                          {dash("profile")}
                        </Link>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="p-2 space-y-1.5 border-b border-slate-100 dark:border-soft-200">
                    <Link
                      href="/login"
                      onClick={() => setShowUserMenu(false)}
                      className="block w-full rounded-xl bg-[#1C63E7] px-3 py-2 text-center text-xs font-bold text-white shadow transition hover:bg-[#1550c4]"
                    >
                      {t("login")}
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setShowUserMenu(false)}
                      className="block w-full rounded-xl border border-slate-200 px-3 py-2 text-center text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                    >
                      {t("register")}
                    </Link>
                  </div>
                )}

                {/* Language Switcher inside Profile */}
                <div className="border-t border-slate-100 px-3 py-2.5 dark:border-soft-200">
                  <div className="flex items-center gap-1.5 mb-2 text-slate-500 text-xs font-medium">
                    <Globe className="h-3.5 w-3.5 text-[#1C63E7]" />
                    <span>Language / ভাষা / भाषा</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-50 p-1 border border-slate-100 dark:bg-soft-50 dark:border-soft-200">
                    {LOCALES.map((l) => {
                      const isActive = currentLocale === l.code;
                      return (
                        <button
                          key={l.code}
                          type="button"
                          onClick={() => switchLanguage(l.code)}
                          className={`rounded-lg py-1.5 text-xs font-bold transition-all text-center ${
                            isActive
                              ? "bg-white text-[#1C63E7] shadow-sm font-extrabold dark:bg-surface dark:text-[var(--color-primary-text)]"
                              : "text-slate-600 hover:text-slate-900 dark:text-ink-600"
                          }`}
                        >
                          {l.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {user && (
                  <div className="border-t border-slate-100 pt-1 dark:border-soft-200">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                    >
                      <LogOut className="h-4 w-4" />
                      {dash("logout")}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setOpen(!open)}
            className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 lg:hidden dark:text-ink-600 dark:hover:bg-soft-100"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ================= MOBILE MENU ================= */}
      {open && (
        <div className="border-t border-gray-200 bg-white lg:hidden dark:border-soft-300 dark:bg-surface">
          <div className="space-y-1 px-4 py-3">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-semibold text-[#1C63E7] bg-blue-50"
            >
              Home
            </Link>
            <Link
              href="/doctors"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Doctors
            </Link>
            <Link
              href="/clinics"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Clinics
            </Link>
            <Link
              href="/#treatments"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Treatments
            </Link>
            <Link
              href="/#labs"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Labs
            </Link>
            <Link
              href="/#ambulance"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Ambulance
            </Link>
            <Link
              href="/announcements"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Megaphone className="h-4 w-4 text-amber-500" />
              <span>Announcements</span>
            </Link>

            <hr className="my-2 border-slate-100" />

            {user ? (
              <>
                <Link
                  href={dashboardHref}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <LayoutDashboard className="mr-2 inline h-4 w-4 text-[#1C63E7]" />
                  {dashboardLabel}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  {dash("logout")}
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-center text-xs font-bold text-slate-700"
                >
                  {t("login")}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="rounded-lg bg-[#1C63E7] px-3 py-2 text-center text-xs font-bold text-white"
                >
                  {t("register")}
                </Link>
              </div>
            )}

            {/* Mobile Language Switcher */}
            <div className="pt-2">
              <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-50 p-1 border border-slate-100">
                {LOCALES.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => switchLanguage(l.code)}
                    className={`rounded-lg py-1.5 text-xs font-bold text-center ${
                      currentLocale === l.code
                        ? "bg-white text-[#1C63E7] shadow-sm font-extrabold"
                        : "text-slate-600"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}