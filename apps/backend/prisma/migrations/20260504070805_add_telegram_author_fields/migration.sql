/*
  Warnings:

  - Added the required column `tg_author_title` to the `telegram_posts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tg_author_username` to the `telegram_posts` table without a default value. This is not possible if the table is not empty.
  - Made the column `tg_author_id` on table `telegram_posts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `comments_count` on table `telegram_posts` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "telegram_posts" ADD COLUMN     "tg_author_title" TEXT NOT NULL,
ADD COLUMN     "tg_author_username" TEXT NOT NULL,
ALTER COLUMN "tg_author_id" SET NOT NULL,
ALTER COLUMN "tg_author_id" SET DATA TYPE TEXT,
ALTER COLUMN "comments_count" SET NOT NULL;
