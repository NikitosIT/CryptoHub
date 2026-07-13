import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { errorHandler } from "@/middleware/errorHandler.js";

import type { CryptoAiChat } from "../../../prisma/generated/prisma/client.js";

const { countMock, createMock, findFirstMock, updateMock, openAiCreateMock } =
  vi.hoisted(() => ({
    countMock: vi.fn(),
    createMock: vi.fn(),
    findFirstMock: vi.fn(),
    updateMock: vi.fn(),
    openAiCreateMock: vi.fn(),
  }));

vi.mock("@/libs/openai.client.js", () => ({
  openai: {
    chat: {
      completions: {
        create: openAiCreateMock,
      },
    },
  },
}));

vi.mock("@/libs/db.js", () => ({
  prisma: {
    cryptoAiChat: {
      count: countMock,
      create: createMock,
      findFirst: findFirstMock,
      update: updateMock,
    },
  },
}));

vi.mock("@/middleware/requireAuth.js", () => ({
  requireAuth: (req: Request, _res: Response, next: NextFunction) => {
    Object.assign(req, {
      user: { id: "user-1" },
    });
    next();
  },
}));

vi.mock("@/libs/logger.js", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
  },
}));

import cryptoAiRouter from "./crypto-ai.route.js";

const BASE = "/api/crypto-ai";

function buildApp() {
  const app = express();

  app.use(express.json());
  app.use(BASE, cryptoAiRouter);
  app.use(errorHandler);

  return app;
}

function mockStreamChunks(chunks: string[]) {
  async function* stream() {
    for (const content of chunks) {
      yield { choices: [{ delta: { content } }] };
    }
  }

  openAiCreateMock.mockResolvedValue(stream());
}

function buildSseBody(chatId: string, chunks: string[]): string {
  let body = `data: {"type":"init","chatId":"${chatId}"}\n\n`;

  for (const chunk of chunks) {
    body += `data: {"type":"chunk","content":"${chunk}"}\n\n`;
  }

  body += `data: {"type":"done"}\n\n`;

  return body;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/crypto-ai/chat/stream", () => {
  const validBody = { action: "TOKEN_FORECAST", tokenSymbol: "BTC" };

  it("streams a complete AI response via SSE", async () => {
    const chatId = "chat-abc-123";

    countMock.mockResolvedValue(0);
    createMock.mockResolvedValue({
      id: chatId,
      action: "TOKEN_FORECAST",
      tokenSymbol: "BTC",
      status: "STREAMING",
      responseText: null,
      createdAt: new Date("2025-01-01T00:00:00.000Z"),
    } satisfies Partial<CryptoAiChat>);
    mockStreamChunks(["Bitcoin ", "is ", "bullish"]);
    updateMock.mockResolvedValue({});

    const app = buildApp();
    const response = await request(app)
      .post(`${BASE}/chat/stream`)
      .send(validBody)
      .buffer(true);

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toBe("text/event-stream");
    expect(response.text).toBe(
      buildSseBody(chatId, ["Bitcoin ", "is ", "bullish"]),
    );

    // Verify daily limit check
    expect(countMock).toHaveBeenCalledWith({
      where: {
        userId: "user-1",
        createdAt: { gte: expect.any(Date) as Date },
      },
    });

    // Verify DB record created with STREAMING status
    expect(createMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: "user-1",
        action: "TOKEN_FORECAST",
        tokenSymbol: "BTC",
        status: "STREAMING",
      }),
      select: expect.any(Object),
    });

    // Verify finalize sets COMPLETED
    expect(updateMock).toHaveBeenCalledWith({
      where: { id: chatId },
      data: {
        responseText: "Bitcoin is bullish",
        status: "COMPLETED",
      },
    });
  });

  it("returns 429 when daily limit is reached", async () => {
    countMock.mockResolvedValue(3);

    const app = buildApp();
    const response = await request(app)
      .post(`${BASE}/chat/stream`)
      .send(validBody);

    expect(response.status).toBe(429);
    expect(response.body.message).toBe("Daily request limit reached");
    expect(openAiCreateMock).not.toHaveBeenCalled();
    expect(createMock).not.toHaveBeenCalled();
  });

  it.each([
    ["missing action", { tokenSymbol: "BTC" }],
    ["missing tokenSymbol", { action: "TOKEN_FORECAST" }],
    ["empty body", {}],
    ["invalid action", { action: "INVALID", tokenSymbol: "BTC" }],
    ["empty tokenSymbol", { action: "TOKEN_FORECAST", tokenSymbol: "" }],
    ["extra fields", { ...validBody, extra: "field" }],
  ])("rejects invalid body: %s", async (_, body) => {
    const app = buildApp();
    const response = await request(app).post(`${BASE}/chat/stream`).send(body);

    expect(response.status).toBe(400);
    expect(response.body.status).toBe("error");
    expect(response.body.message).toBe("Validation error");
    expect(openAiCreateMock).not.toHaveBeenCalled();
  });
});

describe("GET /api/crypto-ai/chat/:id", () => {
  it("returns a completed chat by ID", async () => {
    const createdAt = new Date("2025-01-01T00:00:00.000Z");

    findFirstMock.mockResolvedValue({
      id: "chat-1",
      action: "TOKEN_FORECAST",
      tokenSymbol: "ETH",
      status: "COMPLETED",
      responseText: "Ethereum looks strong.",
      createdAt,
    });

    const app = buildApp();
    const response = await request(app).get(`${BASE}/chat/chat-1`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: "chat-1",
      action: "TOKEN_FORECAST",
      tokenSymbol: "ETH",
      status: "COMPLETED",
      responseText: "Ethereum looks strong.",
      createdAt: createdAt.toISOString(),
    });
  });

  it("returns 404 when chat is not found", async () => {
    findFirstMock.mockResolvedValue(null);

    const app = buildApp();
    const response = await request(app).get(`${BASE}/chat/nonexistent`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Chat not found");
  });
});

describe("GET /api/crypto-ai/usage/today", () => {
  it("returns daily usage with remaining", async () => {
    countMock.mockResolvedValue(1);

    const app = buildApp();
    const response = await request(app).get(`${BASE}/usage/today`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      used: 1,
      limit: 3,
      remaining: 2,
    });
  });

  it("returns zero remaining when limit is hit", async () => {
    countMock.mockResolvedValue(4);

    const app = buildApp();
    const response = await request(app).get(`${BASE}/usage/today`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      used: 4,
      limit: 3,
      remaining: 0,
    });
  });

  it("returns full remaining when no usage", async () => {
    countMock.mockResolvedValue(0);

    const app = buildApp();
    const response = await request(app).get(`${BASE}/usage/today`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      used: 0,
      limit: 3,
      remaining: 3,
    });
  });
});
