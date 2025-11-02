/*
  Warnings:

  - You are about to drop the column `submissionTokens` on the `Submission` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "submissionTokens";

-- CreateTable
CREATE TABLE "SubmissionToken" (
    "token" TEXT NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "status" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,

    CONSTRAINT "SubmissionToken_pkey" PRIMARY KEY ("token")
);

-- AddForeignKey
ALTER TABLE "SubmissionToken" ADD CONSTRAINT "SubmissionToken_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
