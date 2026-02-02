import { supabase } from "../../shared/supabaseApi.ts";
import {
  errorResponse,
  jsonResponse,
  normalizeComment,
  parseNumber,
  RawComment,
  RequestBody,
} from "../utils.ts";
import { createSupabaseClient } from "../../shared/supabaseApi.ts";

export async function handleListComments(req: Request, body: RequestBody) {
  try {
    const { post_id } = body;

    if (!post_id) {
      return errorResponse("Missing post_id", 400);
    }

    const supabaseClient = createSupabaseClient(req);
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();
    const userId = user?.id;

    const { data: comments, error } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", post_id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const commentIds = (comments || []).map((c) => c.id);

    let likedCommentIds = new Set<number>();
    if (userId && commentIds.length > 0) {
      const { data: likedReactions, error: reactionsError } = await supabase
        .from("comment_reactions")
        .select("comment_id")
        .eq("user_id", userId)
        .in("comment_id", commentIds);

      if (reactionsError) throw reactionsError;

      likedCommentIds = new Set(
        (likedReactions || [])
          .map((reaction) =>
            parseNumber((reaction as { comment_id: unknown }).comment_id),
          )
          .filter((value): value is number => value !== null),
      );
    }

    const userIds = [...new Set((comments || []).map((c) => c.user_id))];
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, nickname, profile_logo")
      .in("id", userIds);

    if (profilesError) throw profilesError;

    const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

    const data = (comments || []).map((comment) => {
      const normalizedComment = normalizeComment(comment as RawComment);
      const commentNumericId = parseNumber(normalizedComment.id);
      const isOwner = normalizedComment.user_id === userId;
      const profile = profileMap.get(normalizedComment.user_id);

      return {
        ...normalizedComment,
        user_id: isOwner ? normalizedComment.user_id : null,
        user_has_liked:
          commentNumericId !== null && likedCommentIds.has(commentNumericId),
        user: {
          raw_user_meta_data: {
            nickname: profile?.nickname || null,
            avatar_url: profile?.profile_logo || null,
          },
        },
      };
    });

    return jsonResponse({ success: true, data });
  } catch (err: unknown) {
    if (err instanceof Response) {
      return err;
    }
    throw err;
  }
}
