/*
  Warnings:

  - You are about to drop the column `language` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `sourceCode` on the `Submission` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "language",
DROP COLUMN "sourceCode";
