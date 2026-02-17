import { useQuery } from "@tanstack/react-query";

import { api, type UserNotifications } from "@/api";
export const notificationsQueryKey = () => ["notifications"] as const;

function userNotifications(): Promise<UserNotifications[]> {
  return api.profile.getNotifications();
}

export const useUserNotifications = () => {
  return useQuery<UserNotifications[]>({
    queryKey: notificationsQueryKey(),
    queryFn: userNotifications,
    staleTime: Infinity,
  });
};
