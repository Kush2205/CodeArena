-- DropForeignKey
ALTER TABLE "public"."Violation" DROP CONSTRAINT "Violation_problemId_fkey";

-- AlterTable
ALTER TABLE "Violation" ALTER COLUMN "problemId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Violation" ADD CONSTRAINT "Violation_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
