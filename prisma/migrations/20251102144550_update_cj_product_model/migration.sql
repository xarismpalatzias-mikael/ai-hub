/*
  Warnings:

  - You are about to drop the column `status` on the `AdPerformance` table. All the data in the column will be lost.
  - Added the required column `adId` to the `AdPerformance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cjId` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "SpyProduct" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "source" TEXT,
    "externalId" TEXT,
    "title" TEXT,
    "adUrl" TEXT,
    "storeUrl" TEXT,
    "country" TEXT,
    "firstSeen" DATETIME,
    "lastSeen" DATETIME,
    "impressions" INTEGER,
    "likes" INTEGER,
    "comments" INTEGER,
    "shares" INTEGER,
    "thumbnail" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AIBrain" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adId" TEXT,
    "productId" TEXT,
    "score" REAL,
    "state" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AdPerformance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adId" TEXT NOT NULL,
    "adName" TEXT,
    "impressions" INTEGER,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_AdPerformance" ("createdAt", "id", "updatedAt") SELECT "createdAt", "id", "updatedAt" FROM "AdPerformance";
DROP TABLE "AdPerformance";
ALTER TABLE "new_AdPerformance" RENAME TO "AdPerformance";
CREATE UNIQUE INDEX "AdPerformance_adId_key" ON "AdPerformance"("adId");
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cjId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "warehouse" TEXT,
    "title" TEXT NOT NULL,
    "price" REAL,
    "status" TEXT,
    "source" TEXT,
    "sourceId" TEXT,
    "supplier" TEXT,
    "externalId" TEXT,
    "sku" TEXT,
    "cost" REAL,
    "profit" REAL,
    "currency" TEXT,
    "sourceUrl" TEXT,
    "mediaUrl" TEXT,
    "thumbUrl" TEXT,
    "shippingDays" INTEGER,
    "inventory" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Product" ("createdAt", "id", "price", "status", "title", "updatedAt") SELECT "createdAt", "id", "price", "status", "title", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_cjId_key" ON "Product"("cjId");
CREATE INDEX "Product_supplier_externalId_idx" ON "Product"("supplier", "externalId");
CREATE UNIQUE INDEX "Product_source_sourceId_key" ON "Product"("source", "sourceId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "SpyProduct_source_externalId_idx" ON "SpyProduct"("source", "externalId");

-- CreateIndex
CREATE INDEX "AIBrain_productId_idx" ON "AIBrain"("productId");

-- CreateIndex
CREATE INDEX "AIBrain_adId_idx" ON "AIBrain"("adId");
