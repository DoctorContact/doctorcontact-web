import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AppNotification } from "@doctor-contract/shared";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export function useUnreadCount() {
  const { user } = useAuth();
  return useQuery<number>({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      const { data } = await api.get("/notifications/unread-count");
      return data.data.count;
    },
    enabled: !!user,
    // No polling — useNotificationSocket keeps this cache live via the
    // `newNotification` socket event (Rule 5: absolutely no polling).
  });
}

export function useMyNotifications(enabled: boolean) {
  return useQuery<AppNotification[]>({
    queryKey: ["notifications", "me"],
    queryFn: async () => {
      const { data } = await api.get("/notifications/me");
      return data.data.items;
    },
    enabled,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.patch("/notifications/" + id + "/read");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.patch("/notifications/read-all");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
