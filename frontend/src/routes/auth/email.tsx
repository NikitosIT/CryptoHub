import EmailAuthPage from "@/components/auth/AuthPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/email")({
  component: EmailAuthPage,
});
