import { toNodeHandler } from "better-auth/node";
import { Router } from "express";

import { auth } from "@/libs/auth.js";
import telegramPostIngestionRoutes from "@/modules/telegram-posts/telegram/telegram-post-ingestion.route.js";
import telegramPostsRoutes from "@/modules/telegram-posts/telegram-posts.route.js";
import transferRoutes from "@/modules/transfer/transfer.route.js";
const router = Router();

router.all("/auth/*splat", toNodeHandler(auth));
router.use("/transfer", transferRoutes);
router.use("/telegram-posts", telegramPostsRoutes);
router.use("/telegram-post-ingestion", telegramPostIngestionRoutes);

export default router;
