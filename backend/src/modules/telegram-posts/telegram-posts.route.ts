import { Router } from "express";

import { telegramPostsController } from "./telegram-posts.controller.js";
import { validateTelegramPosts } from "./telegram-posts.validation.js";

const router = Router();

router.get("/", validateTelegramPosts, telegramPostsController.list);

export default router;
