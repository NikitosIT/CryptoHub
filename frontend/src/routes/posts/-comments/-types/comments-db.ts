import type { PostId } from '@/types/db';

export interface MutationContext {
  previousComments: CommentWithReplies[] | undefined;
  queryKey: readonly ['comments', number];
  blobUrls: string[];
  optimisticCommentId: number;
}

//

export type CommentUser = {
  raw_user_meta_data?: {
    nickname?: string | null;
    avatar_url?: string | null;
  };
};

//

export type TypeMedia = 'photo' | 'video';

//

export type CommentMedia = {
  type: TypeMedia;
  url: string;
  thumbnail_url?: string;
};

//

export type Comment = {
  id: number;
  user_id: string | null;
  post_id: PostId;
  parent_comment_id: number | null;
  text: string;
  media: CommentMedia[] | null;
  created_at: string;
  updated_at: string;
  like_count: number;
  user_has_liked?: boolean;
  user?: CommentUser;
};

export type CommentWithReplies = Comment & {
  replies?: CommentWithReplies[];
};

//

export interface CommentProps {
  comment: CommentWithReplies;
}
