import OpenAI from "openai";
import { supabase } from "../shared/supabaseApi.ts";
import { handleOptions } from "../shared/cors.ts";
import { errorResponse, jsonResponse } from "../shared/responses.ts";
import { safeLogError } from "../shared/logger.ts";

const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY")! });

const TAVILY_API_KEY = Deno.env.get("TAVILY_API_KEY")!;
const FORECAST_COOLDOWN_DAYS = 4;
const FORECAST_YEAR = 2026;
const OPENAI_MODEL = "gpt-4o";

async function tavilySearch(query: string, maxResults = 5) {
  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TAVILY_API_KEY}`,
      },
      body: JSON.stringify({
        query,
        max_results: maxResults,
        include_raw_content: false,
        topic: "finance",
        search_depth: "advanced",
      }),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "Unknown error");
      throw new Error(
        `Tavily search failed (${res.status}): ${errorText}`,
      );
    }
    return await res.json();
  } catch (err) {
    if (err instanceof Error && err.message.includes("Tavily search failed")) {
      throw err;
    }
    throw new Error(
      `Tavily search network error: ${
        err instanceof Error ? err.message : "Unknown error"
      }`,
    );
  }
}

async function generateForecast(token_name: string) {
  const trimmedTokenName = token_name?.trim();
  if (!trimmedTokenName) {
    throw new Error("token_name is required and cannot be empty");
  }

  console.log(`🚀 Generating forecast for ${trimmedTokenName}`);

  const cooldownMs = FORECAST_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
  const { data: existing, error: existingError } = await supabase
    .from("token_forecasts")
    .select("created_at")
    .eq("token_name", trimmedTokenName)
    .order("created_at", { ascending: false })
    .limit(1);

  if (existingError) {
    safeLogError(
      existingError,
      `Error checking existing forecast for ${trimmedTokenName}`,
    );
    throw existingError;
  }

  if (
    existing?.length &&
    Date.now() - new Date(existing[0].created_at).getTime() < cooldownMs
  ) {
    console.log(
      `⏩ ${trimmedTokenName}: прогноз недавно обновлён (в течение ${FORECAST_COOLDOWN_DAYS} дней) — пропускаем`,
    );
    return { skipped: true, reason: "recent_forecast_exists" };
  }

  const query = `
${trimmedTokenName} crypto price prediction ${FORECAST_YEAR}
site:coindesk.com OR
site:cointelegraph.com OR
site:messari.io OR
site:binance.com OR
site:coinbase.com OR
site:glassnode.com OR
site:cryptoquant.com OR
site:theblock.co OR
site:research.binance.com OR
site:delphi.digital OR
site:a16zcrypto.com OR
site:paradigm.xyz OR
site:medium.com OR
site:substack.com OR
site:tradingview.com OR
site:reddit.com
`;

  let search;
  try {
    search = await tavilySearch(query.trim(), 5);
  } catch (err) {
    safeLogError(err, `Tavily search failed for ${trimmedTokenName}`);
    throw new Error(
      `Failed to search sources for ${trimmedTokenName}: ${
        err instanceof Error ? err.message : "Unknown error"
      }`,
    );
  }

  const sources = search.results
    ?.map((r: { title?: string; url?: string }) =>
      `• ${r.title || "Untitled"}\n${r.url || ""}`
    )
    .join("\n\n") ?? "Нет источников";

  const prompt = `
Ты — профессиональный криптоаналитик и финансовый исследователь.

Используй ТОЛЬКО достоверные данные из указанных источников
(новости, аналитические отчёты, исследования, заявления фондов)
для анализа токена ${trimmedTokenName} и прогноза до конца ${FORECAST_YEAR} года.

Источники для анализа:
${sources}

=== СТРУКТУРА ОТВЕТА ===

1. НАСТРОЕНИЕ РЫНКА  
Опиши текущее рыночное настроение по токену ${trimmedTokenName} одним логически связным абзацем.
- Учитывай общее состояние крипторынка, сектор токена и макро-факторы.
- Отрази отношение ведущих аналитиков и институциональных инвесторов.
- Если упоминаются крупные фонды (например, BlackRock и другие), опирайся только на реальные публикации или заявления.
- Стиль: деловой, аналитический, грамотный (Bitcoin, Ethereum, альткоин и т.д.).

2. КЛЮЧЕВЫЕ ТЕЗИСЫ И ФАКТЫ  
Приведи несколько (3–5) ключевых тезисов, основанных на источниках:
- важные цитаты или выводы аналитиков;
- обновления протокола, партнёрства, интеграции;
- действия фондов или крупных инвесторов (покупка / продажа), если такие данные есть.
❗ Не выдумывай факты. Если информации нет — прямо укажи это.

3. ПРОГНОЗ ДО КОНЦА ${FORECAST_YEAR} ГОДА  
Сформулируй общий прогноз по токену:
- Укажи ожидаемый ценовой диапазон (минимум и максимум), избегая чрезмерно широких разбросов.
- Обоснуй прогноз через фундаментальные факторы, рынок и аналитику.
- Не давай точных обещаний или гарантированных цен.

4. SENTIMENT  
В конце ответа добавь ОДНУ строку строго в формате:
Sentiment: positive | neutral | negative

Выбери только один вариант, отражающий твоё честное аналитическое заключение о настроении рынка.

=== ВАЖНЫЕ ПРАВИЛА ===
- Строго следуй структуре: настроение → тезисы → прогноз → Sentiment.
- Не добавляй текст после строки Sentiment.
- Учитывай тикеры: OP — Optimism, WLD — Worldcoin и т.д.
- Ответ только на русском языке.
- Допускается лёгкий уместный юмор, если он не снижает аналитическую ценность.
`;

  let completion;
  try {
    completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      temperature: 0.6,
      messages: [{ role: "user", content: prompt }],
    });
  } catch (err) {
    safeLogError(err, `OpenAI API failed for ${trimmedTokenName}`);
    throw new Error(
      `Failed to generate forecast for ${trimmedTokenName}: ${
        err instanceof Error ? err.message : "Unknown error"
      }`,
    );
  }

  const text = completion.choices[0]?.message?.content || "";

  if (!text.trim()) {
    throw new Error(`OpenAI returned empty response for ${trimmedTokenName}`);
  }

  const sentimentMatch = text.match(
    /Sentiment:\s*(positive|neutral|negative)/i,
  );
  const sentiment = sentimentMatch
    ? sentimentMatch[1].toLowerCase()
    : "neutral";

  const forecast = text.replace(
    /Sentiment:\s*(positive|neutral|negative)/i,
    "",
  ).trim();

  const { error: insertError } = await supabase.from("token_forecasts").insert([
    {
      token_name: trimmedTokenName,
      forecast_text: forecast,
      sentiment,
      source_url: sources,
      status: "pending",
    },
  ]);

  if (insertError) {
    safeLogError(insertError, `generate_forecast: ${trimmedTokenName}`);
    throw new Error(
      `Failed to save forecast for ${trimmedTokenName}: ${insertError.message}`,
    );
  }

  console.log(`✅ ${trimmedTokenName} — готов (${sentiment})`);
  return { success: true, sentiment, token_name: trimmedTokenName };
}

type ForecastRequest = { token_name?: string };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return handleOptions();
  }

  try {
    let json: ForecastRequest | null = null;
    try {
      json = await req.json();
    } catch (_) {
    }

    const token_name = json?.token_name?.trim();

    if (token_name) {
      const result = await generateForecast(token_name);
      return jsonResponse({
        success: true,
        message: `Forecast generated for ${token_name}`,
        ...(result?.skipped ? { skipped: true } : {}),
      });
    }

    const { data: tokens, error } = await supabase
      .from("cryptotokens")
      .select("token_name");

    if (error) throw error;
    if (!tokens?.length) {
      return jsonResponse({
        success: true,
        message: "No tokens found to process",
        processed: 0,
        skipped: 0,
        failed: 0,
      });
    }

    console.log(`🧠 Found ${tokens.length} tokens. Generating forecasts...`);
    let processed = 0;
    let skipped = 0;
    let failed = 0;

    for (const t of tokens) {
      try {
        const result = await generateForecast(t.token_name);
        if (result?.skipped) {
          skipped++;
        } else {
          processed++;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (err) {
        failed++;
        safeLogError(err, `Ошибка генерации для ${t.token_name}`);
      }
    }

    return jsonResponse({
      success: true,
      message: "All forecasts processed",
      processed,
      skipped,
      failed,
      total: tokens.length,
    });
  } catch (err: unknown) {
    safeLogError(err, "Ошибка генерации прогноза");
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return errorResponse(errorMessage, 500);
  }
});
