import express from "express";
import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";

import { errorHandler } from "../../middleware/errorHandler.js";
import cryptotokensRouter from "./cryptotokens.route.js";

const { redisGetMock, redisSetMock } = vi.hoisted(() => ({
  redisGetMock: vi.fn(),
  redisSetMock: vi.fn(),
}));

vi.mock("@/libs/logger.js", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
  },
}));

vi.mock("@/libs/redis.js", () => ({
  redis: {
    get: redisGetMock,
    set: redisSetMock,
  },
}));

const app = express();

app.use(express.json());
app.use("/api/cryptotokens", cryptotokensRouter);
app.use(errorHandler);

describe("GET /api/cryptotokens", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("returns cached token data when redis has a value", async () => {
    const payload = [
      {
        id: "bitcoin",
        symbol: "btc",
        name: "Bitcoin",
      },
    ];

    redisGetMock.mockResolvedValue(JSON.stringify(payload));

    const fetchSpy = vi.spyOn(global, "fetch");

    const response = await request(app).get("/api/cryptotokens");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(payload);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(redisSetMock).not.toHaveBeenCalled();
  });

  it("fetches CoinGecko and caches the response on cache miss", async () => {
    const payload = [
      {
        id: "bitcoin",
        symbol: "btc",
        name: "Bitcoin",
      },
    ];

    redisGetMock.mockResolvedValue(null);
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(payload),
    } as unknown as Response);

    const response = await request(app).get("/api/cryptotokens");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(payload);
    expect(redisSetMock).toHaveBeenCalledWith(
      "cryptotokens:list:usd:market_cap_desc:100:1",
      JSON.stringify(payload),
      {
        expiration: {
          type: "EX",
          value: 300,
        },
      },
    );
  });

  it("returns a 500 when CoinGecko fails", async () => {
    redisGetMock.mockResolvedValue(null);
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      json: vi.fn(),
    } as unknown as Response);

    const response = await request(app).get("/api/cryptotokens");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      status: "error",
      message: "Failed to fetch",
    });
  });
});
