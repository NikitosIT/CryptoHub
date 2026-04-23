import express from "express";

import { telegramWebhook } from "./telegram.controller.js";
const router = express.Router();

router.post("/webhook", telegramWebhook);

export default router;

// Todo ngrok it is local, on prod use other tunnel
