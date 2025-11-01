import { useReactionsStore } from "@/store/useReactionStore";
import type { TelegramPost, User } from "@/types/db";

interface ReactionButtonProps {
  post: TelegramPost;
  user: User | null;
}

export function ReactionButton({ post, user }: ReactionButtonProps) {
  const {
    toggleLike,
    toggleDislike,
    likedPosts,
    dislikedPosts,
    likeCounts,
    dislikeCounts,
  } = useReactionsStore();

  const liked = likedPosts.has(post.id);
  const disliked = dislikedPosts.has(post.id);

  const likeCount = likeCounts[post.id] ?? post.like_count ?? 0;
  const dislikeCount = dislikeCounts[post.id] ?? post.dislike_count ?? 0;

  const handleLike = () => {
    if (!user) {
      alert("⚠️ Только зарегистрированные пользователи могут ставить лайки");
      return;
    }
    toggleLike(post.id, user.id);
  };

  const handleDislike = () => {
    if (!user) {
      alert("⚠️ Только зарегистрированные пользователи могут ставить дизлайки");
      return;
    }
    toggleDislike(post.id, user.id);
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleLike}
        className={`transition-colors duration-200 ${
          liked ? "text-red-500" : "text-gray-400"
        }`}
      >
        ❤️ {likeCount}
      </button>

      <button
        onClick={handleDislike}
        className={`transition-colors duration-200 ${
          disliked ? "text-blue-500" : "text-gray-400"
        }`}
      >
        💀 {dislikeCount}
      </button>
    </div>
  );
}

//UserReactionsButton
