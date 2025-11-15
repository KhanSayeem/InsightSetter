-- AlterTable
ALTER TABLE "Category"
ADD COLUMN     "navPinned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "navPinnedAt" TIMESTAMP(3);
