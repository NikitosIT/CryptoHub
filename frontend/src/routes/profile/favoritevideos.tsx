import ProfileFavoritePosts from "@/pages/profile/ProfileFavoritePosts";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/profile/favoritevideos")({
  component: ProfileFavoritePosts,
});
//favorites
