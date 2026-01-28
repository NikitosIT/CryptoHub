export type MessageEntity = {
  type:
    | "bold"
    | "italic"
    | "underline"
    | "strikethrough"
    | "spoiler"
    | "code"
    | "pre"
    | "text_link"
    | "text_mention"
    | "url"
    | "email"
    | "phone_number"
    | "mention"
    | "hashtag"
    | "cashtag"
    | "bot_command"
    | "custom_emoji";
  offset: number;
  length: number;
  url?: string;
  language?: string;
  user?: { id: number; username?: string };
  custom_emoji_id?: string;
};

export type TelegramPost = {
  id: number;
  text_caption: string | null;
  text_entities: MessageEntity[] | MessageEntity | null;
  media:
    | { type: string; url: string; file_name: string; mime_type: string }[]
    | null;
  tg_author_id: number | null;
  author_name: string;
  author_link: string;
  like_count: number | null;
  dislike_count: number | null;
  comments_count: number | null;
  reaction_type: "like" | "dislike" | null;
  user_reaction: "like" | "dislike" | null;
  is_favorite: boolean;
  created_at: string | null;
};

export type TgAuthor = {
  name: string | null;
  link: string | null;
  tg_author_id: number | null;
};

export interface ImageModalProps {
  url: string;
  onClose: () => void;
}

export type MediaGridProps = {
  media: TelegramPost["media"];
  onPreview?: (url: string | null) => void;
};

export interface User {
  id: string;
  email?: string;
  avatar_url?: string;
}
export interface LikeResponse {
  liked: boolean;
}
export interface ReactionButtonProps {
  postId: number;
  user: User | null;
  likeCount?: number | null;
  dislikeCount?: number | null;
}

export type CommentUser = {
  raw_user_meta_data?: {
    nickname?: string | null;
    avatar_url?: string | null;
  };
};

export type CommentMedia = {
  type: "photo" | "video";
  url: string;
  thumbnail_url?: string;
};

export type Comment = {
  id: number;
  user_id: string | null;
  post_id: number;
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

export type Token = {
  label: string;
  value: string;
  cmc: string;
  coinglass: string;
  homelink: string;
  xlink: string;
};

export type Author = {
  label: string;
  id: number;
};

export type PostMode = "all" | "liked" | "disliked" | "favorites";
