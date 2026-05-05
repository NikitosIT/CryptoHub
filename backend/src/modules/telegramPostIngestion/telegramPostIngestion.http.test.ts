import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { errorHandler } from "../../middleware/errorHandler.js";
import telegramPostIngestionRouter from "./telegramPostIngestion.route.js";

const { processUpdateMock } = vi.hoisted(() => ({
  processUpdateMock: vi.fn(),
}));

vi.mock("./services/telegramPostIngestion.service.js", () => ({
  telegramPostIngestionService: {
    processUpdate: processUpdateMock,
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
app.use("/api/telegram-post-ingestion", telegramPostIngestionRouter);
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

describe("POST /api/telegram-post-ingestion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    processUpdateMock.mockResolvedValue(undefined);
  });

  it("normalizes the update and passes it to the service", async () => {
    const response = await request(app)
      .post("/api/telegram-post-ingestion")
      .send(validPayload);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Post ingestion processed" });
    expect(processUpdateMock).toHaveBeenCalledWith({
      caption: "Telegram post caption",
      captionEntities: [
        {
          offset: 0,
          length: 4,
          type: "bold",
        },
      ],
      forwardOriginChatId: -1001792822445,
      forwardOriginChatTitle: "COIN 22",
      forwardOriginChatUsername: "COIN22T",
      media: [
        {
          type: "video",
          fileId: "video-file-id",
          width: 640,
          height: 256,
          duration: 7,
        },
      ],
      mediaGroupId: "media-group-id",
      replyChatId: -1003136275591,
    });
  });

  it("rejects invalid telegram updates", async () => {
    const response = await request(app)
      .post("/api/telegram-post-ingestion")
      .send({
        update_id: 1,
        message: {
          chat: { id: -1 },
        },
      });
    const body = response.body as {
      message: string;
      status: string;
    };

    expect(response.status).toBe(400);
    expect(body.status).toBe("error");
    expect(body.message).toBe("Validation error");
    expect(processUpdateMock).not.toHaveBeenCalled();
  });
});
