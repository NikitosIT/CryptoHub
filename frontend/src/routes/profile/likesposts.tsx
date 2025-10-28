import ProfileLikedPosts from "@/pages/auth/profile/ProfileLikedPosts";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/profile/likesposts")({
  component: ProfileLikedPosts,
});
