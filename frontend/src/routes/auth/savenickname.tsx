import { useRoutesProtected } from "@/hooks/useRoutesProtected";
import SaveNickname from "@/components/auth/SaveNickname";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/savenickname")({
  component: () => {
    useRoutesProtected({ requireAuth: true, requireVerifiedEmail: true });
    return <SaveNickname />;
  },
});
