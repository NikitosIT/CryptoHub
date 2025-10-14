import { createClient } from "supabase";

const supabase = createClient(
  Deno.env.get("MY_SUPABASE_URL")!,
  Deno.env.get("MY_SUPABASE_SERVICE_ROLE_KEY")!,
);

const TG_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;

const MEDIA_KEYS = ["photo", "video"] as const;

async function uploadTelegramFileToSupabase(file_id: string, type: string) {
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

  const ext = file_path.split(".").pop();
  const filename = `posts/${file_id}.${ext}`;

  const { error } = await supabase.storage
    .from("telegram_media")
    .upload(filename, buffer, {
      contentType: fileRes.headers.get("content-type") ||
        "application/octet-stream",
      upsert: true,
    });
  if (error) throw error;

  const { data } = supabase.storage
    .from("telegram_media")
    .getPublicUrl(filename);

  return { type, url: data.publicUrl };
}

export async function collectMedia(msg: any) {
  const media: { type: string; url: string }[] = [];

  for (const key of MEDIA_KEYS) {
    const content = msg[key];
    if (!content) continue;

    if (Array.isArray(content)) {
      const file_id = content.at(-1)?.file_id;
      if (file_id) {
        const file = await uploadTelegramFileToSupabase(file_id, key);
        media.push(file);
      }
    } else if (content.file_id) {
      const file = await uploadTelegramFileToSupabase(content.file_id, key);
      media.push(file);
    }
  }

  return media;
}
