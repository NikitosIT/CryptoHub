import { supabase } from "../shared/supabaseApi.ts";
import { handleOptions } from "../shared/cors.ts";
import { errorResponse, jsonResponse } from "../shared/responses.ts";
import { parseRequestBody, validateRequiredFields } from "../shared/request.ts";
import { safeLogError } from "../shared/logger.ts";
import { verifyUserId } from "../shared/auth.ts";

const USER_AVATARS_BUCKET = "user_avatars";
const USER_LOGO_PREFIX = "logos/";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return handleOptions(req);
  }

  try {
    const body = await parseRequestBody<{
      user_id?: string;
      nickname?: string;
      profile_logo?: string;
    }>(req);

    const validation = validateRequiredFields(body, ["user_id"]);
    if (!validation.valid) {
      return errorResponse(validation.error, 400, req);
    }

    const user_id = await verifyUserId(req, body.user_id);
    const { nickname, profile_logo } = body;

    if (!nickname && !profile_logo) {
      return errorResponse("No update data provided", 400, req);
    }

    if (nickname) {
      const { data: existingNick, error: nickErr } = await supabase
        .from("profiles")
        .select("id")
        .eq("nickname", nickname)
        .neq("id", user_id)
        .maybeSingle();

      if (nickErr) throw nickErr;
      if (existingNick) {
        return errorResponse(
          "This nickname is already taken. Please choose another one.",
          400,
          req,
        );
      }
    }

    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("id, nickname, last_changed, profile_logo")
      .eq("id", user_id)
      .maybeSingle();

    if (profileErr) throw profileErr;

    if (nickname && profile?.last_changed) {
      const lastChanged = new Date(profile.last_changed);
      const now = new Date();
      const daysSinceChange = Math.floor(
        (now.getTime() - lastChanged.getTime()) / (1000 * 60 * 60 * 24),
      );
      const daysRequired = 14;

      if (daysSinceChange < daysRequired) {
        const nextChangeDate = new Date(lastChanged);
        nextChangeDate.setDate(nextChangeDate.getDate() + daysRequired);
        const nextChangeDateStr = nextChangeDate.toISOString().split("T")[0];

        return errorResponse(
          `You can only change your nickname once every 14 days. The next change is available: ${nextChangeDateStr}`,
          400,
          req,
        );
      }
    }

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

      const nextChangeDate = new Date();
      nextChangeDate.setDate(nextChangeDate.getDate() + 14);
      const nextChangeDateStr = nextChangeDate.toISOString().split("T")[0];

      return jsonResponse(
        {
          success: true,
          message: "Profile created successfully",
          nickname,
          profile_logo,
          next_nickname_change_date: nextChangeDateStr,
        },
        200,
        req,
      );
    }

    const updates: Record<string, string | null> = {};
    let nextChangeDate: Date | null = null;

    if (nickname) {
      updates.nickname = nickname;
      const newLastChanged = new Date();
      updates.last_changed = newLastChanged.toISOString();
      nextChangeDate = new Date(newLastChanged);
      nextChangeDate.setDate(nextChangeDate.getDate() + 14);
    } else if (profile.last_changed) {
      const lastChanged = new Date(profile.last_changed);
      nextChangeDate = new Date(lastChanged);
      nextChangeDate.setDate(nextChangeDate.getDate() + 14);
    }

    const oldProfileLogo = profile.profile_logo;

    if (profile_logo) updates.profile_logo = profile_logo;

    const { error: updateErr } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user_id);

    if (updateErr) throw updateErr;

    if (profile_logo && oldProfileLogo && oldProfileLogo !== profile_logo) {
      const { data: otherProfiles, error: checkError } = await supabase
        .from("profiles")
        .select("id")
        .eq("profile_logo", oldProfileLogo)
        .limit(1);

      if (!checkError && (!otherProfiles || otherProfiles.length === 0)) {
        const oldFilePath = `${USER_LOGO_PREFIX}${oldProfileLogo}.png`;
        const { error: deleteError } = await supabase.storage
          .from(USER_AVATARS_BUCKET)
          .remove([oldFilePath]);

        if (deleteError) {
          safeLogError(
            new Error(`Failed to delete old avatar: ${deleteError.message}`),
            "update-profile-cleanup",
          );
        }
      }
    }

    const nextChangeDateStr = nextChangeDate
      ? nextChangeDate.toISOString().split("T")[0]
      : null;

    return jsonResponse(
      {
        success: true,
        nickname: nickname ?? profile.nickname,
        profile_logo: profile_logo ?? profile.profile_logo,
        next_nickname_change_date: nextChangeDateStr,
      },
      200,
      req,
    );
  } catch (err: unknown) {
    if (err instanceof Response) {
      return err;
    }
    safeLogError(err, "update-profile");
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return errorResponse(errorMessage, 500, req);
  }
});
