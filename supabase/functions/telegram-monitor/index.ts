import { createClient } from "supabase";
import { extractTokensLLM } from "../shared/extractTokens.ts";
import { ExtendedMessage, Message, Update } from "../shared/types.ts";
import { collectMedia } from "../shared/tgMedia.ts";
const TG_TOKEN = Deno.env.get("TELEGRAM_CONTROL_BOT_TOKEN")!;
const SUPABASE_URL = Deno.env.get("MY_SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("MY_SUPABASE_SERVICE_ROLE_KEY")!;
const MODERATION_CHAT_ID = Number(Deno.env.get("TG_GROUP_CHAT_ID")); // id твоей группы для модерации
const OWNER_ID = Number(Deno.env.get("TG_OWNER_ID")); // твой tg user_id

const sb = createClient(SUPABASE_URL, SERVICE_KEY);
function isMessage(x: unknown): x is Message {
  return !!x && typeof x === "object" && "chat" in x && "message_id" in x;
}

function pickMsg(update: Update): Message | null {
  const msg = update.message ??
    update.channel_post ??
    update.edited_message ??
    update.edited_channel_post;

  return isMessage(msg) ? msg : null;
}
Deno.serve(async (req) => {
  const update = await req.json().catch(() => null);
  if (!update) return new Response("ok");

  // 🧩 1️⃣ Новый пост в группе, где бот состоит
  if (update.message || update.channel_post) {
    const msg = update.message ?? update.channel_post;
    const text = msg.text || msg.caption || "";

    const from_chat = msg.chat;
    const chat_id = from_chat?.id;
    const msg_id = msg.message_id;

    // Пересылаем пост в группу модерации
    await fetch(`https://api.telegram.org/bot${TG_TOKEN}/forwardMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: MODERATION_CHAT_ID,
        from_chat_id: chat_id,
        message_id: msg_id,
      }),
    });

    console.log("🔁 Пост переслан на модерацию:", text.slice(0, 100));
  }

  // 🧩 2️⃣ Отслеживаем лайк (message_reaction)
  if (update.message_reaction) {
    const r = update.message_reaction;
    const user = r.user;
    const emoji = r.reaction?.emoji;

    // Проверяем, что лайк поставил именно ты
    if (user?.id === OWNER_ID && emoji === "❤️") {
      // Получаем оригинальный пост, который лайкнули
      const msg = pickMsg(update) as ExtendedMessage | null;
      if (!msg) {
        console.log("No message-like object");
        return new Response("ok", { status: 200 });
      }
      const fwd = msg.forward_from_chat ?? msg.sender_chat ?? msg.chat;

      const text = msg.text || msg.caption || "";
      const text_entities = msg.entities?.length
        ? msg.entities
        : msg.caption_entities?.length
        ? msg.caption_entities
        : null;

      const tokens = await extractTokensLLM(text);
      const media = await collectMedia(msg);

      // Вызов RPC в Supabase
      const { error } = await sb.rpc("upsert_telegram_post", {
        p_text_caption: text,
        p_text_entities: text_entities,
        p_crypto_tokens: tokens ?? [], // можно будет добавить extractTokensLLM
        p_tg_author_id: String(fwd?.id ?? msg.chat?.id),
        p_media_group_id: msg.media_group_id ?? null,
        p_media: media,
      });

      if (error) {
        console.error("❌ Ошибка upsert_telegram_post:", error);
      } else {
        console.log("✅ Пост добавлен после лайка:", text.slice(0, 80));
      }
    }
  }

  return new Response("ok");
});
