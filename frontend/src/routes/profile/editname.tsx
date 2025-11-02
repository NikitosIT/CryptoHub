import ProfileEditName from "@/components/profile/ProfileEditName";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/profile/editname")({
  component: ProfileEditName,
});
