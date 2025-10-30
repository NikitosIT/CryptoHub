import { toggleReactions } from "@/lib/api-likes";
import { useDislikesStore } from "@/store/useDislikeStore";
import { useLikesStore } from "@/store/useLikesStore";
import type { ReactionButtonProps } from "@/types/db";
import { useState } from "react";

export default function DislikeButton({ postId, user }: ReactionButtonProps) {
  const { dislikes, toggleDislikeLocal, removeDislike, isDisliked } =
    useDislikesStore();
  const { isLiked, toggleLikeLocal, removeLike } = useLikesStore();

  const [loading, setLoading] = useState(false);
  const disliked = isDisliked(postId);
  const dislikeCount = dislikes.filter((d) => d.post_id === postId).length;

  const handleDislike = async () => {
    if (!user) {
      alert("👤 Только зарегистрированные пользователи могут ставить дизлайки");
      return;
    }

    toggleDislikeLocal(postId, !disliked);

    if (isLiked(postId)) {
      toggleLikeLocal(postId, false);
      removeLike(postId);
    }

    try {
      setLoading(true);
      await toggleReactions(postId, "dislike", user.id);

      if (disliked) removeDislike(postId);
    } catch (err) {
      console.error("Ошибка toggleReaction:", err);

      toggleDislikeLocal(postId, disliked);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDislike}
      disabled={loading}
      className={`transition-colors duration-200 ${disliked ? "text-blue-500" : "text-gray-400"}`}
    >
      👎 {dislikeCount}
    </button>
  );
}
