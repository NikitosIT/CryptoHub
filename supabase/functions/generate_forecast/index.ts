import OpenAI from "openai";
import { createClient } from "supabase";
import { safeLogError } from "./utils/safeLogError.ts";

const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY")! });
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const TAVILY_API_KEY = Deno.env.get("TAVILY_API_KEY")!;

// --- 🔹 функция поиска Tavily ---
async function tavilySearch(query: string, maxResults = 5) {
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

  if (!res.ok) throw new Error(`Tavily search failed (${res.status})`);
  return res.json();
}

// --- 🔹 основная логика генерации одного прогноза ---
async function generateForecast(token_name: string) {
  console.log(`🚀 Generating forecast for ${token_name}`);

  // Проверка: был ли прогноз за последние 3 дня
  const { data: existing } = await supabase
    .from("token_forecasts")
    .select("created_at")
    .eq("token_name", token_name)
    .order("created_at", { ascending: false })
    .limit(1);

  if (
    existing?.length &&
    Date.now() - new Date(existing[0].created_at).getTime() <
      4 * 24 * 60 * 60 * 1000
  ) {
    console.log(`⏩ ${token_name}: прогноз недавно обновлён — пропускаем`);
    return;
  }

  // --- поиск источников ---
  const query = `
${token_name} crypto price prediction 2025
site:coindesk.com OR site:cointelegraph.com OR site:messari.io
OR site:binance.com OR site:medium.com OR site:substack.com OR site:reddit.com
`;
  const search = await tavilySearch(query, 5);
  const sources = search.results
    ?.map((r: any) => `• ${r.title}\n${r.url}`)
    .join("\n\n") ?? "Нет источников";

  // --- запрос к GPT ---
  const prompt = `
Ты — профессиональный криптоаналитик.  
Используй данные из источников ниже (включая новости, отчёты, заявления фондов, аналитику) про токен ${token_name} до конца 2025 года:  

${sources}

1. Сначала кратко опиши настроение рынка (один абзац).  
   - Проверь, что пишут о данном токене крупные фонды (например, BlackRock и другие.) и ведущие аналитики. Найди и процитируй примерно 5-10 ключевых тезисов — только подробно.  
   - Следи за стилем: деловой, грамотно — не «альткойн», а «альткоин», не «биткойн», а «Bitcoin» и т.д.  
2. Затем сформулируй общий прогноз по данной монете до конца 2025 года.  
   - Определи диапазон минимальной и максимальной цены — но не давай слишком широкий разброс.  
   - Ни в коем случае не выдумывай факты — используй только достоверные данные и обоснования. 
3. - Учитывай названия тикеров: OP - Optimism, WLD - worldcoin и т.д  
4. В конце обязательно добавь строку в зависимости от настроения, только ЧЕСТНО!:
Sentiment: positive | neutral | negative
Эта строка означает твоё аналитическое заключение о настроении рынка по токену. Сам выбери один из трёх вариантов: **positive**, **neutral** или **negative** — и только один.  
**Важно:**  
- Чётко структурируй ответ: абзац настроения → цитаты и тезисы → общий прогноз с диапазоном цен → строка Sentiment.  
- Никаких лишних строк после Sentiment.  
- Ответ на русском языке, в деловом стиле, но если уместно, то можешь и вставлять анекдоты.  
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1",
    temperature: 0.6,
    messages: [{ role: "user", content: prompt }],
  });

  const text = completion.choices[0].message?.content || "";

  // Извлекаем sentiment
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

  // --- сохраняем в базу ---
  const { error } = await supabase.from("token_forecasts").insert([
    {
      token_name,
      forecast_text: forecast,
      sentiment,
      source_url: sources,
      status: "pending",
    },
  ]);

  if (error) throw error;
  console.log(`✅ ${token_name} — готов (${sentiment})`);
}
type ForecastRequest = { token_name?: string };
// --- 🔹 основной обработчик ---
Deno.serve(async (req) => {
  try {
    let json = {};
    try {
      json = await req.json();
    } catch (_) {
      // нет тела — значит cron
    }

    const token_name = (json as any)?.token_name;

    if (token_name) {
      // 🔹 Ручной вызов
      await generateForecast(token_name);
      return new Response(`Forecast generated for ${token_name}`, {
        status: 200,
      });
    }

    // 🔹 Автоматический запуск (cron)
    const { data: tokens, error } = await supabase
      .from("cryptotokens")
      .select("token_name");

    if (error) throw error;
    if (!tokens?.length) throw new Error("No tokens found");

    console.log(`🧠 Found ${tokens.length} tokens. Generating forecasts...`);
    for (const t of tokens) {
      try {
        await generateForecast(t.token_name);
      } catch (err) {
        safeLogError(err, `Ошибка генерации для ${t.token_name}`);
      }
    }

    return new Response("All forecasts processed", { status: 200 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      safeLogError(err, "Ошибка генерации прогноза");
      return new Response(err.message, { status: 500 });
    } else {
      safeLogError(err, "Неизвестная ошибка");
      return new Response("Unknown error", { status: 500 });
    }
  }
});
