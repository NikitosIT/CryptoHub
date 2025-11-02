import ProfileUnlikedPosts from "@/components/profile/ProfileUnlikedPosts";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/profile/unlikedposts")({
    component: ProfileUnlikedPosts,
});
//unliked
