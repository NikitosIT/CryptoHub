import { supabase } from "../shared/supabaseApi.ts";

const TG_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;

const MEDIA_KEYS = [
  "photo",
  "video",
  "animation",
  "document",
  "audio",
  "voice",
  "video_note",
  "sticker",
] as const;

async function uploadTelegramFileToSupabase(
  file_id: string,
  type: string,
  file_name?: string,
  mime_type?: string,
) {
  const res = await fetch(
    `https://api.telegram.org/bot${TG_TOKEN}/getFile?file_id=${file_id}`,
  );
  const info = await res.json();
  const file_path = info.result?.file_path;
  if (!file_path) throw new Error("No file_path from Telegram");

  const fileRes = await fetch(
    `https://api.telegram.org/file/bot${TG_TOKEN}/${file_path}`,
  );
  const buffer = await fileRes.arrayBuffer();

  const ext = file_path.split(".").pop() || "dat";
  const filename = `posts/${file_id}.${ext}`;

  const { error } = await supabase.storage
    .from("tg_media")
    .upload(filename, buffer, {
      contentType: mime_type ||
        fileRes.headers.get("content-type") ||
        "application/octet-stream",
      upsert: true,
    });
  if (error) throw error;

  const { data } = supabase.storage.from("tg_media").getPublicUrl(filename);

  return {
    type,
    url: data.publicUrl,
    file_name: file_name || `${file_id}.${ext}`,
    mime_type: mime_type || fileRes.headers.get("content-type"),
  };
}

export async function collectMedia(msg: any) {
  const media: {
    type: string;
    url: string;
    file_name?: string;
    mime_type?: string | null;
  }[] = [];

  for (const key of MEDIA_KEYS) {
    const content = msg[key];
    if (!content) continue;

    if (Array.isArray(content)) {
      const file = content.at(-1);
      if (file?.file_id) {
        const uploaded = await uploadTelegramFileToSupabase(
          file.file_id,
          key,
          file.file_name,
          file.mime_type,
        );
        media.push(uploaded);
      }
    } else if (content.file_id) {
      const uploaded = await uploadTelegramFileToSupabase(
        content.file_id,
        key,
        content.file_name,
        content.mime_type,
      );
      media.push(uploaded);
    }
  }

  return media;
}
