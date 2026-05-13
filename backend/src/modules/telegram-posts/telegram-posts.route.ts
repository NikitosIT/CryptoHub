import { Router } from "express";

import telegramPostIngestionRoutes from "./telegram/telegram-post-ingestion.route.js";
import { telegramPostsController } from "./telegram-posts.controller.js";
import { validateTelegramPosts } from "./telegram-posts.validation.js";

const router = Router();

router.get("/", validateTelegramPosts, telegramPostsController.list);
router.use("/telegram", telegramPostIngestionRoutes);

export default router;
