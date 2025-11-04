import { useRoutesProtected } from "@/hooks/useRoutesProtected";
import VerifyEmailPage from "@/components/auth/VerifyEmailPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/verify")({
  component: () => {
    useRoutesProtected({ requireNoAuth: true, requireEmailSent: false });
    return <VerifyEmailPage />;
  },
});
