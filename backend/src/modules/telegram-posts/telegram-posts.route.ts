import { Router } from "express";

import telegramPostIngestionRoutes from "./ingestion/ingestion.route.js";
import { telegramPostsController } from "./telegram-posts.controller.js";
import { validateTelegramPosts } from "./telegram-posts.validation.js";

const router = Router();

router.get("/", validateTelegramPosts, telegramPostsController.list);
router.use("/ingestion", telegramPostIngestionRoutes);

export default router;
