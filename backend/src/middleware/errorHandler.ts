import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { AppError } from "@/shared/utils/AppError.js";

import { logger } from "../libs/logger.js";

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof AppError) {
    logger.error({
      message: err.message,
      status: err.status,
      method: req.method,
      url: req.originalUrl,
      timestamp: new Date().toISOString(),
    });

    return res.status(err.status).json({
      status: "error",
      message: err.message,
    });
  }

  if (err instanceof ZodError) {
    logger.error({
      message: "Validation error",
      issues: err.issues,
      method: req.method,
      url: req.originalUrl,
      timestamp: new Date().toISOString(),
    });

    return res.status(400).json({
      status: "error",
      message: "Validation error",
      issues: err.issues,
    });
  }

  const message = err instanceof Error ? err.message : "Internal Server Error";

  logger.error({
    message,
    method: req.method,
    url: req.originalUrl,
    timestamp: new Date().toISOString(),
  });

  return res.status(500).json({
    status: "error",
    message,
  });
};
