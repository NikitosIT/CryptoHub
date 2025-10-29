import { useState } from "react";
import { useLikesStore } from "@/store/useLikesStore";
import { toggleLike } from "@/lib/api-likes";
import type { LikeButtonProps } from "@/types/db";

export default function LikeButton({
  postId,
  user,
  likeCount: initialCount,
}: LikeButtonProps) {
  const { likes, toggleLikeLocal } = useLikesStore();
  const [loading] = useState(false);

  const [likeCount, setLikeCount] = useState<number>(initialCount ?? 0);

  const isLiked = likes.some((l) => l.post_id === postId);

  const handleLike = async () => {
    if (!user) {
      alert("🔐 Только зарегистрированные пользователи могут ставить лайки!");
      return;
    }

    toggleLikeLocal(postId, !isLiked);
    setLikeCount((prev) => Math.max(0, prev + (isLiked ? -1 : 1)));

    try {
      const res = await toggleLike(postId);
      setLikeCount((prev) => Math.max(0, prev + (res.liked ? 0 : 0)));
    } catch (err) {
      console.error("Ошибка toggleLike:", err);
      toggleLikeLocal(postId, isLiked);
      setLikeCount((prev) => Math.max(0, prev + (isLiked ? 1 : -1)));
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`transition-all ${isLiked ? "text-red-500" : "text-gray-400"}`}
    >
      ❤️ {isNaN(likeCount) ? 0 : likeCount}
    </button>
  );
}
