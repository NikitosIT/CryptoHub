import { Router } from "express";

import cryptoRoutes from "@/modules/cryptotokens/cryptotokens.route.js";
import telegramRoutes from "@/modules/telegramApi/telegram.route.js";
import balanceRoutes from "@/modules/testRoute/getAmount.route.js";
import transferRoutes from "@/modules/testRoute/test.route.js";
import favoritesRoutes from "@/modules/toggleFavorite/favorites.route.js";
import reactionRoutes from "@/modules/toggleReaction/reactions.route.js";
const router = Router();

router.use("/toggle", favoritesRoutes);
router.use("/toggle", reactionRoutes);
router.use("/cryptotokens", cryptoRoutes);
router.use("/transfer", transferRoutes);
router.use("/bank", balanceRoutes);
router.use("/telegram", telegramRoutes);

export default router;
