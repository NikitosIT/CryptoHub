// functions/cleanup-unverified-users/index.ts
import { createClient } from "supabase";

const supabase = createClient(
  Deno.env.get("MY_SUPABASE_URL")!,
  Deno.env.get("MY_SUPABASE_SERVICE_ROLE_KEY")!, // обязательно service-role ключ
);

Deno.serve(async () => {
  try {
    const { data: users, error: listError } = await supabase.auth.admin
      .listUsers();
    if (listError) throw listError;

    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const unverified = users.users.filter((u) =>
      !u.email_confirmed_at && new Date(u.created_at) < cutoff
    );
    let deleted = 0;

    for (const user of unverified) {
      const { error: delError } = await supabase.auth.admin.deleteUser(user.id);
      if (!delError) deleted++;
    }
    return new Response(
      JSON.stringify({
        success: true,
        checked: users.users.length,
        deleted,
      }),
      { status: 200 },
    );
  } catch (err: any) {
    console.error("Ошибка очистки:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500 },
    );
  }
});
