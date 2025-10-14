import OpenAI from "openai";

const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY")! });

const SYSTEM_PROMPT = `
Ты извлекаешь криптовалютные тикеры из текста и изображений (скриншоты постов, графики, мемы с подписью и т.п.).

Правила:
- Тикеры — это строки A-Z/0-9 длиной от 2 до 12 символов: BTC, ETH, USDT, SOL, AAVE, MATIC, ARB, OP, LDO, STX, DOGE, SHIB, LTC, AVAX и т.п.
- Сопоставляй сленг/эмодзи/раскладки:
  "биток", "bitcoin", "₿" -> BTC;
  "эфир", "ether" -> ETH;
  "$SOL" -> SOL;
  "$TON" -> TON и т.д.
- Из пар вида SOL/USDT, SOLUSDT, SOL-USDT извлекай токен(ы), очевидно относящиеся к криптовалютам (обычно монета слева — SOL; USDT/USDC/TRX/BTC/ETH тоже валидны, если явно упомянуты).
- Игнорируй:
  • имена/логины авторов (@ILYA_BTC и т.п. — не тикер),
  • названия бирж/индикаторов/таймфреймов (OKX, RSI, EMA, 1H, 4H),
  • водяные знаки/оверлеи каналов,
  • произвольные слова капсом (PUMP, MOON, NFT, DEFI, AIRDROP), если это не явный тикер.
- Бери данные как из TEXT, так и из IMAGES (распознавай надписи на картинках).
- Не придумывай. Если сомневаешься — не добавляй.
- Ответ — ТОЛЬКО вызов функции collect_tokens.
`.trim();

type CollectTokensArgs = { tokens: string[] };

const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "collect_tokens",
      description: "Собери найденные тикеры в строгий JSON.",
      parameters: {
        type: "object",
        additionalProperties: false,
        properties: {
          tokens: {
            type: "array",
            items: { type: "string", pattern: "^[A-Z0-9]{2,12}$" },
            uniqueItems: true,
          },
        },
        required: ["tokens"],
      },
    },
  },
];

// type MediaItem = { type: string; url: string };
export async function extractTokensLLM(
  text: string,
  // images: MediaItem[] = [],
): Promise<string[]> {
  const hasText = Boolean(text?.trim());
  // const hasImages = Array.isArray(images) && images.length > 0;
  if (!hasText) return [];

  const content: (
    | { type: "text"; text: string }
    | { type: "image_url"; image_url: { url: string } }
  )[] = [];

  if (hasText) {
    content.push({
      type: "text",
      text: `Задача: извлечь крипто-тикеры из текста и изображений. ` +
        `Верни только через функцию collect_tokens.\n\n` +
        `TEXT:\n${text}\n`,
    });
  }

  // if (hasImages) {
  //   const photosOnly = images.filter(
  //     (m) =>
  //       m.type === "photo" ||
  //       (typeof m.url === "string" &&
  //         m.url.match(/\.(jpg|jpeg|png|webp)$/i)),
  //   );

  //   for (const item of photosOnly) {
  //     const url = item.url;
  //     if (typeof url === "string" && url.trim()) {
  //       content.push({
  //         type: "image_url",
  //         image_url: { url, detail: "low" } as any,
  //       });
  //     }
  //   }
  // }

  const baseMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content },
  ];

  const tokens1 = await callOnce(baseMessages, true);
  if (tokens1.length) return postProcess(tokens1);

  const retryMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    ...baseMessages,
    {
      role: "system",
      content: "ПАМЯТКА: ответь ТОЛЬКО через вызов функции collect_tokens.",
    },
  ];
  const tokens2 = await callOnce(retryMessages, /*forceTool*/ false);
  return postProcess(tokens2);
}

/** Один вызов chat.completions с вытаскиванием tool_calls */
async function callOnce(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  forceTool: boolean,
): Promise<string[]> {
  try {
    const completion = await openai.chat.completions.create(
      {
        model: "gpt-4o-mini",
        messages,
        tools,
        tool_choice: forceTool
          ? { type: "function", function: { name: "collect_tokens" } }
          : "auto",
        temperature: 0,
      },
      { timeout: 30_000 },
    );

    const msg = completion.choices[0]?.message;
    if (!msg?.tool_calls?.length) return [];

    const out: string[] = [];
    for (const call of msg.tool_calls) {
      if (call.type === "function" && call.function.name === "collect_tokens") {
        try {
          const parsed = JSON.parse(call.function.arguments || "{}") as Partial<
            CollectTokensArgs
          >;
          if (Array.isArray(parsed.tokens)) {
            out.push(...parsed.tokens.map(String));
          }
        } catch (e) {
          console.error(
            "[LLM] parse function args error:",
            e,
            call.function.arguments,
          );
        }
      }
    }
    return out;
  } catch (e) {
    console.error("[LLM] chat.completions error:", e);
    return [];
  }
}

function postProcess(tokens: string[]): string[] {
  const clean = tokens
    .map((t) => t.trim().toUpperCase())
    .filter((t) => /^[A-Z0-9]{2,12}$/.test(t));

  // Небольшой анти-шум: убираем частые "ложные друзья" если вдруг проскочили
  const STOP = new Set([
    "PUMP",
    "MOON",
    "NFT",
    "DEFI",
    "AIRDROP",
    "FOMO",
    "HODL",
  ]);
  const filtered = clean.filter((t) => !STOP.has(t));

  // Уникализируем
  return Array.from(new Set(filtered));
}
