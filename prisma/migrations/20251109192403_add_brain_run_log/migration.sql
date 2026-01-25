/*
  Warnings:

  - Made the column `adId` on table `AIBrain` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateTable
CREATE TABLE "BrainRunLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" DATETIME,
    "durationMs" INTEGER,
    "ok" BOOLEAN NOT NULL DEFAULT false,
    "mode" TEXT,
    "note" TEXT,
    "error" TEXT,
    "adsSeen" INTEGER,
    "brainsSeen" INTEGER,
    "winnersPicked" INTEGER,
    "budgetTotal" REAL,
    "budgetPerAd" REAL,
    "meta" JSONB
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AIBrain" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adId" TEXT NOT NULL,
    "productId" TEXT,
    "score" REAL,
    "state" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_AIBrain" ("adId", "createdAt", "id", "productId", "score", "state", "updatedAt") SELECT "adId", "createdAt", "id", "productId", "score", "state", "updatedAt" FROM "AIBrain";
DROP TABLE "AIBrain";
ALTER TABLE "new_AIBrain" RENAME TO "AIBrain";
CREATE UNIQUE INDEX "AIBrain_adId_key" ON "AIBrain"("adId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "idx_BrainRunLog_startedAt" ON "BrainRunLog"("startedAt");
