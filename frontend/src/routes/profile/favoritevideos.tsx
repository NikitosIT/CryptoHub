import ProfileFavoritesPosts from "@/components/profile/ProfileFavoritePosts";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/profile/favoritevideos")({
  component: ProfileFavoritesPosts,
});
//favorites
