import { safeLogError } from "../shared/logger.ts";

export interface RequestBody {
  post_id?: number;
  comment_id?: number;
  parent_comment_id?: number | null;
  text?: string;
  media?: Array<{ type: "photo" | "video"; url: string }> | null;
}

export type RawComment = {
  id: number | string;
  post_id: number | string;
  parent_comment_id: number | string | null;
  text: string;
  user_id: string;
  media: unknown;
  created_at: string;
  updated_at: string;
  like_count?: number | string | null;
};

export { corsHeaders } from "../shared/cors.ts";

export function parseNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  if (typeof value === "bigint") return Number(value);
  return null;
}

export function normalizeComment(comment: RawComment) {
  const id = parseNumber(comment.id);
  const postId = parseNumber(comment.post_id);
  const parentId =
    comment.parent_comment_id === null
      ? null
      : parseNumber(comment.parent_comment_id);
  const likeCount = parseNumber(comment.like_count);

  return {
    ...comment,
    id: id ?? comment.id,
    post_id: postId ?? comment.post_id,
    parent_comment_id: parentId,
    like_count: likeCount ?? 0,
  };
}

export async function parseRequestBody(req: Request): Promise<RequestBody> {
  try {
    const bodyText = await req.text();
    if (bodyText && bodyText.trim()) {
      return JSON.parse(bodyText) as RequestBody;
    }
  } catch (error) {
    safeLogError(error, "user-comments: parseBody");
  }
  return {};
}

export { errorResponse, jsonResponse } from "../shared/responses.ts";
