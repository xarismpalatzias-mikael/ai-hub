/*
  Warnings:

  - Made the column `productId` on table `AIBrain` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AIBrain" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adId" TEXT,
    "productId" TEXT NOT NULL,
    "score" REAL,
    "state" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_AIBrain" ("adId", "createdAt", "id", "productId", "score", "state", "updatedAt") SELECT "adId", "createdAt", "id", "productId", "score", "state", "updatedAt" FROM "AIBrain";
DROP TABLE "AIBrain";
ALTER TABLE "new_AIBrain" RENAME TO "AIBrain";
CREATE UNIQUE INDEX "AIBrain_productId_key" ON "AIBrain"("productId");
CREATE INDEX "AIBrain_productId_idx" ON "AIBrain"("productId");
CREATE INDEX "AIBrain_adId_idx" ON "AIBrain"("adId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
