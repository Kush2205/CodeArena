-- AlterTable
ALTER TABLE "Problem" ADD COLUMN     "difficulty" TEXT NOT NULL DEFAULT 'easy',
ADD COLUMN     "totalPoints" INTEGER NOT NULL DEFAULT 250;
