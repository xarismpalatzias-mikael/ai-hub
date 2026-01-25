/*
  Warnings:

  - You are about to drop the column `adId` on the `AdPerformance` table. All the data in the column will be lost.
  - You are about to drop the column `adName` on the `AdPerformance` table. All the data in the column will be lost.
  - You are about to drop the column `clicks` on the `AdPerformance` table. All the data in the column will be lost.
  - You are about to drop the column `conversions` on the `AdPerformance` table. All the data in the column will be lost.
  - You are about to drop the column `ctr` on the `AdPerformance` table. All the data in the column will be lost.
  - You are about to drop the column `impressions` on the `AdPerformance` table. All the data in the column will be lost.
  - You are about to drop the column `spend` on the `AdPerformance` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AdPerformance" (
    "status" TEXT,
    "id" TEXT NOT NULL PRIMARY KEY,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_AdPerformance" ("createdAt", "id", "status", "updatedAt") SELECT "createdAt", "id", "status", "updatedAt" FROM "AdPerformance";
DROP TABLE "AdPerformance";
ALTER TABLE "new_AdPerformance" RENAME TO "AdPerformance";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
