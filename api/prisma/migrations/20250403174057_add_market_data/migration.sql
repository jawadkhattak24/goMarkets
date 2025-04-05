-- CreateTable
CREATE TABLE "MarketData" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "open" DOUBLE PRECISION NOT NULL,
    "high" DOUBLE PRECISION NOT NULL,
    "low" DOUBLE PRECISION NOT NULL,
    "close" DOUBLE PRECISION NOT NULL,
    "volume" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketDataUpdate" (
    "symbol" TEXT NOT NULL,
    "lastUpdate" TIMESTAMP(3) NOT NULL,
    "nextUpdate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketDataUpdate_pkey" PRIMARY KEY ("symbol")
);

-- CreateIndex
CREATE INDEX "MarketData_symbol_time_idx" ON "MarketData"("symbol", "time");

-- CreateIndex
CREATE UNIQUE INDEX "MarketData_symbol_time_key" ON "MarketData"("symbol", "time");
