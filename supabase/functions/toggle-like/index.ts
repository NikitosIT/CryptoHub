import { createClient } from "supabase";

// --- Разрешаем CORS ---
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// --- Основная функция ---
Deno.serve(async (req) => {
  // Обработка preflight-запросов
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Получаем тело запроса
    const { user_id, post_id, reaction_type } = await req.json();

    // Проверяем корректность данных
    if (!user_id || !post_id || !reaction_type) {
      return new Response(
        JSON.stringify({ error: "Missing user_id, post_id, or reaction_type" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    // Инициализируем клиент с SERVICE_ROLE_KEY
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, // 👈 важный момент
    );

    // Проверяем, есть ли уже реакция от этого пользователя
    const { data: existing, error: selectError } = await supabase
      .from("reactions")
      .select("*")
      .eq("user_id", user_id)
      .eq("post_id", post_id)
      .maybeSingle();

    if (selectError) throw selectError;

    // --- Логика переключения ---
    if (existing) {
      if (existing.reaction_type === reaction_type) {
        // 👇 если пользователь нажал ту же реакцию — удалить
        const { error: delError } = await supabase
          .from("reactions")
          .delete()
          .eq("id", existing.id);
        if (delError) throw delError;
      } else {
        // 👇 если противоположная — обновляем тип
        const { error: updError } = await supabase
          .from("reactions")
          .update({ reaction_type })
          .eq("id", existing.id);
        if (updError) throw updError;
      }
    } else {
      // 👇 если реакции ещё нет — создаём
      const { error: insError } = await supabase
        .from("reactions")
        .insert([{ user_id, post_id, reaction_type }]);
      if (insError) throw insError;
    }

    // --- Автоматическое обновление счётчиков ---
    const { data: counts, error: countError } = await supabase
      .from("reactions")
      .select("reaction_type")
      .eq("post_id", post_id);

    if (countError) throw countError;

    const likeCount = counts.filter((r) => r.reaction_type === "like").length;
    const dislikeCount = counts.filter((r) =>
      r.reaction_type === "dislike"
    ).length;

    const { error: updatePostError } = await supabase
      .from("telegram_posts")
      .update({ like_count: likeCount, dislike_count: dislikeCount })
      .eq("id", post_id);

    if (updatePostError) throw updatePostError;

    // Возвращаем обновлённые данные
    return new Response(
      JSON.stringify({
        success: true,
        post_id,
        like_count: likeCount,
        dislike_count: dislikeCount,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (err: any) {
    console.error("❌ toggle-reaction error:", err);
    return new Response(
      JSON.stringify({ error: err?.message || "Unexpected error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
