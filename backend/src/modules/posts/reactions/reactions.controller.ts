import type { Response } from "express";

import { reactionService } from "./reactions.service.js";
import type {
  ToggleReactionRequest,
  ToggleReactionResponse,
} from "./reactions.types.js";

export const toggleReactionController = async (
  req: ToggleReactionRequest,
  res: Response<ToggleReactionResponse>,
) => {
  const postId = Number(req.params.postId);
  const { reactionType } = req.body;
  const userId = req.user!.id;

  const result = await reactionService.toggle({
    userId,
    postId,
    reactionType,
  });

  res.json(result);
};
