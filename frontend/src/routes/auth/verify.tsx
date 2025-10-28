import { useAuthGuard } from "@/hooks/useAuthGuard";
import VerifyEmailPage from "@/pages/auth/VerifyEmailPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/verify")({
  component: () => {
    useAuthGuard({ requireNoAuth: true, requireEmailSent: true });
    return <VerifyEmailPage />;
  },
});
