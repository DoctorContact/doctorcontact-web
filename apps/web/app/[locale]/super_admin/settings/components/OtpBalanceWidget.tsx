"use client";

import { useState, useEffect } from "react";
import { MessageSquare, RefreshCw, AlertCircle } from "lucide-react";
import { GradientCard } from "@/components/ui/GradientCard";
import { fetchOtpBalance } from "@/lib/api"; // আপনার সেন্ট্রালাইজড API ইম্পোর্ট

export default function OtpBalanceWidget() {
  const [balanceData, setBalanceData] = useState<{ balance: number; currency: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBalance = async () => {
    setLoading(true);
    setError(null);
    try {
      // টোকেন হ্যান্ডেলিং এখন আপনার api.ts নিজেই করবে
      const data = await fetchOtpBalance();
      
      if (data.success) {
        setBalanceData(data.data);
      } else {
        setError("Failed to load balance");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Network error fetching balance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBalance();
  }, []);

  return (
    <GradientCard variant="slate">
      <div className="flex items-center justify-between p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              SMS API Balance
            </h3>
            <div className="mt-1 flex items-baseline gap-1">
              {loading ? (
                <div className="h-6 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              ) : error ? (
                <div className="flex items-center gap-1 text-rose-500">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-semibold">{error}</span>
                </div>
              ) : (
                <>
                  <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                    {balanceData?.balance}
                  </span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-500">
                    {balanceData?.currency}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={loadBalance}
          disabled={loading}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          title="Refresh Balance"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-emerald-500" : ""}`} />
        </button>
      </div>
    </GradientCard>
  );
}