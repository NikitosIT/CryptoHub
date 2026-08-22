import { Router } from "express";

import { API_ROUTE_SEGMENTS } from "@/constants/routes.js";
import { requireAuth } from "@/middleware/requireAuth.js";

import {
  createCommentController,
  deleteCommentController,
  listCommentsController,
  updateCommentController,
} from "./comments.controller.js";
import {
  validateCreateComment,
  validateDeleteComment,
  validateListComments,
  validateUpdateComment,
} from "./comments.validation.js";

const router = Router();

router.get(
  API_ROUTE_SEGMENTS.comments,
  validateListComments,
  listCommentsController,
);

router.post(
  API_ROUTE_SEGMENTS.comments,
  requireAuth,
  validateCreateComment,
  createCommentController,
);

router.patch(
  `${API_ROUTE_SEGMENTS.comments}/:commentId`,
  requireAuth,
  validateUpdateComment,
  updateCommentController,
);

router.delete(
  `${API_ROUTE_SEGMENTS.comments}/:commentId`,
  requireAuth,
  validateDeleteComment,
  deleteCommentController,
);

export default router;
