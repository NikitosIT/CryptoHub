import { useRoutesProtected } from "@/hooks/useRoutesProtected";
import ProfileMain from "@/pages/profile/ProfileMain";

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/profile/main")({
  component: () => {
    useRoutesProtected({ requireAuth: true });
    return <ProfileMain />;
  },
});
