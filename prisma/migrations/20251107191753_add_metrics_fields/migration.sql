/*
  Warnings:

  - You are about to drop the column `productId` on the `AdPerformance` table. All the data in the column will be lost.
  - Made the column `adId` on table `AdPerformance` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AdPerformance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adId" TEXT NOT NULL,
    "adName" TEXT,
    "impressions" INTEGER,
    "clicks" INTEGER,
    "spend" REAL,
    "revenue" REAL,
    "roas" REAL,
    "ctr" REAL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_AdPerformance" ("adId", "clicks", "createdAt", "ctr", "date", "id", "impressions", "revenue", "roas", "spend", "updatedAt") SELECT "adId", "clicks", "createdAt", "ctr", "date", "id", "impressions", "revenue", "roas", "spend", "updatedAt" FROM "AdPerformance";
DROP TABLE "AdPerformance";
ALTER TABLE "new_AdPerformance" RENAME TO "AdPerformance";
CREATE UNIQUE INDEX "AdPerformance_adId_key" ON "AdPerformance"("adId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
