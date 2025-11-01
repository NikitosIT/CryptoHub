import { createClient } from "supabase";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
};

Deno.serve(async (req) => {
  // 1️⃣ CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 2️⃣ Получаем данные из тела
    const { user_id, nickname, profile_logo } = await req.json();

    // Если user_id нет — сразу ошибка
    if (!user_id) {
      return new Response(
        JSON.stringify({ error: "Missing user_id" }),
        { status: 400, headers: corsHeaders },
      );
    }

    // Если не передано ни nickname, ни profile_logo
    if (!nickname && !profile_logo) {
      return new Response(
        JSON.stringify({ error: "No update data provided" }),
        { status: 400, headers: corsHeaders },
      );
    }

    if (nickname) {
      const { data: existingNick, error: nickErr } = await supabase
        .from("profiles")
        .select("id")
        .eq("nickname", nickname)
        .neq("id", user_id) // исключаем текущего пользователя
        .maybeSingle();

      if (nickErr) throw nickErr;
      if (existingNick) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Никнейм уже занят. Выберите другой.",
          }),
          { status: 400, headers: corsHeaders },
        );
      }
    }

    // 3️⃣ Проверяем, есть ли профиль
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("id, nickname, last_changed, profile_logo")
      .eq("id", user_id)
      .maybeSingle();

    if (profileErr) throw profileErr;

    // 4️⃣ Если нет профиля — создаем новый
    if (!profile) {
      const { error: insertErr } = await supabase
        .from("profiles")
        .insert({
          id: user_id,
          nickname: nickname || null,
          profile_logo: profile_logo || null,
          created_at: new Date().toISOString(),
          last_changed: new Date().toISOString(),
        });

      if (insertErr) throw insertErr;

      return new Response(
        JSON.stringify({
          success: true,
          message: "Profile created successfully",
          nickname,
          profile_logo,
        }),
        { status: 200, headers: corsHeaders },
      );
    }

    // 6️⃣ Обновляем только те поля, что переданы
    const updates: Record<string, any> = {};
    if (nickname) {
      updates.nickname = nickname;
      updates.last_changed = new Date().toISOString();
    }
    if (profile_logo) updates.profile_logo = profile_logo;

    const { error: updateErr } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user_id);

    if (updateErr) throw updateErr;

    return new Response(
      JSON.stringify({
        success: true,
        nickname: nickname ?? profile.nickname,
        profile_logo: profile_logo ?? profile.profile_logo,
      }),
      { status: 200, headers: corsHeaders },
    );
  } catch (err: any) {
    console.error("❌ Edge function error:", err.message);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: corsHeaders },
    );
  }
});
