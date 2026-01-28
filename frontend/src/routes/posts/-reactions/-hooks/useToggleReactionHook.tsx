import type { TelegramPost } from "@/types/db";

type UserReaction = "like" | "dislike" | null;
export function toggleReaction(
  post: TelegramPost,
  type: "like" | "dislike"
): TelegramPost {
  const prev = post.user_reaction;

  let like = post.like_count ?? 0;
  let dislike = post.dislike_count ?? 0;
  let next: UserReaction = null;

  if (type === "like") {
    if (prev === "like") {
      like--;
    } else {
      like++;
      if (prev === "dislike") dislike--;
      next = "like";
    }
  }

  if (type === "dislike") {
    if (prev === "dislike") {
      dislike--;
    } else {
      dislike++;
      if (prev === "like") like--;
      next = "dislike";
    }
  }

  return {
    ...post,
    user_reaction: next,
    like_count: like,
    dislike_count: dislike,
  };
}
