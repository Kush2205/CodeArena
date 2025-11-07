-- AlterTable
ALTER TABLE "Contest" ADD COLUMN     "proctoringEnabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Problem" ADD COLUMN     "solved" BOOLEAN DEFAULT false;
