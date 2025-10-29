import { createClient } from "supabase";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { post_id } = await req.json();

    if (!post_id) {
      return new Response(JSON.stringify({ error: "Missing post_id" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      },
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const { data: existing, error: selectError } = await supabase
      .from("likes")
      .select("*")
      .eq("user_id", user.id)
      .eq("post_id", post_id)
      .maybeSingle();

    if (selectError) throw selectError;

    if (existing) {
      const { error: delError } = await supabase
        .from("likes")
        .delete()
        .eq("id", existing.id);

      if (delError) throw delError;

      return new Response(JSON.stringify({ liked: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      const { error: insError } = await supabase
        .from("likes")
        .insert([{ user_id: user.id, post_id }]);

      if (insError) throw insError;

      return new Response(JSON.stringify({ liked: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
  } catch (err: any) {
    console.error("❌ toggle-like error:", err);
    return new Response(
      JSON.stringify({ error: err?.message || "Unexpected error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
