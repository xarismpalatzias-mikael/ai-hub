/*
  Warnings:

  - You are about to drop the column `adId` on the `AdPerformance` table. All the data in the column will be lost.
  - You are about to drop the column `dateFrom` on the `AdPerformance` table. All the data in the column will be lost.
  - You are about to drop the column `dateTo` on the `AdPerformance` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AdPerformance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "adName" TEXT NOT NULL,
    "impressions" INTEGER,
    "clicks" INTEGER,
    "spend" REAL,
    "ctr" REAL,
    "conversions" INTEGER,
    "status" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_AdPerformance" ("adName", "clicks", "conversions", "createdAt", "ctr", "id", "impressions", "spend", "status", "updatedAt") SELECT "adName", "clicks", "conversions", "createdAt", "ctr", "id", "impressions", "spend", "status", "updatedAt" FROM "AdPerformance";
DROP TABLE "AdPerformance";
ALTER TABLE "new_AdPerformance" RENAME TO "AdPerformance";
CREATE UNIQUE INDEX "AdPerformance_adName_key" ON "AdPerformance"("adName");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
