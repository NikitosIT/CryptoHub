import { useQuery } from '@tanstack/react-query';

import { api } from '@/api';
export const notificationsQueryKey = () => ['notifications'] as const;

export type UserNotifications = {
  id: number;
  send_to: string | null;
  send_to_all: boolean;
  msg: string | null;
  created_at: string;
};

async function userNotifications(): Promise<UserNotifications[]> {
  return api.profile.getNotifications();
}

export const useUserNotifications = () => {
  return useQuery<UserNotifications[]>({
    queryKey: notificationsQueryKey(),
    queryFn: userNotifications,
    staleTime: Infinity,
  });
};
