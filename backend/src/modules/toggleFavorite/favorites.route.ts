import express from "express";

import { toggleFavorites } from "@/modules/toggleFavorite/favorites.controller.js";

const router = express.Router();

router.post("/favorites", toggleFavorites);

export default router;
