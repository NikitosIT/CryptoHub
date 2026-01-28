import { createFileRoute } from "@tanstack/react-router";

import { createRouteGuard } from "@/hooks/routeGuards";
import { useAuthCallback } from "@/routes/auth/-hooks/useAuthCallback";

export const Route = createFileRoute("/auth/callback")({
  beforeLoad: createRouteGuard({
    requireNoAuth: false,
  }),
  component: Callback,
});

function Callback() {
  const { isLoading } = useAuthCallback();

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-black">
      <div className="w-full max-w-md p-8 bg-gray-900 border border-orange-500/20 rounded-xl">
        <div className="text-center text-white">
          {isLoading ? (
            <div className="flex flex-col items-center gap-4">
              <span className="inline-block w-8 h-8 border-2 border-white rounded-full border-t-transparent animate-spin" />
              <p>Verifying authentication...</p>
            </div>
          ) : (
            <p>Redirecting...</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Callback;
