ALTER TABLE "cryptotoken_snapshots"
ALTER COLUMN "market_cap_rank" DROP NOT NULL,
ALTER COLUMN "high_24h" DROP NOT NULL,
ALTER COLUMN "low_24h" DROP NOT NULL,
ALTER COLUMN "price_change_24h" DROP NOT NULL,
ALTER COLUMN "price_change_percentage_24h" DROP NOT NULL,
ALTER COLUMN "market_cap_change_24h" DROP NOT NULL,
ALTER COLUMN "market_cap_change_percentage_24h" DROP NOT NULL,
ALTER COLUMN "ath_change_percentage" DROP NOT NULL,
ALTER COLUMN "atl_change_percentage" DROP NOT NULL;
