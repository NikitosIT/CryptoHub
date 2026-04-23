import express from "express";

import { getCryptoTokens } from "@/modules/cryptotokens/cryptotokens.controller.js";

const router = express.Router();

router.get("/cryptotokens", getCryptoTokens);
export default router;
