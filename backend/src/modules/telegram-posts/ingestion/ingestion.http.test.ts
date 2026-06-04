import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { API_ROUTES } from "@/constants/routes.js";
import { errorHandler } from "../../../middleware/errorHandler.js";

process.env.TELEGRAM_WEBHOOK_SECRET = "test-telegram-secret";

import telegramPostIngestionRouter from "./ingestion.route.js";

const { processUpdateMock } = vi.hoisted(() => ({
  processUpdateMock: vi.fn(),
}));

vi.mock("./ingestion.service.js", () => ({
  telegramPostIngestionService: {
    createTelegramPost: processUpdateMock,
  },
}));

vi.mock("@/libs/logger.js", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
  },
}));

const app = express();

app.use(express.json());
app.use(API_ROUTES.telegramPostIngestion, telegramPostIngestionRouter);
app.use(errorHandler);

const validPayload = {
  update_id: 838794005,
  message: {
    chat: {
      id: -1003136275591,
    },
    forward_origin: {
      chat: {
        id: -1001792822445,
        title: "COIN 22",
        username: "COIN22T",
        type: "channel",
      },
    },
    video: {
      duration: 7,
      width: 640,
      height: 256,
      file_id: "video-file-id",
    },
    caption: "Telegram post caption",
    caption_entities: [
      {
        offset: 0,
        length: 4,
        type: "bold",
      },
    ],
    media_group_id: "media-group-id",
  },
};

describe("POST /api/telegram-post/ingestion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    processUpdateMock.mockResolvedValue(undefined);
  });

  it("passes the raw telegram update to the service", async () => {
    const response = await request(app)
      .post(API_ROUTES.telegramPostIngestion)
      .set("x-telegram-bot-api-secret-token", "test-telegram-secret")
      .send(validPayload);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Post ingestion processed" });
    expect(processUpdateMock).toHaveBeenCalledWith(validPayload);
  });

  it("rejects requests without telegram webhook secret", async () => {
    const response = await request(app)
      .post(API_ROUTES.telegramPostIngestion)
      .send(validPayload);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      status: "error",
      message: "Missing Telegram webhook secret",
    });
    expect(processUpdateMock).not.toHaveBeenCalled();
  });
});
