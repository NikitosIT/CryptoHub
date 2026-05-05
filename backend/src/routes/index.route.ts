import { Router } from "express";

import telegramPostIngestionRoutes from "@/modules/telegramPostIngestion/telegramPostIngestion.route.js";
import telegramPostsRoutes from "@/modules/telegramPosts/telegramPosts.route.js";
import transferRoutes from "@/modules/transfer/transfer.route.js";
const router = Router();

router.use("/transfer", transferRoutes);
router.use("/telegram-posts", telegramPostsRoutes);
router.use("/telegram-post-ingestion", telegramPostIngestionRoutes);

export default router;
