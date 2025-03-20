/*
  Warnings:

  - The values [PENDING,COMPLETED] on the enum `TradeStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TradeStatus_new" AS ENUM ('OPEN', 'CLOSED', 'CANCELLED');
ALTER TABLE "Trade" ALTER COLUMN "status" TYPE "TradeStatus_new" USING ("status"::text::"TradeStatus_new");
ALTER TYPE "TradeStatus" RENAME TO "TradeStatus_old";
ALTER TYPE "TradeStatus_new" RENAME TO "TradeStatus";
DROP TYPE "TradeStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "Trade" ALTER COLUMN "transactionPairs" SET NOT NULL,
ALTER COLUMN "transactionPairs" SET DATA TYPE TEXT,
ALTER COLUMN "lots" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "lowerUnitPrice" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "currentPrice" DROP NOT NULL,
ALTER COLUMN "currentPrice" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "handlingFee" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "margin" DROP NOT NULL,
ALTER COLUMN "margin" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "profit" DROP NOT NULL,
ALTER COLUMN "profit" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "openTime" DROP NOT NULL,
ALTER COLUMN "closeTime" DROP NOT NULL;
