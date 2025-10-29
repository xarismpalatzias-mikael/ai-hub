/*
  Warnings:

  - Added the required column `adId` to the `AdPerformance` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AdPerformance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "adId" TEXT NOT NULL,
    "adName" TEXT NOT NULL,
    "status" TEXT,
    "spend" REAL NOT NULL DEFAULT 0,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "ctr" REAL NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "dateFrom" DATETIME,
    "dateTo" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_AdPerformance" ("adName", "clicks", "conversions", "createdAt", "ctr", "id", "impressions", "spend", "status", "updatedAt") SELECT "adName", coalesce("clicks", 0) AS "clicks", coalesce("conversions", 0) AS "conversions", "createdAt", coalesce("ctr", 0) AS "ctr", "id", coalesce("impressions", 0) AS "impressions", coalesce("spend", 0) AS "spend", "status", "updatedAt" FROM "AdPerformance";
DROP TABLE "AdPerformance";
ALTER TABLE "new_AdPerformance" RENAME TO "AdPerformance";
CREATE UNIQUE INDEX "AdPerformance_adId_key" ON "AdPerformance"("adId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
