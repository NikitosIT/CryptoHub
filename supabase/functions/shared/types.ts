export type FileID = { file_id: string };

export type PhotoSize = FileID & {
  file_unique_id: string;
  width: number;
  height: number;
  file_size?: number;
};

export type MessageMediaFields = {
  photo?: PhotoSize[];
  video?: FileID;
  document?: FileID;
  animation?: FileID;
  sticker?: FileID;
  video_note?: FileID;
};

export type Chat = {
  id: number;
  type?: string;
  title?: string;
  username?: string;
};

export type Message = {
  message_id: number;
  chat: Chat;
  text?: string;
  caption?: string;
  media_group_id?: string;
  from?: {
    id: number;
    is_bot?: boolean;
    username?: string;
    first_name?: string;
  };
  sender_chat?: Chat;
  forward_from_chat?: Chat;
  forward_from_message_id?: number;
  date?: number;
  edit_date?: number;
} & MessageMediaFields;

export type Update = {
  update_id?: number;
  message?: Message;
  channel_post?: Message;
  edited_message?: Message;
  edited_channel_post?: Message;
};

export type TgEntity = {
  type: string;
  offset: number; // UTF-16 units
  length: number; // UTF-16 units
  url?: string;
  user?: {
    id: number;
    username?: string;
    first_name?: string;
    last_name?: string;
  };
  language?: string;
  custom_emoji_id?: string;
};
export interface ExtendedMessage extends Message {
  entities?: TgEntity[];
  caption_entities?: TgEntity[];
}

// https://api.telegram.org/bot8210803969:AAGP_nVS_lRDc2WpqGNbpYLa0Hzzl7b-N3s/deleteWebhook
// https://api.telegram.org/bot8210803969:AAGP_nVS_lRDc2WpqGNbpYLa0Hzzl7b-N3s/setWebhook?url=https://figtowlbngryusuutsfo.functions.supabase.co/telegram-bot
// https://api.telegram.org/bot8210803969:AAGP_nVS_lRDc2WpqGNbpYLa0Hzzl7b-N3s/getWebhookInfo
