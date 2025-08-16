/*
  Warnings:

  - You are about to drop the column `originalImageUrl` on the `Image` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Image" DROP COLUMN "originalImageUrl",
ADD COLUMN     "metadata" JSONB;

-- CreateIndex
CREATE INDEX "Image_userId_createdAt_idx" ON "public"."Image"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Image_status_idx" ON "public"."Image"("status");
