import { errorResponse, parseRequestBody } from "./utils.ts";
import { handleOptions } from "../shared/cors.ts";
import { safeLogError } from "../shared/logger.ts";
import { handleCreateComment } from "./actions/createComment.ts";
import { handleUpdateComment } from "./actions/updateComment.ts";
import { handleDeleteComment } from "./actions/deleteComment.ts";
import { handleListComments } from "./actions/listComments.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return handleOptions(req);
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    switch (req.method) {
      case "GET": {
        const postId = url.searchParams.get("post_id");
        if (!postId) return errorResponse("Missing post_id", 400, req);
        return await handleListComments(req, { post_id: Number(postId) });
      }
      case "POST": {
        const body = await parseRequestBody(req);

        switch (action) {
          case "list": {
            const postId = url.searchParams.get("post_id") ?? body.post_id;
            if (!postId) return errorResponse("Missing post_id", 400, req);
            return await handleListComments(req, { post_id: Number(postId) });
          }
          case "update":
            return await handleUpdateComment(req, body);
          case "delete":
            return await handleDeleteComment(req, body);
          case "create":
          case null:
            return await handleCreateComment(req, body);
          default:
            return errorResponse("Invalid action", 400, req);
        }
      }
      case "PATCH": {
        const body = await parseRequestBody(req);
        return await handleUpdateComment(req, body);
      }
      case "DELETE": {
        const body = await parseRequestBody(req);
        return await handleDeleteComment(req, body);
      }
      default:
        return errorResponse("Method not allowed", 405, req);
    }
  } catch (err: unknown) {
    if (err instanceof Response) {
      return err;
    }
    safeLogError(err, "user-comments");
    const message = err instanceof Error ? err.message : "Unexpected error";
    return errorResponse(message, 500, req);
  }
});
