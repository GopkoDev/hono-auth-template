/*
  Warnings:

  - Added the required column `type` to the `email_verification_tokens` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EmailVerificationType" AS ENUM ('REGISTRATION', 'EMAIL_CHANGE');

-- AlterTable
ALTER TABLE "email_verification_tokens" ADD COLUMN     "type" "EmailVerificationType" NOT NULL;
