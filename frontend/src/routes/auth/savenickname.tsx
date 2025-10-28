import { useAuthGuard } from "@/hooks/useAuthGuard";
import SaveNickname from "@/pages/auth/SaveNickname";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/savenickname")({
  component: () => {
    useAuthGuard({ requireAuth: true, requireVerifiedEmail: true });
    return <SaveNickname />;
  },
});
