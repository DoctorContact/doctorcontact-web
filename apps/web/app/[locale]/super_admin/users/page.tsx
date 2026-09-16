"use client";

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Shield,
  ShieldCheck,
  Search,
  AlertTriangle,
  Plus,
  X,
  Lock,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { useAdminUsers, useToggleUserStatus, useCreateAdmin } from "@/lib/hooks/useAdmin";
import type { AdminUserRecord, Role, CreateAdminInput } from "@doctor-contract/shared";
import { GradientCard } from "@/components/ui/GradientCard";

const ROLES: (Role | "ALL")[] = [
  "ALL",
  "ADMIN",
  "SUPER_ADMIN",
  "DOCTOR",
  "CLINIC",
  "RECEPTIONIST",
  "PATIENT",
];

export default function SuperAdminUsersPage() {
  const t = useTranslations("AdminUsers");
  const locale = useLocale();
  const localeCode =
    locale === "bn" ? "bn-BD" : locale === "hi" ? "hi-IN" : "en-US";

  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const limit = 20;

  const roleParam = selectedRole === "ALL" ? undefined : selectedRole;
  const { data, isLoading, isError, isFetching, refetch } = useAdminUsers({
    role: roleParam,
    page,
    limit,
  });

  const toggleStatus = useToggleUserStatus();
  const createAdmin = useCreateAdmin();

  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [pendingConfirmUser, setPendingConfirmUser] = useState<AdminUserRecord | null>(null);
  const [showCreateAdminModal, setShowCreateAdminModal] = useState<boolean>(false);

  // Form state for creating a new Admin
  const [adminFormData, setAdminFormData] = useState<CreateAdminInput>({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const rawUsers = data?.users || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit) || 1;

  // Filter users by search term (name, email, phone)
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return rawUsers;
    const q = searchQuery.toLowerCase().trim();
    return rawUsers.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.toLowerCase().includes(q)
    );
  }, [rawUsers, searchQuery]);

  // Status counts for visible records
  const activeCount = rawUsers.filter((u) => u.isActive).length;
  const inactiveCount = rawUsers.filter((u) => !u.isActive).length;

  async function handleConfirmToggle() {
    if (!pendingConfirmUser) return;
    const userToToggle = pendingConfirmUser;
    setPendingConfirmUser(null);
    setActionError(null);
    setActionSuccess(null);

    try {
      await toggleStatus.mutateAsync({
        userId: userToToggle.id,
        isActive: !userToToggle.isActive,
      });
      setActionSuccess(
        `User ${userToToggle.name} ${userToToggle.isActive ? "deactivated" : "activated"} successfully.`
      );
    } catch (err: any) {
      setActionError(
        err?.response?.data?.message || "Failed to update user status"
      );
    }
  }

  async function handleCreateAdminSubmit(e: React.FormEvent) {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);

    if (!adminFormData.name.trim() || !adminFormData.email.trim() || !adminFormData.password) {
      setActionError("Name, email, and password are required.");
      return;
    }

    try {
      await createAdmin.mutateAsync(adminFormData);
      setShowCreateAdminModal(false);
      setAdminFormData({ name: "", email: "", password: "", phone: "" });
      setActionSuccess(`Admin account for "${adminFormData.name}" created successfully!`);
    } catch (err: any) {
      setActionError(
        err?.response?.data?.message || "Failed to create Admin account. Ensure the email is not already registered."
      );
    }
  }

  function getRoleBadge(role: Role) {
    switch (role) {
      case "SUPER_ADMIN":
        return {
          bg: "bg-amber-100 dark:bg-amber-950/50",
          text: "text-amber-800 dark:text-amber-300",
          border: "border-amber-200 dark:border-amber-900/50",
          icon: Shield,
        };
      case "ADMIN":
        return {
          bg: "bg-blue-100 dark:bg-blue-950/50",
          text: "text-blue-800 dark:text-blue-300",
          border: "border-blue-200 dark:border-blue-900/50",
          icon: ShieldCheck,
        };
      case "DOCTOR":
        return {
          bg: "bg-cyan-100 dark:bg-cyan-950/50",
          text: "text-cyan-800 dark:text-cyan-300",
          border: "border-cyan-200 dark:border-cyan-900/50",
        };
      case "CLINIC":
        return {
          bg: "bg-purple-100 dark:bg-purple-950/50",
          text: "text-purple-800 dark:text-purple-300",
          border: "border-purple-200 dark:border-purple-900/50",
        };
      case "RECEPTIONIST":
        return {
          bg: "bg-indigo-100 dark:bg-indigo-950/50",
          text: "text-indigo-800 dark:text-indigo-300",
          border: "border-indigo-200 dark:border-indigo-900/50",
        };
      case "PATIENT":
        return {
          bg: "bg-emerald-100 dark:bg-emerald-950/50",
          text: "text-emerald-800 dark:text-emerald-300",
          border: "border-emerald-200 dark:border-emerald-900/50",
        };
      default:
        return {
          bg: "bg-slate-100 dark:bg-slate-800",
          text: "text-slate-700 dark:text-slate-300",
          border: "border-slate-200 dark:border-slate-700",
        };
    }
  }

  function formatJoinedDate(dateStr?: string | null) {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString(localeCode, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Banner - Amber */}
      <GradientCard variant="amber">
        <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                {t("title")}
              </h1>
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                Super Admin Control
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {t("subtitle")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCreateAdminModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:scale-105 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Admin</span>
            </button>

            <button
              type="button"
              onClick={() => refetch()}
              disabled={isLoading || isFetching}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-blue-600" : ""}`}
              />
              <span>{t("retry")}</span>
            </button>
          </div>
        </div>
      </GradientCard>

      {/* Action Error Alert */}
      {actionError && (
        <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{actionError}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-[11px] font-bold underline"
          >
            {t("dismiss")}
          </button>
        </div>
      )}

      {/* Action Success Alert */}
      {actionSuccess && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{actionSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionSuccess(null)}
            className="text-[11px] font-bold underline"
          >
            {t("dismiss")}
          </button>
        </div>
      )}

      {/* Summary Stat Badges */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <GradientCard variant="blue">
          <div className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 shadow-xs">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                {t("totalUsers")}
              </span>
              <p className="text-xl font-black text-slate-900 dark:text-slate-100">
                {total.toLocaleString(localeCode)}
              </p>
            </div>
          </div>
        </GradientCard>

        <GradientCard variant="emerald">
          <div className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 shadow-xs">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                {t("activeUsers")} (Page)
              </span>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                {activeCount.toLocaleString(localeCode)}
              </p>
            </div>
          </div>
        </GradientCard>

        <GradientCard variant="rose">
          <div className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 shadow-xs">
              <XCircle className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                {t("inactiveUsers")} (Page)
              </span>
              <p className="text-xl font-black text-rose-600 dark:text-rose-400">
                {inactiveCount.toLocaleString(localeCode)}
              </p>
            </div>
          </div>
        </GradientCard>
      </div>

      {/* Filter & Search Bar */}
      <GradientCard variant="slate">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Role Filter Tabs (Touch scroll on mobile) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            {ROLES.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => {
                  setSelectedRole(role);
                  setPage(1);
                }}
                className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  selectedRole === role
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                }`}
              >
                {role === "ALL" ? t("allRoles") : role}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[200px] sm:min-w-[240px]">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-1.5 pl-8 pr-3 text-xs text-slate-900 outline-none transition focus:border-amber-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:focus:border-amber-500"
            />
          </div>
        </div>
      </GradientCard>

      {/* Error State */}
      {isError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-300">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
            <div className="flex-1">
              <h3 className="text-xs font-semibold">{t("errorTitle")}</h3>
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-rose-700"
            >
              {t("retry")}
            </button>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        </div>
      )}

      {/* Users Table */}
      {!isLoading && !isError && (
        <GradientCard variant="slate">
          <div className="overflow-hidden">
            {filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                  <Users className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-slate-100">
                  {t("emptyTitle")}
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {t("emptyDesc")}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-3">{t("name")}</th>
                      <th className="px-4 py-3">{t("email")}</th>
                      <th className="px-4 py-3">{t("phone")}</th>
                      <th className="px-4 py-3">{t("role")}</th>
                      <th className="px-4 py-3">{t("status")}</th>
                      <th className="px-4 py-3">{t("verified")}</th>
                      <th className="px-4 py-3">{t("joined")}</th>
                      <th className="px-4 py-3 text-right">{t("actions")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredUsers.map((user) => {
                      const isSuperAdmin = user.role === "SUPER_ADMIN";
                      const roleBadge = getRoleBadge(user.role);
                      const RoleIcon = roleBadge.icon;

                      return (
                        <tr
                          key={user.id}
                          className="transition hover:bg-slate-50/60 dark:hover:bg-slate-800/50"
                        >
                          <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                            <div className="flex items-center gap-2">
                              <span>{user.name}</span>
                              {isSuperAdmin && (
                                <Shield
                                  className="h-3.5 w-3.5 text-amber-500"
                                  aria-label="Super Administrator"
                                />
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                            {user.email || "—"}
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                            {user.phone || "—"}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide border ${roleBadge.bg} ${roleBadge.text} ${roleBadge.border}`}
                            >
                              {RoleIcon && <RoleIcon className="h-3 w-3" />}
                              <span>{user.role}</span>
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {user.isActive ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>{t("active")}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">
                                <XCircle className="h-3.5 w-3.5" />
                                <span>{t("inactive")}</span>
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {user.isVerified ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                <span>{t("verified")}</span>
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                                {t("unverified")}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                            {formatJoinedDate(user.createdAt)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => setPendingConfirmUser(user)}
                              disabled={isSuperAdmin || toggleStatus.isPending}
                              title={isSuperAdmin ? t("superAdminProtected") : undefined}
                              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                                user.isActive
                                  ? "bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/50"
                                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
                              }`}
                            >
                              {user.isActive ? t("deactivate") : t("activate")}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {total > limit && (
              <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <span>
                  {t("page")} {page} of {totalPages} ({total.toLocaleString(localeCode)} users)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1 || isLoading}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-medium transition hover:bg-slate-50 disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span>{t("previous")}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages || isLoading}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-medium transition hover:bg-slate-50 disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
                  >
                    <span>{t("next")}</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </GradientCard>
      )}

      {/* Confirmation Modal for Toggle User Status */}
      {pendingConfirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-xl transition-all dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3 text-slate-900 dark:text-slate-100">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  pendingConfirmUser.isActive
                    ? "bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400"
                    : "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
                }`}
              >
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold">
                  {t("confirmTitle")}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {pendingConfirmUser.name} ({pendingConfirmUser.role})
                </p>
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-600 dark:text-slate-300">
              {t("confirmDesc")}
            </p>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingConfirmUser(null)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750"
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                onClick={handleConfirmToggle}
                disabled={toggleStatus.isPending}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold text-white transition ${
                  pendingConfirmUser.isActive
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {toggleStatus.isPending ? t("updating") : t("confirm")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Admin Modal */}
      {showCreateAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md max-h-[90dvh] overflow-y-auto scrollbar-thin rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Create New Admin Account
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Super Admin privilege: Grant full operator access.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateAdminModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAdminSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Admin Full Name *
                </label>
                <div className="relative mt-1">
                  <User className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={adminFormData.name}
                    onChange={(e) =>
                      setAdminFormData({ ...adminFormData, name: e.target.value })
                    }
                    placeholder="e.g. Vikram Sharma"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-1.5 pl-8 pr-3 text-xs text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Email Address *
                </label>
                <div className="relative mt-1">
                  <Mail className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={adminFormData.email}
                    onChange={(e) =>
                      setAdminFormData({ ...adminFormData, email: e.target.value })
                    }
                    placeholder="e.g. admin@platform.com"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-1.5 pl-8 pr-3 text-xs text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
    Phone Number <span className="text-red-500">*</span>
  </label>
  <div className="relative mt-1">
    <Phone className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
    <input
      type="tel"
      required
      minLength={10}
      value={adminFormData.phone}
      onChange={(e) =>
        setAdminFormData({ ...adminFormData, phone: e.target.value })
      }
      placeholder="e.g. +91 6296398479"
      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-1.5 pl-8 pr-3 text-xs text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:focus:border-blue-500"
    />
  </div>
</div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Initial Password *
                </label>
                <div className="relative mt-1">
                  <Lock className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={adminFormData.password}
                    onChange={(e) =>
                      setAdminFormData({ ...adminFormData, password: e.target.value })
                    }
                    placeholder="Minimum 6 characters"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-1.5 pl-8 pr-3 text-xs text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateAdminModal(false)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createAdmin.isPending}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 disabled:opacity-50"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>{createAdmin.isPending ? "Creating Admin..." : "Create Admin Account"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
