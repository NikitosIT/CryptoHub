import { Router } from "express";

import { requireAuth } from "@/middleware/requireAuth.js";

import { cryptoAiController } from "./crypto-ai.controller.js";
import { validateChatStream } from "./crypto-ai.validation.js";

const router = Router();

// POST /api/crypto-ai/chat/stream
router.post(
  "/chat/stream",
  requireAuth,
  validateChatStream,
  cryptoAiController.stream,
);

// GET /api/crypto-ai/chat/:id
router.get("/chat/:id", requireAuth, cryptoAiController.getChat);

// GET /api/crypto-ai/usage/today
router.get("/usage/today", requireAuth, cryptoAiController.getUsage);

export default router;
