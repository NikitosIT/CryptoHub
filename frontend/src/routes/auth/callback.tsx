import AuthCallback from "@/components/auth/AuthCallback";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
});
