import express from "express";

import { testController } from "./test.controller.js";
import { validateTransferRequest } from "./test.validation.js";

const router = express.Router();

router.post("/send", validateTransferRequest, testController.transfers);
export default router;
