import { Router } from "express";

import { ROUTE_SEGMENTS } from "@/constants/routes.js";
import { requireAuth } from "@/middleware/requireAuth.js";

import { toggleFavoriteController } from "./favorites.controller.js";
import { validateToggleFavorite } from "./favorites.validation.js";

const router = Router();

router.post(
  ROUTE_SEGMENTS.root,
  requireAuth,
  validateToggleFavorite,
  toggleFavoriteController,
);

export default router;
