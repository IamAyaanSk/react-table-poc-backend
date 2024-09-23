/*
  Warnings:

  - Changed the type of `type` on the `ledger` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `purpose` on the `ledger` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "LedgerType" AS ENUM ('CREDIT', 'DEBIT');

-- CreateEnum
CREATE TYPE "LedgerPurpose" AS ENUM ('WALLET', 'FUND_REQUEST', 'SERVICE', 'COMMISION', 'SURCHARGE', 'REFUND');

-- AlterTable
ALTER TABLE "ledger" DROP COLUMN "type",
ADD COLUMN     "type" "LedgerType" NOT NULL,
DROP COLUMN "purpose",
ADD COLUMN     "purpose" "LedgerPurpose" NOT NULL;

-- CreateIndex
CREATE INDEX "ledger_type_idx" ON "ledger"("type");

-- CreateIndex
CREATE INDEX "ledger_purpose_idx" ON "ledger"("purpose");
