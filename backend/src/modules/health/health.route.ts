import { Router } from "express";

import { ROUTE_SEGMENTS } from "@/constants/routes.js";

import { getHealth } from "./health.controller.js";

const router = Router();

router.get(ROUTE_SEGMENTS.root, getHealth);

export default router;
