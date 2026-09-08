"use client";

import { useState } from "react";
import { ClipboardList, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useAdminBookings } from "@/lib/hooks/useAdmin";

const STATUSES = ["", "WAITING", "CHECKED_IN", "COMPLETED", "CANCELLED", "ABSENT"];

const STATUS_CLS: Record<string, string> = {
  WAITING: "bg-amber-50 text-amber-700",
  CHECKED_IN: "bg-blue-50 text-blue-700",
  COMPLETED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-600",
  ABSENT: "bg-slate-100 text-slate-600",
};

function fmt(d: string) {
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return d;
  }
}

export default function SuperAdminBookingsPage() {
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isError } = useAdminBookings({
    status: status || undefined,
    from: from || undefined,
    to: to || undefined,
    page,
    limit,
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          <ClipboardList className="h-6 w-6 text-[#1C63E7]" /> All Bookings
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Every patient booking across every clinic. {total > 0 && `${total} total.`}
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">Status</label>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1C63E7] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s || "All statuses"}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">From</label>
          <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1C63E7] dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">To</label>
          <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1C63E7] dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-[#1C63E7]" />
        </div>
      ) : isError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">Could not load bookings.</p>
      ) : items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">
          No bookings match your filters.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Clinic</th>
                  <th className="px-4 py-3">Doctor</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Token</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((a: any) => (
                  <tr key={a.id} className="bg-white dark:bg-slate-900">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-800 dark:text-slate-100">
                        {a.patient?.user?.name ?? a.patient?.name ?? "Patient"}
                      </p>
                      <p className="text-xs text-slate-400">{a.patient?.user?.phone ?? a.patient?.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {a.clinic?.clinicName}
                      {a.clinic?.city ? <span className="block text-xs text-slate-400">{a.clinic.city}</span> : null}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">Dr. {a.doctor?.user?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{fmt(a.date)}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">#{a.token}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{a.bookingSource}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_CLS[a.status] ?? "bg-slate-100 text-slate-600"}`}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-sm">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-600 disabled:opacity-40 dark:border-slate-700"
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </button>
            <span className="text-slate-500">Page {page} of {pages}</span>
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page >= pages}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-600 disabled:opacity-40 dark:border-slate-700"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
