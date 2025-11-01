import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useRoutesProtected } from "@/hooks/useRoutesProtected";

export const Route = createFileRoute("/profile")({
  component: () => {
    useRoutesProtected({ requireAuth: true });

    return <Outlet />;
  },
});
