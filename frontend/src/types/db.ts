import type { MessageEntity } from '@telegraf/entity/types/types';

import type { UserReaction } from '@/routes/posts/-reactions/-types/reactions-type';

export type TelegramPost = {
  id: number;
  text_caption: string | null;
  text_entities: MessageEntity[] | null;
  media: { type: string; url: string; file_name: string; mime_type: string }[] | null;
  tg_author_id: number | null;
  author_name: string;
  author_link: string;
  like_count: number | null;
  dislike_count: number | null;
  comments_count: number | null;
  reaction_type: UserReaction;
  user_reaction: UserReaction;
  is_favorite: boolean;
  created_at: string | null;
};

export type PostId = TelegramPost['id'];
export type OTPCode = string;
export type Email = string;
export type NullableEmail = Email | null;
export type Error = string;
