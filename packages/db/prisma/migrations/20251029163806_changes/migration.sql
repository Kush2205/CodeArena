-- AlterTable
ALTER TABLE "Contest" ADD COLUMN     "EndTime" TIMESTAMP(3),
ADD COLUMN     "StartTime" TIMESTAMP(3),
ADD COLUMN     "started" BOOLEAN NOT NULL DEFAULT false;
