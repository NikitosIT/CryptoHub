import { Router } from "express";

import { ROUTE_SEGMENTS } from "@/constants/routes.js";

import { telegramPostIngestionController } from "./telegram.controller.js";
import { authenticateTelegramIngestion } from "./telegram-auth.middleware.js";

const router = Router();

router.post(
  ROUTE_SEGMENTS.root,
  authenticateTelegramIngestion,
  telegramPostIngestionController.handle,
);

export default router;
