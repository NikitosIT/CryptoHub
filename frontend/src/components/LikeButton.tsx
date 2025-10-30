import { toggleReactions } from "@/lib/api-likes";
import { useDislikesStore } from "@/store/useDislikeStore";
import { useLikesStore } from "@/store/useLikesStore";
import type { ReactionButtonProps } from "@/types/db";
import { useState } from "react";

export default function LikeButton({ postId, user }: ReactionButtonProps) {
  const { likes, toggleLikeLocal, removeLike, isLiked } = useLikesStore();
  const { isDisliked, toggleDislikeLocal, removeDislike } = useDislikesStore();

  const [loading, setLoading] = useState(false);
  const liked = isLiked(postId);
  const likeCount = likes.filter((l) => l.post_id === postId).length;

  const handleLike = async () => {
    if (!user) {
      alert("👤 Только зарегистрированные пользователи могут ставить лайки");
      return;
    }

    toggleLikeLocal(postId, !liked);

    if (isDisliked(postId)) {
      toggleDislikeLocal(postId, false);
      removeDislike(postId);
    }

    try {
      setLoading(true);
      await toggleReactions(postId, "like", user.id);

      if (liked) removeLike(postId);
    } catch (err) {
      console.error("Ошибка toggleReaction:", err);

      toggleLikeLocal(postId, liked);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`transition-colors duration-200 ${liked ? "text-red-500" : "text-gray-400"}`}
    >
      ❤️ {likeCount}
    </button>
  );
}
