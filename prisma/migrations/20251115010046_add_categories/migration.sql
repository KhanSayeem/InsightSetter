/*
  Warnings:

  - You are about to drop the column `category` on the `Article` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `Article` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "railTitle" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- Seed default categories
INSERT INTO "Category" ("id","label","slug","description","railTitle") VALUES
  ('cat-markets-macro','Markets & Macro','markets-macro','Rate moves, liquidity signals, and policy decisions shaping the macro backdrop.','Markets & Macro'),
  ('cat-builders-operators','Builders & Operators','builders-operators','Playbooks from founders, product leaders, and operators executing in the arena.','Builders & Operators'),
  ('cat-capital-strategy','Capital & Strategy','capital-strategy','Private markets, corporate strategy, and the capital allocation bets defining the cycle.','Capital & Strategy'),
  ('cat-fast-takes','Fast Takes','fast-takes','Quick-hit insights and charts worth 3 minutes of your attention.',NULL),
  ('cat-deep-dives','Deep Dives','deep-dives','Long-form frameworks and essays to revisit and reference.',NULL),
  ('cat-case-studies','Case Studies','case-studies','In-depth analyses of companies and products: strategy, execution, and outcomes.',NULL);

-- Ensure column exists before dropping enum
ALTER TABLE "Article"
    ADD COLUMN "categoryId" TEXT;

-- Backfill new fk from old enum column
UPDATE "Article"
SET "categoryId" = CASE "category"
    WHEN 'MARKETS_MACRO' THEN 'cat-markets-macro'
    WHEN 'OPERATORS' THEN 'cat-builders-operators'
    WHEN 'CAPITAL_STRATEGY' THEN 'cat-capital-strategy'
    WHEN 'FAST_TAKE' THEN 'cat-fast-takes'
    WHEN 'DEEP_DIVE' THEN 'cat-deep-dives'
    WHEN 'CASE_STUDY' THEN 'cat-case-studies'
    ELSE 'cat-markets-macro'
END
WHERE "categoryId" IS NULL;

-- Enforce not null once data is migrated
ALTER TABLE "Article"
    ALTER COLUMN "categoryId" SET NOT NULL;

-- Drop old enum column now that data is copied
ALTER TABLE "Article"
    DROP COLUMN "category";

-- DropEnum
DROP TYPE "public"."ArticleCategory";

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
