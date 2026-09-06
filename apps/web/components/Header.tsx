"use client";

import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  User,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { useAuth } from "@/lib/auth-context";
import { Link, useRouter } from "@/i18n/routing";

import LanguageSwitcher from "./LanguageSwitcher";
import NotificationBell from "./NotificationBell";
import LiveDoctorsButton from "./LiveDoctorsButton";

export default function Header() {
  const t = useTranslations("HomePage");
  const nav = useTranslations("Navbar");
  const dash = useTranslations("Dashboard");

  const { user, logout } = useAuth();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

    // Clinics land on /clinic, Doctors on /doctor/dashboard, Diagnostic Centers on /diagnosticCenter/dashboard, Staff on /diagnosticCenter/referrals, Admins on /admin/dashboard, Receptionists on /receptionist/dashboard, Patients on /patient.
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
          ? "/diagnosticCenter/referrals"
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
          ? "Referrals Inbox"
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
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm transition-colors dark:border-soft-300 dark:bg-surface">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* ================= LOGO ================= */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
            <Image
              src="/logo-icon.png"
              alt="Doctor Contact"
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
              priority
            />
          </div>

          <Image
            src="/LOGO.png"
            alt="Doctor Contact"
            width={130}
            height={36}
            className="h-8 sm:h-9 w-auto object-contain"
            priority
          />
        </Link>

        {/* ================= DESKTOP NAV ================= */}
        <div className="hidden items-center gap-3 md:flex">
          {/* Available Doctors */}
          <Link
            href="/doctors/available"
            className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            {nav("availableDoctors")}
          </Link>

          {/* Available Clinics */}
          <Link
            href="/clinics/available"
            className="rounded-full border border-[var(--color-primary)]/25 px-4 py-2 text-sm font-semibold text-[var(--color-primary-text)] transition hover:bg-[var(--color-primary)]/5"
          >
            {nav("availableClinics")}
          </Link>

          {/* Apply for Listing */}
          <Link
            href="/#clinics"
            className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-soft-300 dark:text-ink-700 dark:hover:bg-soft-50"
          >
            {nav("applyForListing")}
          </Link>

          {/* Divider */}
          <span className="mx-1 h-6 w-px bg-gray-200" />

          {/* Language */}
          <LanguageSwitcher />

          {/* Live Doctors (was Dark Mode toggle) */}
          <LiveDoctorsButton compact />

          {/* Notification Bell - Desktop */}
          {user && <NotificationBell />}

          {/* ================= USER ================= */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 rounded-full px-3 py-1.5 transition hover:bg-gray-50 dark:hover:bg-soft-50"
              >
                {/* Avatar */}
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                  <span className="text-sm font-bold">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>

                {/* Name */}
                <span className="hidden text-sm font-medium text-gray-700 lg:block dark:text-ink-700">
                  {user.name}
                </span>

                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>

              {/* ================= USER DROPDOWN ================= */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-soft-300 dark:bg-surface">
                  {/* Dashboard */}
                  <Link
                    href={dashboardHref}
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-ink-700 dark:hover:bg-soft-50"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    {dashboardLabel}
                  </Link>

                  {/* Profile — patients only */}
                  {!isClinic && !isDoctor && !isDiagnosticCenter && !isDiagnosticStaff && !isAdmin && (
                    <Link
                      href="/patient/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-ink-700 dark:hover:bg-soft-50"
                    >
                      <User className="h-4 w-4" />
                      {dash("profile")}
                    </Link>
                  )}

                  <hr className="my-1 border-gray-100 dark:border-soft-100" />

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                  >
                    <LogOut className="h-4 w-4" />
                    {dash("logout")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ================= GUEST DESKTOP ================= */
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
              >
                {t("login")}
              </Link>

              <Link
                href="/register"
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                {t("register")}
              </Link>
            </div>
          )}
        </div>

        {/* ================= MOBILE HEADER ================= */}
        <div className="flex items-center gap-2 md:hidden">
          {/* Live Doctors (was Dark Mode toggle) */}
          <LiveDoctorsButton compact />

          {/* Notification Bell - Mobile */}
          {user && <NotificationBell />}

          {/* Menu Button */}
          <button
            onClick={() => setOpen(!open)}
            className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 dark:text-ink-600 dark:hover:bg-soft-100"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* ================= MOBILE MENU ================= */}
      {open && (
        <div className="border-t border-gray-200 bg-white md:hidden dark:border-soft-300 dark:bg-surface">
          <div className="space-y-2 px-4 py-4">
            {user ? (
              <>
                {/* ================= MOBILE USER INFO ================= */}
                <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-soft-50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                    <span className="font-bold">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>

                  <div>
                    <p className="font-medium text-gray-800 dark:text-ink-800">{user.name}</p>
                    <p className="text-xs text-gray-500">
                      {isClinic
                        ? "Clinic"
                        : isDoctor
                          ? "Doctor"
                          : isDiagnosticCenter
                            ? "Diagnostic Center"
                            : isDiagnosticStaff
                              ? "Diagnostic Staff"
                              : isAdmin
                                ? user.role === "SUPER_ADMIN"
                                  ? "Super Admin"
                                  : "Admin"
                                : "Patient"}
                    </p>
                  </div>
                </div>

                {/* ================= AVAILABLE DOCTORS ================= */}
                <Link
                  href="/doctors/available"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  {nav("availableDoctors")}
                </Link>

                {/* ================= AVAILABLE CLINICS ================= */}
                <Link
                  href="/clinics/available"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg border border-[var(--color-primary)]/25 px-4 py-3 text-center text-sm font-semibold text-[var(--color-primary-text)] transition hover:bg-[var(--color-primary)]/5"
                >
                  {nav("availableClinics")}
                </Link>

                {/* ================= APPLY FOR LISTING ================= */}
                <Link
                  href="/#clinics"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-soft-300 dark:text-ink-700 dark:hover:bg-soft-50"
                >
                  {nav("applyForListing")}
                </Link>

                {/* ================= DASHBOARD ================= */}
                <Link
                  href={dashboardHref}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50 dark:text-ink-700 dark:hover:bg-soft-50"
                >
                  <LayoutDashboard className="mr-2 inline h-4 w-4" />
                  {dashboardLabel}
                </Link>

                {/* ================= PROFILE (patients only) ================= */}
                {!isClinic && !isDoctor && !isDiagnosticCenter && !isDiagnosticStaff && (
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50 dark:text-ink-700 dark:hover:bg-soft-50"
                  >
                    <User className="mr-2 inline h-4 w-4" />
                    {dash("profile")}
                  </Link>
                )}

                <hr className="border-gray-100 dark:border-soft-100" />

                {/* ================= LOGOUT ================= */}
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                >
                  <LogOut className="h-4 w-4" />
                  {dash("logout")}
                </button>
              </>
            ) : (
              <>
                {/* ================= GUEST MOBILE ================= */}

                {/* Available Doctors */}
                <Link
                  href="/doctors/available"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  {nav("availableDoctors")}
                </Link>

                {/* Available Clinics */}
                <Link
                  href="/clinics"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg border border-[var(--color-primary)]/25 px-4 py-3 text-center text-sm font-semibold text-[var(--color-primary-text)] transition hover:bg-[var(--color-primary)]/5"
                >
                  {nav("availableClinics")}
                </Link>

                {/* Apply for Listing */}
                <Link
                  href="/#clinics"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-soft-300 dark:text-ink-700 dark:hover:bg-soft-50"
                >
                  {nav("applyForListing")}
                </Link>

                {/* Login / Register */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="rounded-lg border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-soft-300 dark:text-ink-700 dark:hover:bg-soft-50"
                  >
                    {t("login")}
                  </Link>

                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className="rounded-lg bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    {t("register")}
                  </Link>
                </div>
              </>
            )}

            {/* ================= MOBILE LANGUAGE ================= */}
            <div className="pt-3 text-center">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}