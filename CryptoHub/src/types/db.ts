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
    media: { type: string; url: string }[] | null;
    created_at: string | null;
};
