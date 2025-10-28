import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export const Route = createFileRoute("/profile")({
  component: () => {
    useAuthGuard({ requireAuth: true });

    return <Outlet />;
  },
});
