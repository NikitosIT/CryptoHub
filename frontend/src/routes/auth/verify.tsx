import { useRoutesProtected } from "@/hooks/useRoutesProtected";
import VerifyEmailPage from "@/pages/auth/VerifyEmailPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/verify")({
  component: () => {
    useRoutesProtected({ requireNoAuth: true, requireEmailSent: true });
    return <VerifyEmailPage />;
  },
});
