import { useToggleReaction } from "@/hooks/useToggleReaction";
import type { TelegramPost, User } from "@/types/db";

export function ReactionButton({
  post,
  user,
}: {
  post: TelegramPost;
  user: User | null;
}) {
  const mutation = useToggleReaction();

  const handleLike = () => {
    if (!user)
      return alert(
        "⚠️ Только зарегистрированные пользователи могут ставить лайки"
      );
    mutation.mutate({ postId: post.id, reactionType: "like", userId: user.id });
  };

  const handleDislike = () => {
    if (!user)
      return alert(
        "⚠️ Только зарегистрированные пользователи могут ставить дизлайки"
      );
    mutation.mutate({
      postId: post.id,
      reactionType: "dislike",
      userId: user.id,
    });
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleLike}
        disabled={mutation.isPending}
        className={`flex items-center gap-1 px-3 py-1 rounded-full transition-all duration-200 border 
          ${
            post.user_reaction === "like"
              ? "bg-green-500 border-green-600 text-white hover:bg-green-600"
              : "bg-transparent border-gray-500 text-gray-400 hover:bg-green-200 hover:text-green-600"
          }`}
      >
        👍 <span className="text-sm">{post.like_count}</span>
      </button>

      <button
        onClick={handleDislike}
        disabled={mutation.isPending}
        className={`flex items-center gap-1 px-3 py-1 rounded-full transition-all duration-200 border 
          ${
            post.user_reaction === "dislike"
              ? "bg-red-500 border-red-600 text-white hover:bg-red-600"
              : "bg-transparent border-gray-500 text-gray-400 hover:bg-red-200 hover:text-red-600"
          }`}
      >
        👎 <span className="text-sm">{post.dislike_count}</span>
      </button>
    </div>
  );
}
