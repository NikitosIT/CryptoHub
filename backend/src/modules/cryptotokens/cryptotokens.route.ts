import { Router } from "express";

import { ROUTE_SEGMENTS } from "@/constants/routes.js";

import { cryptotokensController } from "./cryptotokens.controller.js";

const router = Router();

router.get(ROUTE_SEGMENTS.root, cryptotokensController);

export default router;
