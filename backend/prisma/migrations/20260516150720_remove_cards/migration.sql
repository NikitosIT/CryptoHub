/*
  Warnings:

  - You are about to drop the `user_card` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "twoFactor" ALTER COLUMN "verified" SET DEFAULT false;

-- DropTable
DROP TABLE "user_card";
