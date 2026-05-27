import { toNodeHandler } from "better-auth/node";
import { Router } from "express";

import { auth } from "@/libs/auth.js";
import cryptotokensRoutes from "@/modules/cryptotokens/cryptotokens.route.js";
import telegramPostIngestionRoutes from "@/modules/telegram-posts/ingestion/ingestion.route.js";
import telegramPostsRoutes from "@/modules/telegram-posts/telegram-posts.route.js";

const router = Router();

router.all("/auth/*splat", toNodeHandler(auth));
router.use("/telegram-posts", telegramPostsRoutes);
router.use("/telegram-post-ingestion", telegramPostIngestionRoutes);
router.use("/cryptotokens", cryptotokensRoutes);

export default router;
