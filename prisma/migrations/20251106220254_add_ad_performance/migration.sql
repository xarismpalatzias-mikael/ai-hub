/*
  Warnings:

  - You are about to drop the column `adName` on the `AdPerformance` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AdPerformance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT,
    "adId" TEXT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "impressions" INTEGER,
    "clicks" INTEGER,
    "spend" REAL,
    "revenue" REAL,
    "ctr" REAL,
    "roas" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_AdPerformance" ("adId", "createdAt", "id", "impressions", "updatedAt") SELECT "adId", "createdAt", "id", "impressions", "updatedAt" FROM "AdPerformance";
DROP TABLE "AdPerformance";
ALTER TABLE "new_AdPerformance" RENAME TO "AdPerformance";
CREATE INDEX "AdPerformance_productId_date_idx" ON "AdPerformance"("productId", "date");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
