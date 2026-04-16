import type { PostId } from '@/types';

export type UserReaction = 'like' | 'dislike' | undefined | null;

export type ToggleReactionsParams = {
  postId: PostId;
  reactionType: UserReaction;
};
