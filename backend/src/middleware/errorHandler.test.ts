import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { logger } from "../libs/logger.js";
import { AppError } from "../utils/AppError.js";
import { errorHandler } from "./errorHandler.js";

vi.mock("@/libs/logger.js", () => ({
  logger: {
    error: vi.fn(),
    fatal: vi.fn(),
    info: vi.fn(),
  },
}));

const buildApp = (errorFactory: () => unknown) => {
  const app = express();

  app.get("/test", (_req, _res, next) => {
    next(errorFactory());
  });

  app.use(errorHandler);

  return app;
};

describe("errorHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the AppError status and message", async () => {
    const app = buildApp(() => new AppError("Forbidden", 403));

    const response = await request(app).get("/test");

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      status: "error",
      message: "Forbidden",
    });
    expect(logger.error).toHaveBeenCalledOnce();
  });

  it("returns validation details for ZodError", async () => {
    const app = buildApp(() => {
      try {
        z.object({ cursor: z.number() }).parse({ cursor: "abc" });
      } catch (error) {
        return error;
      }

      throw new Error("Expected Zod validation to fail");
    });

    const response = await request(app).get("/test");
    const body = response.body as {
      issues: unknown[];
      message: string;
      status: string;
    };

    expect(response.status).toBe(400);
    expect(body.status).toBe("error");
    expect(body.message).toBe("Validation error");
    expect(body.issues).toBeInstanceOf(Array);
    expect(logger.error).toHaveBeenCalledOnce();
  });

  it("returns a 500 for unexpected Error instances", async () => {
    const app = buildApp(() => new Error("Unexpected failure"));

    const response = await request(app).get("/test");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      status: "error",
      message: "Unexpected failure",
    });
    expect(logger.error).toHaveBeenCalledOnce();
  });

  it("returns a generic 500 message for non-Error values", async () => {
    const app = buildApp(() => "boom");

    const response = await request(app).get("/test");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      status: "error",
      message: "Internal Server Error",
    });
    expect(logger.error).toHaveBeenCalledOnce();
  });
});
