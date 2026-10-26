"use client";

import { useState, useMemo } from "react";
import { useLocale } from "next-intl";
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Building2,
  Stethoscope,
  Search,
  Clock,
  Calendar,
  IndianRupee,
  Loader2,
  ArrowRightLeft
} from "lucide-react";
import { GradientCard } from "@/components/ui/GradientCard";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";

// 🟢 Multi-Language Name Parser
const parseMultiLangName = (rawName: string = "") => {
  const parts = rawName.split(" | ");
  return {
    en: parts[0]?.trim() || rawName,
    bn: parts[1]?.trim() || "",
    hi: parts[2]?.trim() || "",
  };
};

type FilterTab = "ALL" | "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export default function AdminRequestsPage() {
  const locale = useLocale();
  const localeCode = locale === "bn" ? "bn-BD" : locale === "hi" ? "hi-IN" : "en-US";

  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingAction, setPendingAction] = useState<any>(null);
  const [actionType, setActionType] = useState<"ACCEPT" | "REJECT" | null>(null);

  // 1. Fetch ALL Requests (Super Admin)
  const { data: allRequests = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ["adminAllRequests"],
    queryFn: async () => {
      const res = await api.get("/admin/requests");
      return res.data?.data?.requests || [];
    },
  });

  // 2. Accept/Reject Mutation
  const respondMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: "ACCEPT" | "REJECT" }) => {
      // 🟢 Calls the doctor route as we allowed SUPER_ADMIN role there
      const res = await api.patch(`/doctors/requests/${id}/respond`, { action });
      return res.data;
    },
    onSuccess: (_, variables) => {
      toast.success(`Request ${variables.action === "ACCEPT" ? "approved" : "rejected"} successfully!`);
      setPendingAction(null);
      refetch();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to process request");
      setPendingAction(null);
    },
  });

  // Filter Logic
  const filteredRequests = useMemo(() => {
    return allRequests.filter((req: any) => {
      // Status Filter
      if (activeTab !== "ALL" && req.status !== activeTab) return false;

      // Search Filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const docName = parseMultiLangName(req.doctor?.user?.name).en.toLowerCase();
        const clinicName = parseMultiLangName(req.clinic?.clinicName).en.toLowerCase();
        
        if (!docName.includes(q) && !clinicName.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [allRequests, activeTab, searchQuery]);

  const executeAction = () => {
    if (!pendingAction || !actionType) return;
    respondMutation.mutate({ id: pendingAction.id, action: actionType });
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(localeCode, { year: "numeric", month: "short", day: "numeric" });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <GradientCard variant="amber">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                Clinic & Doctor Requests
              </h1>
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                {allRequests.length} Total
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Manage association requests between clinics and doctors.
            </p>
          </div>
          
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isLoading || isFetching || respondMutation.isPending}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin text-amber-600" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </GradientCard>

      {/* Filters & Search */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <GradientCard variant="slate" className="w-full md:w-auto">
          <div className="flex flex-wrap gap-1.5 p-2">
            {(["ALL", "PENDING", "APPROVED", "REJECTED", "CANCELLED"] as FilterTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                  activeTab === tab
                    ? "bg-amber-500 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </GradientCard>

        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search doctor or clinic..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm outline-none transition focus:border-amber-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900" />
          ))}
        </div>
      )}

      {/* Requests List */}
      {!isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          {filteredRequests.length === 0 ? (
            <div className="col-span-full">
              <GradientCard variant="slate">
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 shadow-xs">
                    <FileCheck className="h-6 w-6" />
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-slate-100">No requests found</h3>
                  <p className="mt-1 text-xs text-slate-500">Try changing your filters or search query.</p>
                </div>
              </GradientCard>
            </div>
          ) : (
            filteredRequests.map((req: any) => {
              const docName = parseMultiLangName(req.doctor?.user?.name).en;
              const clinicName = parseMultiLangName(req.clinic?.clinicName).en;
              
              const isPending = req.status === "PENDING";
              const isApproved = req.status === "APPROVED";
              const isRejected = req.status === "REJECTED";

              return (
                <GradientCard key={req.id} variant={isPending ? "amber" : isApproved ? "emerald" : "slate"}>
                  <div className="flex flex-col h-full justify-between p-5">
                    
                    {/* Top Row: Doctor -> Clinic Connection */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                            {req.doctor?.user?.avatar ? (
                              <img src={req.doctor.user.avatar} className="h-full w-full rounded-full object-cover" alt="" />
                            ) : <Stethoscope className="h-5 w-5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Doctor</p>
                            <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">{docName}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-center">
                          <ArrowRightLeft className="h-4 w-4 text-slate-300 dark:text-slate-600" />
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400">
                            {req.clinic?.logo ? (
                              <img src={req.clinic.logo} className="h-full w-full rounded-full object-cover" alt="" />
                            ) : <Building2 className="h-5 w-5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Clinic</p>
                            <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">{clinicName}</p>
                            <p className="text-[10px] text-slate-500">{req.clinic?.city}</p>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="shrink-0">
                        <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide border ${
                          isPending ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50" : 
                          isApproved ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50" : 
                          "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50"
                        }`}>
                          {req.status}
                        </span>
                      </div>
                    </div>

                    {/* Details Row */}
                    <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{req.dayOfWeek || "Weekly"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>{req.startTime} - {req.endTime}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                        <IndianRupee className="h-3.5 w-3.5 text-slate-400" />
                        <span>{req.fee ? `₹${req.fee}` : "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <span>Initiated: {formatDate(req.createdAt)}</span>
                      </div>
                    </div>

                    {/* Actions (Only if Pending) */}
                    {isPending && (
                      <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                        <button
                          onClick={() => { setPendingAction(req); setActionType("REJECT"); }}
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-rose-50 px-3 text-xs font-bold text-rose-600 transition hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-900/50"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Reject
                        </button>
                        <button
                          onClick={() => { setPendingAction(req); setActionType("ACCEPT"); }}
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-emerald-600 px-4 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Approve
                        </button>
                      </div>
                    )}
                  </div>
                </GradientCard>
              );
            })
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {pendingAction && actionType && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-xl transition-all dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                actionType === "REJECT" 
                  ? "bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400" 
                  : "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
              }`}>
                {actionType === "REJECT" ? <XCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {actionType === "REJECT" ? "Reject Request?" : "Approve Request?"}
                </h3>
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-600 dark:text-slate-300">
              {actionType === "REJECT" 
                ? "This will cancel the association request between the doctor and clinic. Proceed?" 
                : "This will approve the association and make the schedule active. Proceed?"}
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => { setPendingAction(null); setActionType(null); }} className="rounded-lg px-3 py-1.5 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-white">
                Cancel
              </button>
              <button 
                onClick={executeAction} 
                disabled={respondMutation.isPending}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold text-white flex items-center gap-1.5 ${
                  actionType === "REJECT" ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {respondMutation.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}