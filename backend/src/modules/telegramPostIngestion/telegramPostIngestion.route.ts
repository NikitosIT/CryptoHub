import { Router } from "express";

import { telegramPostIngestionController } from "./telegramPostIngestion.controller.js";
import { validateTelegramPostIngestion } from "./telegramPostIngestion.validation.js";

const router = Router();

router.post(
  "/",
  validateTelegramPostIngestion,
  telegramPostIngestionController.handle,
);

export default router;
