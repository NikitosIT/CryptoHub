import ProfileFavoriteVideos from "@/pages/auth/profile/ProfileFavoriteVideos";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/profile/favoritevideos")({
  component: ProfileFavoriteVideos,
});
