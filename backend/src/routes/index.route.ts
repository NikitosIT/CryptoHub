import { Router } from "express";

import transferRoutes from "@/modules/transfer/transfer.route.js";
const router = Router();

router.use("/transfer", transferRoutes);

export default router;
