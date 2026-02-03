import { useAuthState } from "@/routes/auth/-hooks/useAuthState";
import { useToggleFavorite } from "@/routes/posts/-reactions/-api/useToggleFavorite";
import type { TelegramPost } from "@/types/db";

interface FavoriteProps {
  post: TelegramPost;
}

export default function FavoriteButton({ post }: FavoriteProps) {
  const { user } = useAuthState({
    checkTwoFactor: false,
  });

  const mutation = useToggleFavorite();

  const isFavorite = post.is_favorite;

  const handleClick = () => {
    if (!user?.id) return;
    mutation.mutate({ postId: post.id, userId: user.id });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      className={`flex items-center justify-center p-1.5 cursor-pointer rounded-full transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed ${
        isFavorite ? "bg-yellow-400" : "bg-transparent"
      }`}
    >
      <img
        src="/others/favorites.svg"
        alt=""
        aria-hidden="true"
        className="w-5 h-5 transition-all duration-200 "
        style={{
          filter: isFavorite
            ? "brightness(0) invert(1)"
            : "brightness(0) saturate(100%) invert(60%)",
        }}
      />
    </button>
  );
}
