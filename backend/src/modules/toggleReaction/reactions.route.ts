import express from "express";

import { toggleReactions } from "@/modules/toggleReaction/reactions.controller.js";

const router = express.Router();

router.post("/reactions", toggleReactions);

export default router;
