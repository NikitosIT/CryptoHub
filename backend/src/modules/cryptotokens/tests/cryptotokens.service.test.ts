import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { createManyMock, loggerInfoMock, listMock } = vi.hoisted(() => ({
  createManyMock: vi.fn(),
  loggerInfoMock: vi.fn(),
  listMock: vi.fn(),
}));

vi.mock("@/libs/db.js", () => ({
  prisma: {
    cryptotokenSnapshot: {
      createMany: createManyMock,
    },
  },
}));

vi.mock("@/libs/logger.js", () => ({
  logger: {
    info: loggerInfoMock,
    error: vi.fn(),
    fatal: vi.fn(),
  },
}));

vi.mock("@/modules/cryptotokens/cryptotokens.service.js", () => ({
  cryptotokens: {
    list: listMock,
  },
}));

import { snapshotsService } from "../cryptotokens.service.js";

describe("snapshotsService.createWeeklySnapshot", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-28T09:15:00.000Z"));
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("creates snapshot rows for fetched cryptotokens", async () => {
    listMock.mockResolvedValue([
      {
        id: "bitcoin",
        symbol: "btc",
        name: "Bitcoin",
        image: "https://example.com/btc.png",
        current_price: 100000.12,
        market_cap: 2_000_000_000.9,
        market_cap_rank: 1,
        total_volume: 123456789.9,
        high_24h: 101000.55,
        low_24h: 99000.44,
        price_change_24h: 500.12,
        price_change_percentage_24h: 0.5,
        market_cap_change_24h: 1500000.67,
        market_cap_change_percentage_24h: 0.3,
        ath: 110000,
        ath_change_percentage: -9.09,
        ath_date: "2026-05-20T00:00:00.000Z",
        atl: 0.01,
        atl_change_percentage: 999999.99,
        atl_date: "2010-07-18T00:00:00.000Z",
        last_updated: "2026-05-28T09:10:00.000Z",
      },
      {
        id: "ethereum",
        symbol: "eth",
        name: "Ethereum",
        image: "https://example.com/eth.png",
        current_price: 5000.89,
        market_cap: 600_000_000.75,
        market_cap_rank: 2,
        total_volume: 98765432.1,
        high_24h: 5050.25,
        low_24h: 4950.15,
        price_change_24h: -25.5,
        price_change_percentage_24h: -0.51,
        market_cap_change_24h: -750000.12,
        market_cap_change_percentage_24h: -0.2,
        ath: 5500,
        ath_change_percentage: -9.07,
        ath_date: "2026-05-01T00:00:00.000Z",
        atl: 0.2,
        atl_change_percentage: 2500000,
        atl_date: "2015-10-20T00:00:00.000Z",
        last_updated: "2026-05-28T09:11:00.000Z",
      },
    ]);

    createManyMock.mockResolvedValue({ count: 2 });

    const result = await snapshotsService.createWeeklySnapshot();

    expect(listMock).toHaveBeenCalledOnce();
    expect(createManyMock).toHaveBeenCalledWith({
      data: [
        {
          coinGeckoId: "bitcoin",
          symbol: "btc",
          name: "Bitcoin",
          image: "https://example.com/btc.png",
          currentPrice: 100000.12,
          marketCap: BigInt(2_000_000_000),
          marketCapRank: 1,
          totalVolume: BigInt(123456789),
          high24h: 101000.55,
          low24h: 99000.44,
          priceChange24h: 500.12,
          priceChangePercentage24h: 0.5,
          marketCapChange24h: 1500000.67,
          marketCapChangePercentage: 0.3,
          ath: 110000,
          athChangePercentage: -9.09,
          athDate: new Date("2026-05-20T00:00:00.000Z"),
          atl: 0.01,
          atlChangePercentage: 999999.99,
          atlDate: new Date("2010-07-18T00:00:00.000Z"),
          lastUpdated: new Date("2026-05-28T09:10:00.000Z"),
          snapshotAt: new Date("2026-05-28T09:15:00.000Z"),
        },
        {
          coinGeckoId: "ethereum",
          symbol: "eth",
          name: "Ethereum",
          image: "https://example.com/eth.png",
          currentPrice: 5000.89,
          marketCap: BigInt(600_000_000),
          marketCapRank: 2,
          totalVolume: BigInt(98765432),
          high24h: 5050.25,
          low24h: 4950.15,
          priceChange24h: -25.5,
          priceChangePercentage24h: -0.51,
          marketCapChange24h: -750000.12,
          marketCapChangePercentage: -0.2,
          ath: 5500,
          athChangePercentage: -9.07,
          athDate: new Date("2026-05-01T00:00:00.000Z"),
          atl: 0.2,
          atlChangePercentage: 2500000,
          atlDate: new Date("2015-10-20T00:00:00.000Z"),
          lastUpdated: new Date("2026-05-28T09:11:00.000Z"),
          snapshotAt: new Date("2026-05-28T09:15:00.000Z"),
        },
      ],
    });
    expect(loggerInfoMock).toHaveBeenCalledWith(
      {
        createdCount: 2,
        snapshotAt: new Date("2026-05-28T09:15:00.000Z"),
      },
      "Cryptotoken snapshots refreshed",
    );
    expect(result).toEqual({
      createdCount: 2,
      snapshotAt: new Date("2026-05-28T09:15:00.000Z"),
    });
  });

  it("propagates prisma errors", async () => {
    const error = new Error("insert failed");

    listMock.mockResolvedValue([
      {
        id: "bitcoin",
        symbol: "btc",
        name: "Bitcoin",
        image: "https://example.com/btc.png",
        current_price: 100000,
        market_cap: 2_000_000_000,
        market_cap_rank: 1,
        total_volume: 123456789,
        high_24h: 101000,
        low_24h: 99000,
        price_change_24h: 500,
        price_change_percentage_24h: 0.5,
        market_cap_change_24h: 1500000,
        market_cap_change_percentage_24h: 0.3,
        ath: 110000,
        ath_change_percentage: -9.09,
        ath_date: "2026-05-20T00:00:00.000Z",
        atl: 0.01,
        atl_change_percentage: 999999.99,
        atl_date: "2010-07-18T00:00:00.000Z",
        last_updated: "2026-05-28T09:10:00.000Z",
      },
    ]);
    createManyMock.mockRejectedValue(error);

    await expect(snapshotsService.createWeeklySnapshot()).rejects.toThrow(
      "insert failed",
    );
    expect(loggerInfoMock).not.toHaveBeenCalled();
  });
});
