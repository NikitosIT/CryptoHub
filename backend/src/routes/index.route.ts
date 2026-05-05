import { Router } from "express";

import telegramPostsRoutes from "@/modules/telegram-posts/telegram-posts.route.js";
import telegramPostIngestionRoutes from "@/modules/telegramPostIngestion/telegramPostIngestion.route.js";
import transferRoutes from "@/modules/transfer/transfer.route.js";
const router = Router();

router.use("/transfer", transferRoutes);
router.use("/telegram-posts", telegramPostsRoutes);
router.use("/telegram-post-ingestion", telegramPostIngestionRoutes);

export default router;
