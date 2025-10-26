import ProfilePage from "@/components/auth/Profile";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/profile")({
  component: ProfilePage,
});
