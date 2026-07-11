import { toNodeHandler } from "better-auth/node";
import { Router } from "express";

import { API_ROUTE_SEGMENTS, ROUTE_SEGMENTS } from "@/constants/routes.js";
import { auth } from "@/libs/auth.js";
import favoritesRoutes from "@/modules/posts/favorites/favorites.route.js";
import postsRoutes from "@/modules/posts/posts.route.js";
import telegramRoutes from "@/modules/posts/telegram/telegram.route.js";

const router = Router();

router.all(ROUTE_SEGMENTS.authWildcard, toNodeHandler(auth));
router.use(API_ROUTE_SEGMENTS.posts, postsRoutes);
router.use(API_ROUTE_SEGMENTS.telegram, telegramRoutes);
router.use(API_ROUTE_SEGMENTS.favorites, favoritesRoutes);

export default router;
