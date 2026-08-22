import { beforeEach, describe, expect, it, vi } from "vitest";

const loggerMock = {
  error: vi.fn(),
  fatal: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
};

const responsesCreateMock = vi.fn();

vi.mock("@/libs/logger.js", () => ({
  logger: loggerMock,
}));

vi.mock("@/libs/openai.client.js", () => ({
  openai: {
    responses: {
      create: responsesCreateMock,
    },
  },
}));

describe("cryptoTokenExtractionService.extractCryptoTokensFromText", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    vi.resetModules();
    responsesCreateMock.mockReset();
  });

  it("returns an empty array for blank text", async () => {
    const { cryptoTokenExtractionService } =
      await import("../services/crypto-token-extraction.service.js");

    const tokens =
      await cryptoTokenExtractionService.extractCryptoTokensFromText("   ");

    expect(tokens).toEqual([]);
    expect(responsesCreateMock).not.toHaveBeenCalled();
  });

  it("extracts, normalizes, deduplicates, and filters tokens", async () => {
    responsesCreateMock.mockResolvedValue({
      output_text: "btc, $eth, BTC, NFT, sol",
    });

    const { cryptoTokenExtractionService } =
      await import("../services/crypto-token-extraction.service.js");

    const tokens =
      await cryptoTokenExtractionService.extractCryptoTokensFromText(
        "BTC, ETH and SOL are mentioned here",
      );

    expect(tokens).toEqual(["BTC", "ETH", "SOL"]);
  });

  it("returns an empty array when OpenAI responds with an error", async () => {
    responsesCreateMock.mockRejectedValue(new Error("rate limited"));

    const { cryptoTokenExtractionService } =
      await import("../services/crypto-token-extraction.service.js");

    const tokens =
      await cryptoTokenExtractionService.extractCryptoTokensFromText("BTC");

    expect(tokens).toEqual([]);
    expect(loggerMock.error).toHaveBeenCalled();
  });
});
