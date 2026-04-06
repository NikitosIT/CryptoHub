import { createFileRoute } from '@tanstack/react-router';

import BackButton from '@/components/ui/BackButton';
import { ROUTES } from '@/constants/routesPath';
import { createRouteGuard } from '@/hooks/routeGuards';

import { useUserNotifications } from './-api/useUserNotifications';

export const Route = createFileRoute(ROUTES.PROFILE.NOTIFICATIONS)({
  beforeLoad: createRouteGuard({ requireAuth: true }),
  component: Notifications,
});

export function Notifications() {
  const { data: notifications, isLoading } = useUserNotifications();
  if (isLoading) return <p className="text-center">Loading...</p>;
  return (
    <div className="min-h-screen">
      <BackButton />
      <div className="max-w-2xl px-4 py-8 mx-auto">
        <h1 className="mb-6 text-2xl font-bold text-white">Notifications</h1>

        {!notifications || notifications.length === 0 ? (
          <div className="p-12 text-center border rounded-xl border-zinc-700 bg-zinc-800/50">
            <div className="flex items-center justify-center mx-auto mb-4 rounded-full size-16 bg-zinc-700">
              <img
                className="size-10"
                src="\public\others\telegram.png"
                alt="notitfication"
              />
            </div>
            <p className="text-zinc-400">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="p-5 transition-all border group rounded-xl border-zinc-700 bg-zinc-800/50 hover:border-zinc-600 hover:bg-zinc-800"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    {notification.send_to_all ? (
                      <>
                        <div className="flex items-center justify-center rounded-full bg-green-500/60 size-8">
                          <img
                            className="size-5"
                            src="\public\others\telegram.png"
                            alt="notification"
                          />
                        </div>
                        <span className="text-xs font-medium text-green-400">
                          CryptoHub
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-center rounded-full size-8 bg-blue-500/20">
                          <img
                            className="size-5"
                            src="\public\others\admin.png"
                            alt="admin"
                          />
                        </div>
                        <span className="text-xs font-medium text-blue-400">Admin</span>
                      </>
                    )}
                  </div>
                </div>
                {notification.msg ? (
                  <p className="mb-3 text-sm leading-relaxed text-zinc-200">
                    {notification.msg}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
