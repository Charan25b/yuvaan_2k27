-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "GameSessionStatus" AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'VALIDATED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ChallengeStatus" AS ENUM ('PENDING', 'ACCEPTED', 'COMPLETED', 'DECLINED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ChallengeResult" AS ENUM ('CHALLENGER_WON', 'OPPONENT_WON', 'DRAW');

-- CreateTable
CREATE TABLE "games" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "status" "GameStatus" NOT NULL DEFAULT 'DRAFT',
    "individualPoints" INTEGER NOT NULL DEFAULT 0,
    "factionPoints" INTEGER NOT NULL DEFAULT 0,
    "coverImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_qrs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "player_qrs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_access_qrs" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "game_access_qrs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "status" "GameSessionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "challengeId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "validatedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "score" INTEGER,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "game_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_challenges" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "challengerId" TEXT NOT NULL,
    "opponentId" TEXT NOT NULL,
    "status" "ChallengeStatus" NOT NULL DEFAULT 'PENDING',
    "result" "ChallengeResult",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "game_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "games_slug_key" ON "games"("slug");

-- CreateIndex
CREATE INDEX "games_status_name_idx" ON "games"("status", "name");

-- CreateIndex
CREATE UNIQUE INDEX "player_qrs_userId_key" ON "player_qrs"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "player_qrs_publicId_key" ON "player_qrs"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "game_access_qrs_publicId_key" ON "game_access_qrs"("publicId");

-- CreateIndex
CREATE INDEX "game_access_qrs_gameId_isActive_idx" ON "game_access_qrs"("gameId", "isActive");

-- CreateIndex
CREATE INDEX "game_sessions_userId_startedAt_idx" ON "game_sessions"("userId", "startedAt");

-- CreateIndex
CREATE INDEX "game_sessions_gameId_status_idx" ON "game_sessions"("gameId", "status");

-- CreateIndex
CREATE INDEX "game_sessions_challengeId_idx" ON "game_sessions"("challengeId");

-- CreateIndex
CREATE INDEX "game_challenges_challengerId_status_createdAt_idx" ON "game_challenges"("challengerId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "game_challenges_opponentId_status_createdAt_idx" ON "game_challenges"("opponentId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "game_challenges_gameId_status_idx" ON "game_challenges"("gameId", "status");

-- AddForeignKey
ALTER TABLE "player_qrs" ADD CONSTRAINT "player_qrs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_access_qrs" ADD CONSTRAINT "game_access_qrs_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_sessions" ADD CONSTRAINT "game_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_sessions" ADD CONSTRAINT "game_sessions_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_sessions" ADD CONSTRAINT "game_sessions_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "game_challenges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_challenges" ADD CONSTRAINT "game_challenges_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_challenges" ADD CONSTRAINT "game_challenges_challengerId_fkey" FOREIGN KEY ("challengerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_challenges" ADD CONSTRAINT "game_challenges_opponentId_fkey" FOREIGN KEY ("opponentId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
