import type { Request } from "express";

export type ReactionStatus = "liked" | "disliked" | null;

export type ToggleReactionParams = {
  userId: string;
  postId: number;
  reactionType: "LIKE" | "DISLIKE";
};

export type ToggleReactionResponse = {
  postId: number;
  status: ReactionStatus;
  likeCount: number;
  dislikeCount: number;
};

export type ToggleReactionRequest = Request<
  { postId: string },
  ToggleReactionResponse,
  { reactionType: "LIKE" | "DISLIKE" }
>;
