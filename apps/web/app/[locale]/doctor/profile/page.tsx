"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  useDoctorReceivedRequests,
  useDoctorSentRequests,
} from "@/lib/hooks/useDoctor";

import { ProfileHeader } from "./components/ProfileHeader";
import { ProfileAvatar } from "./components/ProfileAvatar";
import { ProfileInformation } from "./components/ProfileInformation";
import { ProfileStats } from "./components/ProfileStats";
import { ProfilePhotoModal } from "./components/ProfilePhotoModal";
import { ProfileSkeleton } from "./components/ProfileSkeleton";
import { ProfileError } from "./components/ProfileError";

export default function DoctorProfilePage() {
  const { user, loading: loadingAuth, refetchUser } = useAuth();
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  // Queries
  const {
    data: receivedRequests = [],
    isLoading: loadingReceived,
    isFetching: fetchingReceived,
    isError: isErrorReceived,
    error: errorReceived,
    refetch: refetchReceived,
  } = useDoctorReceivedRequests();

  const {
    data: sentRequests = [],
    isLoading: loadingSent,
    isFetching: fetchingSent,
    isError: isErrorSent,
    error: errorSent,
    refetch: refetchSent,
  } = useDoctorSentRequests();

  const isInitialLoading = loadingAuth || loadingReceived || loadingSent;
  const isRefreshing = fetchingReceived || fetchingSent;

  // Derived metrics and practice meta
  const {
    activeClinicsCount,
    acceptedAssociationsCount,
    pendingRequestsCount,
    specialization,
    qualification,
  } = useMemo(() => {
    const allRequests = [...receivedRequests, ...sentRequests];

    const accepted = allRequests.filter((r) => r.status === "APPROVED");
    const pending = allRequests.filter((r) => r.status === "PENDING");

    // Extract unique active clinic IDs
    const clinicSet = new Set<string>();
    accepted.forEach((r) => {
      const cId = r.clinicId || r.clinic?.id;
      if (cId) clinicSet.add(cId);
    });

    return {
      activeClinicsCount: clinicSet.size,
      acceptedAssociationsCount: accepted.length,
      pendingRequestsCount: pending.length,
      specialization: null as string | null,
      qualification: null as string | null,
    };
  }, [receivedRequests, sentRequests]);

  const handleRefreshAll = () => {
    refetchUser();
    refetchReceived();
    refetchSent();
  };

  // Initial loading state
  if (isInitialLoading) {
    return <ProfileSkeleton />;
  }

  // Error state
  if (isErrorReceived || isErrorSent) {
    const errorMsg =
      errorReceived instanceof Error
        ? errorReceived.message
        : errorSent instanceof Error
        ? errorSent.message
        : undefined;

    return <ProfileError onRetry={handleRefreshAll} message={errorMsg} />;
  }

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <ProfileHeader
        name={user?.name || "Doctor"}
        role={user?.role || "DOCTOR"}
        isRefreshing={isRefreshing}
        onRefresh={handleRefreshAll}
      />

      {/* 2. Avatar & Identity Banner */}
      <ProfileAvatar
        name={user?.name || "Doctor"}
        // 🔴 FIX: (user as any) ব্যবহার করুন
        photoUrl={(user as any)?.avatar || null} 
        onOpenPhotoModal={() => setIsPhotoModalOpen(true)}
      />

      {/* 3. Real Derived Statistics */}
      <ProfileStats
        activeClinicsCount={activeClinicsCount}
        acceptedAssociationsCount={acceptedAssociationsCount}
        pendingRequestsCount={pendingRequestsCount}
      />

      {/* 4. Verified Account Information */}
      <ProfileInformation
        user={user}
        specialization={specialization}
        qualification={qualification}
      />

      {/* 5. Profile Photo Upload Modal */}
      <ProfilePhotoModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        onSuccess={() => handleRefreshAll()}
      />
    </div>
  );
}
