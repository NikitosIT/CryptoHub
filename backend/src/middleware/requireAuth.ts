import { fromNodeHeaders } from "better-auth/node";
import type { NextFunction, Request, Response } from "express";

import { auth } from "@/libs/auth.js";
import { AppError } from "@/utils/AppError.js";

export const requireAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return next(new AppError("Unauthorized", 401));
    }

    req.session = session.session;
    req.user = session.user;

    next();
  } catch (error) {
    next(error);
  }
};
