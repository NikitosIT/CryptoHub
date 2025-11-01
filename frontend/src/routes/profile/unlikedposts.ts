import ProfileUnlikedPosts from "@/pages/profile/ProfileUnlikedPosts";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/profile/unlikedposts")({
    component: ProfileUnlikedPosts,
});
//unliked
