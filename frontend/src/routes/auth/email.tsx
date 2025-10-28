import { useAuthGuard } from "@/hooks/useAuthGuard";
import EmailAuthPage from "@/pages/auth/AuthPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/email")({
  component: () => {
    useAuthGuard({ requireNoAuth: true });
    return <EmailAuthPage />;
  },
});
