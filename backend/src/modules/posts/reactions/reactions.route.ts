import { Router } from "express";

import { API_ROUTE_SEGMENTS } from "@/constants/routes.js";
import { requireAuth } from "@/middleware/requireAuth.js";

import { toggleReactionController } from "./reactions.controller.js";
import { validateToggleReaction } from "./reactions.validation.js";

const router = Router();

router.post(
  API_ROUTE_SEGMENTS.reactions,
  requireAuth,
  validateToggleReaction,
  toggleReactionController,
);

export default router;
