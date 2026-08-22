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

vi.mock("@/modules/posts/favorites/favorites.route.js", () => {
  const router = Router();
  router.post("/:postId/favorites", (_req, res) => {
    res.status(200).json({ ok: "favorites" });
  });
  return { default: router };
});

vi.mock("@/modules/posts/reactions/reactions.route.js", () => {
  const router = Router();
  router.post("/:postId/reactions", (_req, res) => {
    res.status(200).json({ ok: "reactions" });
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

  it("mounts favorites under /api/posts/:postId/favorites", async () => {
    const { default: apiRouter } = await import("./index.route.js");

    const app = express();
    app.use(APP_ROUTES.api, apiRouter);

    const response = await request(app).post(
      API_ROUTES.favorites.replace(":postId", "42"),
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: "favorites" });
  });

  it("mounts reactions under /api/posts/:postId/reactions", async () => {
    const { default: apiRouter } = await import("./index.route.js");

    const app = express();
    app.use(APP_ROUTES.api, apiRouter);

    const response = await request(app).post(
      API_ROUTES.reactions.replace(":postId", "42"),
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: "reactions" });
  });

  it("mounts auth handler under /api/auth/*", async () => {
    const { default: apiRouter } = await import("./index.route.js");

    const app = express();
    app.use(APP_ROUTES.api, apiRouter);

    const response = await request(app).get(`${API_ROUTES.auth}/session`);

    expect(response.status).toBe(204);
  });
});
