import { Router } from "express";

import telegramPostIngestionRoutes from "@/modules/telegram-post-ingestion/telegram-post-ingestion.route.js";
import telegramPostsRoutes from "@/modules/telegram-posts/telegram-posts.route.js";
import transferRoutes from "@/modules/transfer/transfer.route.js";
const router = Router();

router.use("/transfer", transferRoutes);
router.use("/telegram-posts", telegramPostsRoutes);
router.use("/telegram-post-ingestion", telegramPostIngestionRoutes);

export default router;
