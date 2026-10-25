-- CreateEnum
CREATE TYPE "AnnouncementCategory" AS ENUM ('GENERAL', 'EVENT', 'REGISTRATION', 'SCHEDULE', 'IMPORTANT');

-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT,
    "content" TEXT NOT NULL,
    "category" "AnnouncementCategory" NOT NULL DEFAULT 'GENERAL',
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "announcements_slug_key" ON "announcements"("slug");

-- CreateIndex
CREATE INDEX "announcements_isPublished_publishedAt_idx" ON "announcements"("isPublished", "publishedAt");

-- CreateIndex
CREATE INDEX "announcements_expiresAt_idx" ON "announcements"("expiresAt");

-- CreateIndex
CREATE INDEX "announcements_category_idx" ON "announcements"("category");
