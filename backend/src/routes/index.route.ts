import { toNodeHandler } from "better-auth/node";
import { Router } from "express";

import { API_ROUTE_SEGMENTS, ROUTE_SEGMENTS } from "@/constants/routes.js";
import { auth } from "@/libs/auth.js";
import telegramPostIngestionRoutes from "@/modules/telegram-posts/ingestion/ingestion.route.js";
import telegramPostsRoutes from "@/modules/telegram-posts/telegram-posts.route.js";

const router = Router();

router.all(ROUTE_SEGMENTS.authWildcard, toNodeHandler(auth));
router.use(API_ROUTE_SEGMENTS.telegramPosts, telegramPostsRoutes);
router.use(
  API_ROUTE_SEGMENTS.telegramPostIngestion,
  telegramPostIngestionRoutes,
);

export default router;
