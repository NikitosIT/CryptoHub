import express, { Router } from "express";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";

vi.mock("better-auth/node", () => ({
  toNodeHandler: vi.fn(
    () => (_req: unknown, res: { sendStatus: (code: number) => void }) => {
      res.sendStatus(204);
    },
  ),
}));

vi.mock("@/libs/auth.js", () => ({
  auth: {},
}));

vi.mock("@/modules/telegram-posts/telegram-posts.route.js", () => {
  const router = Router();
  return { default: router };
});

vi.mock("@/modules/telegram-posts/ingestion/ingestion.route.js", () => {
  const router = Router();
  return { default: router };
});

vi.mock("@/modules/cryptotokens/cryptotokens.route.js", () => {
  const router = Router();
  router.get("/", (_req, res) => {
    res.status(200).json({ ok: true });
  });
  return { default: router };
});

describe("index router", () => {
  it("mounts cryptotokens under /api/cryptotokens", async () => {
    const { default: apiRouter } = await import("./index.route.js");

    const app = express();
    app.use("/api", apiRouter);

    const response = await request(app).get("/api/cryptotokens");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
  });
});
