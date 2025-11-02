import { createClient } from "supabase";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { post_id, user_id } = await req.json();

    if (!post_id || !user_id) {
      return new Response(
        JSON.stringify({ error: "post_id и user_id обязательны" }),
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    // Проверяем, есть ли запись
    const { data: existing, error: selectError } = await supabase
      .from("favorites")
      .select("id")
      .eq("post_id", post_id)
      .eq("user_id", user_id)
      .maybeSingle();

    if (selectError) throw selectError;

    if (existing) {
      // Удаляем
      const { error: deleteError } = await supabase
        .from("favorites")
        .delete()
        .eq("id", existing.id);

      if (deleteError) throw deleteError;

      return new Response(
        JSON.stringify({ success: true, status: "removed" }),
        {
          headers: corsHeaders,
        },
      );
    } else {
      // Добавляем
      const { error: insertError } = await supabase
        .from("favorites")
        .insert([{ post_id, user_id }]);

      if (insertError) throw insertError;

      return new Response(
        JSON.stringify({ success: true, status: "added", is_favorite: true }),
        {
          headers: corsHeaders,
        },
      );
    }
  } catch (err: any) {
    console.error("Ошибка toggle-favorite:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
