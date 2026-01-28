import { supabase } from "../shared/supabaseApi.ts";
import { handleOptions } from "../shared/cors.ts";
import { errorResponse, jsonResponse } from "../shared/responses.ts";
import { safeLogError } from "../shared/logger.ts";

const USER_AVATARS_BUCKET = "user_avatars";
const USER_LOGO_PREFIX = "logos/";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return handleOptions();
  }

  try {
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("profile_logo")
      .not("profile_logo", "is", null);

    if (profilesError) throw profilesError;

    const expectedFiles = new Set<string>();
    if (profiles) {
      for (const profile of profiles) {
        if (profile.profile_logo) {
          const filePath = `${USER_LOGO_PREFIX}${profile.profile_logo}.png`;
          expectedFiles.add(filePath);
        }
      }
    }

    let allFiles: Array<{ name: string }> = [];
    let offset = 0;
    const limit = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data: files, error: listError } = await supabase.storage
        .from(USER_AVATARS_BUCKET)
        .list(USER_LOGO_PREFIX, {
          limit,
          offset,
          sortBy: { column: "name", order: "asc" },
        });

      if (listError) throw listError;

      if (files && files.length > 0) {
        allFiles = allFiles.concat(files);
        hasMore = files.length === limit;
        offset += limit;
      } else {
        hasMore = false;
      }
    }

    if (allFiles.length === 0) {
      return jsonResponse({
        success: true,
        checked: 0,
        deleted: 0,
        message: "No files found in storage",
      });
    }

    const filesToDelete: string[] = [];
    for (const file of allFiles) {
      const filePath = `${USER_LOGO_PREFIX}${file.name}`;
      if (!expectedFiles.has(filePath)) {
        filesToDelete.push(filePath);
      }
    }

    let deletedCount = 0;
    const batchSize = 100;

    if (filesToDelete.length > 0) {
      for (let i = 0; i < filesToDelete.length; i += batchSize) {
        const batch = filesToDelete.slice(i, i + batchSize);
        const { data: deletedFiles, error: deleteError } =
          await supabase.storage.from(USER_AVATARS_BUCKET).remove(batch);

        if (deleteError) {
          safeLogError(
            new Error(`Failed to delete batch: ${deleteError.message}`),
            "cleanup-unused-avatars"
          );
        } else {
          deletedCount += deletedFiles?.length || 0;
        }
      }
    }

    return jsonResponse({
      success: true,
      checked: allFiles.length,
      deleted: deletedCount,
      message: `Cleaned up ${deletedCount} unused avatar file(s)`,
    });
  } catch (err: unknown) {
    if (err instanceof Response) {
      return err;
    }
    safeLogError(err, "cleanup-unused-avatars");
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return errorResponse(errorMessage, 500);
  }
});
