/*
  Warnings:

  - Changed the type of `type` on the `post_comment_media` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('photo', 'video');

-- DropIndex
DROP INDEX "post_comment_media_comment_id_idx";

-- DropIndex
DROP INDEX "post_comments_parent_comment_id_idx";

-- DropIndex
DROP INDEX "post_comments_post_id_idx";

-- DropIndex
DROP INDEX "post_comments_user_id_idx";

-- AlterTable
ALTER TABLE "post_comment_media" DROP COLUMN "type",
ADD COLUMN     "type" "MediaType" NOT NULL;
