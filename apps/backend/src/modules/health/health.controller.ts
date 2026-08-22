import type { Request, Response } from "express";

import { healthService } from "./health.service.js";

export const getHealth = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  const health = await healthService.getHealth();

  res.status(health.status === "healthy" ? 200 : 503).json(health);
};
