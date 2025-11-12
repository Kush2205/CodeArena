-- CreateTable
CREATE TABLE "PassedTestCase" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "problemId" INTEGER NOT NULL,
    "contestId" INTEGER,
    "testCaseNumber" INTEGER NOT NULL,
    "passedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PassedTestCase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PassedTestCase_userId_problemId_contestId_idx" ON "PassedTestCase"("userId", "problemId", "contestId");

-- CreateIndex
CREATE UNIQUE INDEX "PassedTestCase_userId_problemId_contestId_testCaseNumber_key" ON "PassedTestCase"("userId", "problemId", "contestId", "testCaseNumber");
