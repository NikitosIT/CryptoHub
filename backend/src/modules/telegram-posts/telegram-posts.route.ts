import { Router } from "express";

import { ROUTE_SEGMENTS } from "@/constants/routes.js";

import telegramPostIngestionRoutes from "./ingestion/ingestion.route.js";
import { telegramPostsController } from "./telegram-posts.controller.js";
import { validateTelegramPosts } from "./telegram-posts.validation.js";

const router = Router();

router.get(
  ROUTE_SEGMENTS.root,
  validateTelegramPosts,
  telegramPostsController.list,
);
router.use(ROUTE_SEGMENTS.ingestion, telegramPostIngestionRoutes);

export default router;
