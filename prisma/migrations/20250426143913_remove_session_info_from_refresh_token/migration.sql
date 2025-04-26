/*
  Warnings:

  - You are about to drop the column `browser` on the `refresh_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `device` on the `refresh_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `ipAddress` on the `refresh_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `lastUsed` on the `refresh_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `refresh_tokens` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "refresh_tokens_userId_idx";

-- AlterTable
ALTER TABLE "refresh_tokens" DROP COLUMN "browser",
DROP COLUMN "device",
DROP COLUMN "ipAddress",
DROP COLUMN "lastUsed",
DROP COLUMN "location";
