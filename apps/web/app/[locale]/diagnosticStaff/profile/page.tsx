"use client";

import { Loader2, UserRound, Building2, Phone, Mail, MapPin } from "lucide-react";
import { useStaffProfile } from "@/lib/hooks/useReferrals";

export default function DiagnosticStaffProfilePage() {
  const { data: profile, isLoading, isError } = useStaffProfile();

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-[#1C63E7]" />
      </div>
    );
  }

  if (isError || !profile) {
    return <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">Could not load your profile.</p>;
  }

  const c = profile.diagnosticCenter;

  const Row = ({ icon: Icon, label, value }: { icon: typeof Phone; label: string; value?: string | null }) =>
    value ? (
      <div className="flex items-start gap-2 py-2">
        <Icon className="mt-0.5 h-4 w-4 text-slate-400" />
        <div>
          <p className="text-xs text-slate-400">{label}</p>
          <p className="font-semibold text-slate-800 dark:text-slate-100">{value}</p>
        </div>
      </div>
    ) : null;

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <h1 className="text-2xl font-extrabold tracking-tight text-[#0F1B33] dark:text-white">Profile</h1>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100">
          <UserRound className="h-4 w-4 text-[#1C63E7]" /> Staff account
        </h2>
        <div className="mt-2 divide-y divide-slate-100 dark:divide-slate-800">
          <Row icon={UserRound} label="Name" value={profile.user?.name} />
          <Row icon={Mail} label="Email" value={profile.user?.email} />
          <Row icon={Phone} label="Phone" value={profile.user?.phone} />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100">
          <Building2 className="h-4 w-4 text-[#16A34A]" /> Diagnostic centre
        </h2>
        <div className="mt-2 divide-y divide-slate-100 dark:divide-slate-800">
          <Row icon={Building2} label="Centre" value={c?.centerName} />
          <Row icon={MapPin} label="Location" value={[c?.address, c?.city].filter(Boolean).join(", ")} />
          <Row icon={Phone} label="Centre phone" value={c?.phone} />
        </div>
      </div>
    </div>
  );
}
