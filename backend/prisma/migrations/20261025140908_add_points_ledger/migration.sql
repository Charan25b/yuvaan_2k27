-- CreateEnum
CREATE TYPE "PointLedgerType" AS ENUM ('INDIVIDUAL', 'FACTION');

-- CreateEnum
CREATE TYPE "PointTransactionType" AS ENUM ('AWARD', 'ADJUSTMENT', 'REVERSAL');

-- CreateTable
CREATE TABLE "point_transactions" (
    "id" TEXT NOT NULL,
    "ledgerType" "PointLedgerType" NOT NULL,
    "transactionType" "PointTransactionType" NOT NULL,
    "userId" TEXT,
    "factionId" TEXT,
    "amount" INTEGER NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "reversesId" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "point_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "point_transactions_idempotencyKey_key" ON "point_transactions"("idempotencyKey");

-- CreateIndex
CREATE INDEX "point_transactions_ledgerType_createdAt_idx" ON "point_transactions"("ledgerType", "createdAt");

-- CreateIndex
CREATE INDEX "point_transactions_userId_createdAt_idx" ON "point_transactions"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "point_transactions_factionId_createdAt_idx" ON "point_transactions"("factionId", "createdAt");

-- CreateIndex
CREATE INDEX "point_transactions_sourceType_sourceId_idx" ON "point_transactions"("sourceType", "sourceId");

-- AddForeignKey
ALTER TABLE "point_transactions" ADD CONSTRAINT "point_transactions_reversesId_fkey" FOREIGN KEY ("reversesId") REFERENCES "point_transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "point_transactions" ADD CONSTRAINT "point_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "point_transactions" ADD CONSTRAINT "point_transactions_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "factions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
