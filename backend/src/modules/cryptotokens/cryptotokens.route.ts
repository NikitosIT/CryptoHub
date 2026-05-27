import { Router } from "express";

import { cryptotokensController } from "./cryptotokens.controller.js";

const router = Router();

router.get("/", cryptotokensController);

export default router;
