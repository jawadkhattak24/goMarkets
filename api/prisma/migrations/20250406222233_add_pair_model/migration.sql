-- CreateTable
CREATE TABLE "Pair" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "isControlled" BOOLEAN NOT NULL DEFAULT false,
    "controlPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pair_pkey" PRIMARY KEY ("id")
);
