import express, { Router } from "express";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import { API_ROUTES, APP_ROUTES, ROUTE_SEGMENTS } from "@/constants/routes.js";

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

vi.mock("@/modules/posts/posts.route.js", () => {
  const router = Router();
  router.get(ROUTE_SEGMENTS.root, (_req, res) => {
    res.status(200).json({ ok: "posts" });
  });
  return { default: router };
});

vi.mock("@/modules/posts/telegram/telegram.route.js", () => {
  const router = Router();
  router.post(ROUTE_SEGMENTS.root, (_req, res) => {
    res.status(200).json({ ok: "telegram" });
  });
  return { default: router };
});

vi.mock("@/modules/crypto-ai/crypto-ai.route.js", () => {
  const router = Router();
  router.post("/chat/stream", (_req, res) => {
    res.status(200).json({ ok: "crypto-ai-stream" });
  });
  return { default: router };
});

describe("index router", () => {
  it("mounts posts under /api/posts", async () => {
    const { default: apiRouter } = await import("./index.route.js");

    const app = express();
    app.use(APP_ROUTES.api, apiRouter);

    const response = await request(app).get(API_ROUTES.posts);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: "posts" });
  });

  it("mounts telegram webhook under /api/telegram", async () => {
    const { default: apiRouter } = await import("./index.route.js");

    const app = express();
    app.use(APP_ROUTES.api, apiRouter);

    const response = await request(app).post(API_ROUTES.telegram);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: "telegram" });
  });

  it("mounts crypto-ai chat stream under /api/crypto-ai/chat/stream", async () => {
    const { default: apiRouter } = await import("./index.route.js");

    const app = express();
    app.use(APP_ROUTES.api, apiRouter);

    const response = await request(app).post(
      API_ROUTES.cryptoAiChatStream,
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: "crypto-ai-stream" });
  });
});
