import { Router } from "express";

import { ROUTE_SEGMENTS } from "@/constants/routes.js";

import { telegramPostsController } from "./posts.controller.js";
import { validateTelegramPosts } from "./posts.validation.js";

const router = Router();

router.get(
  ROUTE_SEGMENTS.root,
  validateTelegramPosts,
  telegramPostsController.list,
);

export default router;
