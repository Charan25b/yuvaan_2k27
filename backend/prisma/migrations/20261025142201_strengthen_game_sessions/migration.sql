/*
  Warnings:

  - A unique constraint covering the columns `[challengeId,userId]` on the table `game_sessions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `playDate` to the `game_sessions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "game_sessions" ADD COLUMN     "accessQrId" TEXT,
ADD COLUMN     "playDate" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "game_sessions_userId_playDate_idx" ON "game_sessions"("userId", "playDate");

-- CreateIndex
CREATE UNIQUE INDEX "game_sessions_challengeId_userId_key" ON "game_sessions"("challengeId", "userId");

-- AddForeignKey
ALTER TABLE "game_sessions" ADD CONSTRAINT "game_sessions_accessQrId_fkey" FOREIGN KEY ("accessQrId") REFERENCES "game_access_qrs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
