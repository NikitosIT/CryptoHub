-- CreateTable
CREATE TABLE "user_card" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "card_name" VARCHAR(20) NOT NULL,
    "pin" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_card_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_card_id_pin_key" ON "user_card"("id", "pin");
