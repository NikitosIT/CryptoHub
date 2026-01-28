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

    if (!action) {
      return errorResponse("Missing action parameter", 400, req);
    }

    const body = await parseRequestBody(req);

    switch (action) {
      case "create":
        return await handleCreateComment(req, body);
      case "update":
        return await handleUpdateComment(req, body);
      case "delete":
        return await handleDeleteComment(req, body);
      case "list":
        try {
          return await handleListComments(req, body);
        } catch (err) {
          if (err instanceof Response && err.status === 401) {
            safeLogError("Unexpected 401 in listComments", "user-comments");
            return errorResponse("Internal server error", 500, req);
          }
          throw err;
        }
      default:
        return errorResponse("Invalid action", 400, req);
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
