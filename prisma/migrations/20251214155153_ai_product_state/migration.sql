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
    "aiState" TEXT NOT NULL DEFAULT 'NEW',
    "aiScore" REAL,
    "aiNotes" TEXT,
    "aiLastScoredAt" DATETIME,
    "isWinner" BOOLEAN NOT NULL DEFAULT false,
    "last7Spend" REAL,
    "last7Revenue" REAL,
    "last7Roas" REAL,
    "last7Ctr" REAL,
    "last7Cpc" REAL,
    "last7Cpm" REAL,
    "last7Purchases" INTEGER,
    "last30Spend" REAL,
    "last30Revenue" REAL,
    "last30Roas" REAL,
    "last30Ctr" REAL,
    "last30Cpc" REAL,
    "last30Cpm" REAL,
    "last30Purchases" INTEGER,
    "dailyBudget" REAL,
    "budgetCap" REAL,
    "cooloffUntil" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Product" ("cjId", "cost", "createdAt", "currency", "externalId", "id", "image", "inventory", "mediaUrl", "name", "price", "profit", "shippingDays", "sku", "sourceId", "sourceUrl", "status", "supplier", "thumbnailUrl", "title", "updatedAt", "warehouse") SELECT "cjId", "cost", "createdAt", "currency", "externalId", "id", "image", "inventory", "mediaUrl", "name", "price", "profit", "shippingDays", "sku", "sourceId", "sourceUrl", "status", "supplier", "thumbnailUrl", "title", "updatedAt", "warehouse" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_cjId_key" ON "Product"("cjId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
