import { useUserStore } from "@/store/useUserStore";
import { useToggleFavorite } from "@/hooks/useToggleFavorite";
import type { TelegramPost } from "@/types/db";

interface FavoriteProps {
  post: TelegramPost;
}

export default function FavoriteButton({ post }: FavoriteProps) {
  const { user } = useUserStore();
  const mutation = useToggleFavorite();

  if (!user) return null;

  return (
    <button
      onClick={() => mutation.mutate({ postId: post.id, userId: user.id })}
      disabled={mutation.isPending}
      className={`transition-all duration-200 ${
        post.is_favorite
          ? "text-yellow-400 scale-110"
          : "text-gray-400 hover:scale-110"
      }`}
    >
      {post.is_favorite ? "⭐" : "☆"}
    </button>
  );
}
