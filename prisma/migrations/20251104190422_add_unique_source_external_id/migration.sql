/*
  Warnings:

  - A unique constraint covering the columns `[source,externalId]` on the table `SpyProduct` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "SpyProduct_source_externalId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "SpyProduct_source_externalId_key" ON "SpyProduct"("source", "externalId");
