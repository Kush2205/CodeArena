/*
  Warnings:

  - The primary key for the `SubmissionToken` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[token]` on the table `SubmissionToken` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `SubmissionToken` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."SubmissionToken" DROP CONSTRAINT "SubmissionToken_submissionId_fkey";

-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "code" TEXT,
ADD COLUMN     "language" TEXT;

-- AlterTable
ALTER TABLE "SubmissionToken" DROP CONSTRAINT "SubmissionToken_pkey",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "passed" SET DEFAULT false,
ALTER COLUMN "status" SET DEFAULT 'pending',
ADD CONSTRAINT "SubmissionToken_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "SubmissionToken_token_key" ON "SubmissionToken"("token");

-- AddForeignKey
ALTER TABLE "SubmissionToken" ADD CONSTRAINT "SubmissionToken_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
