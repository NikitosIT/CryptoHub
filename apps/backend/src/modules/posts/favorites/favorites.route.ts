import { Router } from "express";

import { API_ROUTE_SEGMENTS } from "@/constants/routes.js";
import { requireAuth } from "@/middleware/requireAuth.js";

import { toggleFavoriteController } from "./favorites.controller.js";
import { validateToggleFavorite } from "./favorites.validation.js";

const router = Router();

router.post(
  API_ROUTE_SEGMENTS.favorites,
  requireAuth,
  validateToggleFavorite,
  toggleFavoriteController,
);

export default router;
