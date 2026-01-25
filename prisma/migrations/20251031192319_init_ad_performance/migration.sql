-- CreateTable
CREATE TABLE "AdPerformance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adId" TEXT NOT NULL,
    "adName" TEXT,
    "impressions" INTEGER,
    "clicks" INTEGER,
    "ctr" REAL,
    "spend" REAL,
    "conversions" INTEGER,
    "status" TEXT,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "AdPerformance_adId_key" ON "AdPerformance"("adId");
