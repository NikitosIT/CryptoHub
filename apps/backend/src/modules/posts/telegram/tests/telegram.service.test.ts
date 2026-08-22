import { beforeEach, describe, expect, it, vi } from "vitest";

const { collectorHandleUpdateMock, redisStorageConstructorMock } = vi.hoisted(
  () => ({
    collectorHandleUpdateMock: vi.fn(),
    redisStorageConstructorMock: vi.fn(),
  }),
);

vi.mock("../../../../library/telegram-media-group/index.js", () => ({
  RedisStorage: class {
    public constructor(...args: unknown[]) {
      redisStorageConstructorMock(...args);
    }
  },
  TelegramMediaGroupCollector: class {
    public handleUpdate = collectorHandleUpdateMock;
  },
}));

vi.mock("@/libs/redis.js", () => ({
  redis: {},
}));

import type { Update } from "telegram-media";

import { telegramPostIngestionService } from "../services/telegram.service.js";

const input = {
  update_id: 838794005,
  message: {
    chat: {
      id: -1003136275591,
      type: "supergroup",
      title: "Reply chat",
    },
    message_id: 321,
    forward_origin: {
      type: "channel",
      date: 1_715_460_000,
      message_id: 123,
      chat: {
        id: -1001792822445,
        type: "channel",
        title: "COIN 22",
        username: "COIN22T",
      },
    },
    video: {
      duration: 7,
      width: 640,
      height: 256,
      file_id: "video-file-id",
      file_unique_id: "video-unique-file-id",
    },
    caption: "Post caption",
    caption_entities: [
      {
        offset: 0,
        length: 4,
        type: "bold",
      },
    ],
    media_group_id: "media-group-id",
  },
} satisfies Update;

describe("telegramPostIngestionService.createTelegramPost", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    collectorHandleUpdateMock.mockResolvedValue(undefined);
  });

  it("passes the update to the collector", async () => {
    await telegramPostIngestionService.createTelegramPost(input);

    expect(redisStorageConstructorMock).toHaveBeenCalled();
    expect(collectorHandleUpdateMock).toHaveBeenCalledWith(input);
  });

  it("propagates collector errors", async () => {
    const error = new Error("collector failed");
    collectorHandleUpdateMock.mockRejectedValueOnce(error);

    await expect(
      telegramPostIngestionService.createTelegramPost(input),
    ).rejects.toThrow(error);
  });
});
