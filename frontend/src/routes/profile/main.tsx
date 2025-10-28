import { useAuthGuard } from "@/hooks/useAuthGuard";
import ProfileMain from "@/pages/auth/profile/ProfileMain";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/profile/main")({
  component: () => {
    useAuthGuard({ requireAuth: true });
    return <ProfileMain />;
  },
});
