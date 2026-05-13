import { Router } from "express";

import { requireAuth } from "@/middleware/requireAuth.js";

import { transferController } from "./transfer.controller.js";
import { validateTransfer } from "./transfer.validation.js";

const router = Router();

router.post("/send", requireAuth, validateTransfer, transferController.send);

export default router;
