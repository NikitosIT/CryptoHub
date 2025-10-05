// functions/telegram-bot/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("MY_SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("MY_SUPABASE_SERVICE_ROLE_KEY")!;
const TG_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;

const sb = createClient(SUPABASE_URL, SERVICE_KEY);

async function readUpdate(req: Request) {
  try {
    const raw = await req.text();
    console.log("RAW:", raw);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error("JSON parse error:", e);
    return null;
  }
}

function pickMessage(update: any) {
  return update?.message || update?.channel_post || update?.edited_message || null;
}

async function tgSend(chat_id: number, text: string) {
  await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id, text }),
  });
}

// Если нужно реальные ссылки на фото — нужен getFile(file_id) → file_path
async function resolvePhotoLinks(photos: any[] = []) {
  const links: string[] = [];
  for (const p of photos) {
    const fileId = p?.file_id;
    if (!fileId) continue;
    const r = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/getFile?file_id=${fileId}`);
    const j = await r.json();
    const path = j?.result?.file_path;
    if (path) links.push(`https://api.telegram.org/file/bot${TG_TOKEN}/${path}`);
  }
  return links;
}

serve(async (req) => {
  const update = await readUpdate(req);
  if (!update) {
    console.log("Empty update");
    return new Response("ok", { status: 200 });
  }

  const msg = pickMessage(update);
  if (!msg) {
    console.log("No message-like object:", update);
    return new Response("ok", { status: 200 });
  }

  const chatId = msg.chat?.id;
  const text: string = msg.caption ?? msg.text ?? "";
  const links = Array.from(text.matchAll(/https?:\/\/\S+/g)).map((m) => m[0]);

  // фото (берём наибольшее, и резолвим в прямые ссылки)
  const photos = Array.isArray(msg.photo) && msg.photo.length ? [msg.photo.at(-1)] : [];
  const images = await resolvePhotoLinks(photos);

  // автор/канал
  const fromChat = msg.forward_from_chat ?? msg.sender_chat ?? msg.chat ?? {};
  const author_name = fromChat.title || [fromChat.first_name, fromChat.last_name].filter(Boolean).join(" ") || "Unknown";
  const author_username = fromChat.username ? `@${fromChat.username}` : null;
  const author_link = fromChat.username ? `https://t.me/${fromChat.username}` : null;

  try {
    // 3) сохраняем в таблицу posts
    const { error } = await sb.from("posts").insert({
      message_id: msg.message_id,
      author_name,
      author_username,
      author_link,
      text,
      links,
      images,
    });

    if (error) {
      console.error("Supabase insert error:", error);
      if (chatId) await tgSend(chatId, "❌ Ошибка при сохранении поста");
    } else {
      if (chatId) await tgSend(chatId, "✅ Обработано");
    }
  } catch (e) {
    console.error("Handler error:", e);
    if (chatId) await tgSend(chatId, "❌ Ошибка обработки");
  }

  // 4) ВСЕГДА 200, иначе Telegram напишет 400 Bad Request
  return new Response("ok", { status: 200 });
});


//1 author user name netu
//2 author link netu
// 3 link doesnt work
// 4 images download only 1 but shiuld be all
// 5 Иногда прилетает по два запроса из за того что две фотографии
// 6 links не везде добавляются
// 7 добавить видео 