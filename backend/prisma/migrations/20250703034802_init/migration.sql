-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "pot" INTEGER NOT NULL,
    "playerAAddress" TEXT NOT NULL,
    "playerACommitment" TEXT NOT NULL,
    "playerAReveal" TEXT,
    "playerBAddress" TEXT,
    "playerBCommitment" TEXT,
    "playerBReveal" TEXT,
    "winner" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);
