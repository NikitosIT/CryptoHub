-- CreateTable
CREATE TABLE "cryptotoken_snapshots" (
    "id" SERIAL NOT NULL,
    "coingecko_id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "current_price" DECIMAL(20,8) NOT NULL,
    "market_cap" BIGINT NOT NULL,
    "market_cap_rank" INTEGER NOT NULL,
    "total_volume" BIGINT NOT NULL,
    "high_24h" DECIMAL(20,8) NOT NULL,
    "low_24h" DECIMAL(20,8) NOT NULL,
    "price_change_24h" DECIMAL(20,8) NOT NULL,
    "price_change_percentage_24h" DECIMAL(20,8) NOT NULL,
    "market_cap_change_24h" DECIMAL(20,8) NOT NULL,
    "market_cap_change_percentage_24h" DECIMAL(20,8) NOT NULL,
    "ath" DECIMAL(20,8) NOT NULL,
    "ath_change_percentage" DECIMAL(20,8) NOT NULL,
    "ath_date" TIMESTAMP(3) NOT NULL,
    "atl" DECIMAL(20,8) NOT NULL,
    "atl_change_percentage" DECIMAL(20,8) NOT NULL,
    "atl_date" TIMESTAMP(3) NOT NULL,
    "last_updated" TIMESTAMP(3) NOT NULL,
    "snapshot_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cryptotoken_snapshots_pkey" PRIMARY KEY ("id")
);
