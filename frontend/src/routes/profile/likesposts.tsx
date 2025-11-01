import ProfileLikedPosts from "@/pages/profile/ProfileLikedPosts";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/profile/likesposts")({
  component: ProfileLikedPosts,
});

//liked
