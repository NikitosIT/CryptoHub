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
    like_count: string | null;
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
}

export interface LikeResponse {
    liked: boolean;
}

export interface LikeButtonProps {
    postId: number;
    user: User | null;
    likeCount: number | null;
}
