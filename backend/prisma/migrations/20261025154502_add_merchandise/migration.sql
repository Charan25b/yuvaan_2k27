-- CreateTable
CREATE TABLE "merchandise" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "price" DECIMAL(10,2),
    "orderFormUrl" TEXT,
    "availability" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "merchandise_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "merchandise_slug_key" ON "merchandise"("slug");

-- CreateIndex
CREATE INDEX "merchandise_isPublished_sortOrder_idx" ON "merchandise"("isPublished", "sortOrder");

-- CreateIndex
CREATE INDEX "merchandise_availability_idx" ON "merchandise"("availability");
