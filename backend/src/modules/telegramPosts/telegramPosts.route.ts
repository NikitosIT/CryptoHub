import { Router } from "express";

import { telegramPostsController } from "./telegramPosts.controller.js";
import { validateTelegramPosts } from "./telegramPosts.validation.js";

const router = Router();

router.get("/", validateTelegramPosts, telegramPostsController.list);

export default router;
