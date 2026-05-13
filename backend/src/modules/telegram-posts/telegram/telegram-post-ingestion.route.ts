import { Router } from "express";

import { telegramPostIngestionController } from "./telegram-post-ingestion.controller.js";
import { validateTelegramPostIngestion } from "./telegram-post-ingestion.validation.js";

const router = Router();

router.post(
  "/",
  validateTelegramPostIngestion,
  telegramPostIngestionController.handle,
);

export default router;
