import { Router } from "express";

import { telegramPostIngestionController } from "./ingestion.controller.js";
import { authenticateTelegramIngestion } from "./ingestion-auth.middleware.js";

const router = Router();

router.post(
  "/",
  authenticateTelegramIngestion,
  telegramPostIngestionController.handle,
);

export default router;
