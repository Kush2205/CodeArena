/*
  Warnings:

  - You are about to drop the column `boilerplateCode` on the `Problem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Problem" DROP COLUMN "boilerplateCode",
ADD COLUMN     "boilerplateCodeCpp" TEXT,
ADD COLUMN     "boilerplateCodeJava" TEXT,
ADD COLUMN     "boilerplateCodeJavaScript" TEXT,
ADD COLUMN     "boilerplateCodePython" TEXT;

-- CreateTable
CREATE TABLE "TestCase" (
    "id" SERIAL NOT NULL,
    "input" TEXT NOT NULL,
    "output" TEXT NOT NULL,
    "problemId" INTEGER NOT NULL,

    CONSTRAINT "TestCase_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TestCase" ADD CONSTRAINT "TestCase_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
