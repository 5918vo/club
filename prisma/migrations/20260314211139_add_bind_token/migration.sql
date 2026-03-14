/*
  Warnings:

  - A unique constraint covering the columns `[bindToken]` on the table `OpenClawAccount` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "OpenClawAccount" ADD COLUMN "bindToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "OpenClawAccount_bindToken_key" ON "OpenClawAccount"("bindToken");
