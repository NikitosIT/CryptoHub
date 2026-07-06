import { describe, expect, it } from "vitest";

import type { Cryptotoken } from "../../cryptotokens.types.js";
import { mapCryptotokenToSnapshotCreateInput } from "../cryptotokens.mapper.js";

describe("mapCryptotokenToSnapshotCreateInput", () => {
  it("maps a cryptotoken to prisma snapshot input", () => {
    const snapshotAt = new Date("2026-05-28T09:00:00.000Z");
    const token: Cryptotoken = {
      id: "bitcoin",
      symbol: "btc",
      name: "Bitcoin",
      image: "https://example.com/btc.png",
      current_price: 108123.45678901,
      market_cap: 2_145_678_901.99,
      market_cap_rank: 1,
      total_volume: 123_456_789.9,
      high_24h: 109000.12,
      low_24h: 107500.34,
      price_change_24h: -532.12,
      price_change_percentage_24h: -0.49,
      market_cap_change_24h: -12500000.25,
      market_cap_change_percentage_24h: -0.58,
      ath: 110000,
      ath_change_percentage: -1.7,
      ath_date: "2026-05-20T10:00:00.000Z",
      atl: 0.01,
      atl_change_percentage: 1081234.56,
      atl_date: "2010-07-18T00:00:00.000Z",
      last_updated: "2026-05-28T08:59:00.000Z",
    };

    expect(mapCryptotokenToSnapshotCreateInput(token, snapshotAt)).toEqual({
      coinGeckoId: "bitcoin",
      symbol: "btc",
      name: "Bitcoin",
      image: "https://example.com/btc.png",
      currentPrice: 108123.45678901,
      marketCap: BigInt(2_145_678_901),
      marketCapRank: 1,
      totalVolume: BigInt(123_456_789),
      high24h: 109000.12,
      low24h: 107500.34,
      priceChange24h: -532.12,
      priceChangePercentage24h: -0.49,
      marketCapChange24h: -12500000.25,
      marketCapChangePercentage: -0.58,
      ath: 110000,
      athChangePercentage: -1.7,
      athDate: new Date("2026-05-20T10:00:00.000Z"),
      atl: 0.01,
      atlChangePercentage: 1081234.56,
      atlDate: new Date("2010-07-18T00:00:00.000Z"),
      lastUpdated: new Date("2026-05-28T08:59:00.000Z"),
      snapshotAt,
    });
  });

  it("preserves nullable metrics in the snapshot payload", () => {
    const snapshotAt = new Date("2026-05-28T09:00:00.000Z");
    const token: Cryptotoken = {
      id: "test-token",
      symbol: "tt",
      name: "Test Token",
      image: "https://example.com/tt.png",
      current_price: 1.23,
      market_cap: 456.78,
      market_cap_rank: null,
      total_volume: 99.9,
      high_24h: null,
      low_24h: null,
      price_change_24h: null,
      price_change_percentage_24h: null,
      market_cap_change_24h: null,
      market_cap_change_percentage_24h: null,
      ath: 2.5,
      ath_change_percentage: null,
      ath_date: "2026-01-01T00:00:00.000Z",
      atl: 0.5,
      atl_change_percentage: null,
      atl_date: "2025-01-01T00:00:00.000Z",
      last_updated: "2026-05-28T08:59:00.000Z",
    };

    expect(
      mapCryptotokenToSnapshotCreateInput(token, snapshotAt),
    ).toMatchObject({
      marketCapRank: null,
      high24h: null,
      low24h: null,
      priceChange24h: null,
      priceChangePercentage24h: null,
      marketCapChange24h: null,
      marketCapChangePercentage: null,
      athChangePercentage: null,
      atlChangePercentage: null,
      snapshotAt,
    });
  });
});
