import { Router } from "express";

import { transferController } from "./transfer.controller.js";
import { validateTransfer } from "./transfer.validation.js";

const router = Router();

router.post("/send", validateTransfer, transferController.send);

export default router;
