import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { errorHandler } from "../../middleware/errorHandler.js";
import healthRouter from "./health.route.js";

const { rawQueryMock, redisPingMock } = vi.hoisted(() => ({
  rawQueryMock: vi.fn(),
  redisPingMock: vi.fn(),
}));

vi.mock("@/libs/db.js", () => ({
  prisma: {
    $queryRaw: rawQueryMock,
  },
}));

vi.mock("@/libs/redis.js", () => ({
  redis: {
    ping: redisPingMock,
  },
}));

const app = express();

app.use(express.json());
app.use("/health", healthRouter);
app.use(errorHandler);

describe("GET /health", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 when all dependencies are healthy", async () => {
    rawQueryMock.mockResolvedValue([{ "1": 1 }]);
    redisPingMock.mockResolvedValue("PONG");

    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "healthy",
      checks: {
        database: "ok",
        redis: "ok",
      },
    });
  });

  it("returns 503 and status unhealthy when database is down", async () => {
    rawQueryMock.mockRejectedValue(new Error("Connection refused"));
    redisPingMock.mockResolvedValue("PONG");

    const response = await request(app).get("/health");

    expect(response.status).toBe(503);
    expect(response.body).toEqual({
      status: "unhealthy",
      checks: {
        database: "error",
        redis: "ok",
      },
    });
  });

  it("returns 503 and status unhealthy when redis is down", async () => {
    rawQueryMock.mockResolvedValue([{ "1": 1 }]);
    redisPingMock.mockRejectedValue(new Error("Connection refused"));

    const response = await request(app).get("/health");

    expect(response.status).toBe(503);
    expect(response.body).toEqual({
      status: "unhealthy",
      checks: {
        database: "ok",
        redis: "error",
      },
    });
  });
});
