import { supabase } from "../shared/supabaseApi.ts";
import { safeLogError } from "../shared/logger.ts";
import { errorResponse, jsonResponse } from "../shared/responses.ts";

Deno.serve(async () => {
  try {
    const { data: users, error: listError } = await supabase.auth.admin
      .listUsers();
    if (listError) throw listError;

    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const unverified = users.users.filter((u) => {
      const isUnverified = !u.email_confirmed_at;
      const neverSignedIn = !u.last_sign_in_at;
      const createdMoreThanDayAgo = new Date(u.created_at) < cutoff;

      return isUnverified && neverSignedIn && createdMoreThanDayAgo;
    });
    let deleted = 0;
    let failed = 0;

    for (const user of unverified) {
      const { error: delError } = await supabase.auth.admin.deleteUser(user.id);
      if (delError) {
        safeLogError(delError, `Failed to delete user ${user.id}`);
        failed++;
      } else {
        deleted++;
      }
    }
    return jsonResponse({
      success: true,
      checked: users.users.length,
      unverifiedCount: unverified.length,
      deleted,
      failed,
    });
  } catch (err: unknown) {
    safeLogError(err, "cleanup-unverified-users");
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return errorResponse(errorMessage, 500);
  }
});
