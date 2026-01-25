/*
  Warnings:

  - You are about to drop the column `source` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `thumbUrl` on the `Product` table. All the data in the column will be lost.
  - Made the column `source` on table `SpyProduct` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cjId" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "warehouse" TEXT,
    "title" TEXT,
    "price" REAL,
    "status" TEXT,
    "sourceId" TEXT,
    "supplier" TEXT,
    "externalId" TEXT,
    "sku" TEXT,
    "cost" REAL,
    "profit" REAL,
    "currency" TEXT,
    "sourceUrl" TEXT,
    "mediaUrl" TEXT,
    "thumbnailUrl" TEXT,
    "shippingDays" INTEGER,
    "inventory" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Product" ("cjId", "cost", "createdAt", "currency", "externalId", "id", "image", "inventory", "mediaUrl", "name", "price", "profit", "shippingDays", "sku", "sourceId", "sourceUrl", "status", "supplier", "title", "updatedAt", "warehouse") SELECT "cjId", "cost", "createdAt", "currency", "externalId", "id", "image", "inventory", "mediaUrl", "name", "price", "profit", "shippingDays", "sku", "sourceId", "sourceUrl", "status", "supplier", "title", "updatedAt", "warehouse" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_cjId_key" ON "Product"("cjId");
CREATE TABLE "new_SpyProduct" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "source" TEXT NOT NULL,
    "externalId" TEXT,
    "title" TEXT,
    "adUrl" TEXT,
    "storeUrl" TEXT,
    "country" TEXT,
    "impressions" INTEGER,
    "likes" INTEGER,
    "comments" INTEGER,
    "shares" INTEGER,
    "thumbnail" TEXT,
    "price" REAL,
    "currency" TEXT,
    "firstSeen" DATETIME,
    "lastSeen" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "raw" JSONB
);
INSERT INTO "new_SpyProduct" ("adUrl", "comments", "country", "createdAt", "externalId", "firstSeen", "id", "impressions", "lastSeen", "likes", "shares", "source", "storeUrl", "thumbnail", "title", "updatedAt") SELECT "adUrl", "comments", "country", "createdAt", "externalId", "firstSeen", "id", "impressions", "lastSeen", "likes", "shares", "source", "storeUrl", "thumbnail", "title", "updatedAt" FROM "SpyProduct";
DROP TABLE "SpyProduct";
ALTER TABLE "new_SpyProduct" RENAME TO "SpyProduct";
CREATE INDEX "SpyProduct_source_externalId_idx" ON "SpyProduct"("source", "externalId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
