import { createClient } from "supabase";
import { extractTokensLLM } from "../shared/extractTokens.ts";
import { ExtendedMessage, Message, Update } from "../shared/types.ts";
import { collectMedia } from "../shared/tgMedia.ts";

const SUPABASE_URL = Deno.env.get("MY_SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("MY_SUPABASE_SERVICE_ROLE_KEY")!;
const TG_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
if (!SUPABASE_URL || !SERVICE_KEY || !TG_TOKEN) {
  console.error("Missing env vars");
  Deno.serve(() => new Response("ok", { status: 200 }));
  Deno.exit(0);
}
const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
  global: { fetch: (url, opts) => fetch(url, opts) },
});

async function safeParse(req: Request) {
  try {
    const raw = await req.text();
    console.log("RAW:", raw.slice(0, 1000));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error("JSON parse error:", e);
    return null;
  }
}

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

async function tgSend(chat_id: number, text: string) {
  await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id, text }),
  });
}

Deno.serve(async (req) => {
  const update = await safeParse(req);
  if (!update) return new Response("ok", { status: 200 });

  const msg = pickMsg(update) as ExtendedMessage | null;
  if (!msg) {
    console.log("No message-like object");
    return new Response("ok", { status: 200 });
  }

  const srcChat = msg.forward_from_chat ?? msg.sender_chat ??
    msg.chat;

  const text: string = typeof msg.text === "string"
    ? msg.text
    : typeof msg.caption === "string"
    ? msg.caption
    : "";
  const text_entities =
    Array.isArray(msg.caption_entities) && msg.caption_entities.length > 0
      ? msg.caption_entities
      : Array.isArray(msg.entities) && msg.entities.length > 0
      ? msg.entities
      : null;
  const chatId: number | undefined = msg.chat?.id;
  const media = await collectMedia(msg);
  const tokens = await extractTokensLLM(text);
  const channelId = srcChat?.id;
  const groupId: string | null = msg.media_group_id ?? null;

  const { data, error } = await sb.rpc("upsert_telegram_post", {
    p_text_caption: text,
    p_text_entities: text_entities,
    p_crypto_tokens: tokens ?? [],
    p_tg_author_id: String(channelId),
    p_media_group_id: groupId,
    p_media: media,
  });

  if (error) {
    console.error("rpc upsert_telegram_post error:", error);
    if (chatId) await tgSend(chatId, "❌ Ошибка");
  } else {
    const row = data?.[0];
    if (row?.inserted && chatId) await tgSend(chatId, "✅ Обработано");
  }

  return new Response("ok", { status: 200 });
});
