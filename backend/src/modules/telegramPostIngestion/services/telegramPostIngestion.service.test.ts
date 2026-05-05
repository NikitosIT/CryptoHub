import { beforeEach, describe, expect, it, vi } from "vitest";

const { createMock, loggerErrorMock, tgBotSendMessageMock } = vi.hoisted(
  () => ({
    createMock: vi.fn(),
    loggerErrorMock: vi.fn(),
    tgBotSendMessageMock: vi.fn(),
  }),
);

vi.mock("@/libs/db.js", () => ({
  prisma: {
    telegramPost: {
      create: createMock,
    },
  },
}));

vi.mock("@/libs/logger.js", () => ({
  logger: {
    error: loggerErrorMock,
  },
}));

vi.mock("./telegramBot.service.js", () => ({
  telegramBotService: {
    sendMessage: tgBotSendMessageMock,
  },
}));

import type { TelegramPostIngestionInput } from "../telegramPostIngestion.schema.js";
import { telegramPostIngestionService } from "./telegramPostIngestion.service.js";

const input: TelegramPostIngestionInput = {
  caption: "Post caption",
  captionEntities: [
    {
      offset: 0,
      length: 4,
      type: "bold",
      url: undefined,
      customEmojiId: undefined,
    },
  ],
  forwardOriginChatId: -1001792822445,
  forwardOriginChatTitle: "COIN 22",
  forwardOriginChatUsername: "COIN22T",
  media: [
    {
      type: "video" as const,
      fileId: "video-file-id",
      width: 640,
      height: 256,
      duration: 7,
    },
  ],
  mediaGroupId: "media-group-id",
  replyChatId: -1003136275591,
};

describe("telegramPostIngestionService.processUpdate", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    createMock.mockResolvedValue({ id: 1 });
    tgBotSendMessageMock.mockResolvedValue(undefined);
  });

  it("saves the telegram post and sends a confirmation message", async () => {
    await telegramPostIngestionService.processUpdate(input);

    expect(createMock).toHaveBeenCalledWith({
      data: {
        textCaption: "Post caption",
        textEntities: input.captionEntities,
        cryptoTokens: [],
        tgAuthorId: String(input.forwardOriginChatId),
        tgAuthorTitle: input.forwardOriginChatTitle,
        tgAuthorUsername: input.forwardOriginChatUsername,
        media: input.media,
        mediaGroupId: "media-group-id",
      },
    });
    expect(tgBotSendMessageMock).toHaveBeenCalledWith(
      input.replyChatId,
      "Post Saved✅",
    );
  });
});
