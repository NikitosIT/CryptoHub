import ProfileMain from "@/components/profile/ProfileMain";
import { useRoutesProtected } from "@/hooks/useRoutesProtected";

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/profile/main")({
  component: () => {
    useRoutesProtected({ requireAuth: true });
    return <ProfileMain />;
  },
});
