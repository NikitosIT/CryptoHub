import type { PostId } from '@/types/db';

export type UserReaction = 'like' | 'dislike' | undefined | null;

export interface ToggleReactionsParams {
  postId: PostId;
  reactionType: UserReaction;
}
