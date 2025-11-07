-- CreateTable
CREATE TABLE "PageView" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "occurredAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "countryCode" CHAR(2),
    "isBot" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PageView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PageView_articleId_occurredAt_idx" ON "PageView"("articleId", "occurredAt");

-- CreateIndex
CREATE INDEX "PageView_articleId_countryCode_idx" ON "PageView"("articleId", "countryCode");

-- CreateIndex
CREATE INDEX "PageView_occurredAt_idx" ON "PageView"("occurredAt");

-- CreateIndex
CREATE INDEX "PageView_countryCode_idx" ON "PageView"("countryCode");

-- AddForeignKey
ALTER TABLE "PageView" ADD CONSTRAINT "PageView_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
