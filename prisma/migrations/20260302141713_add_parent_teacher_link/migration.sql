-- CreateTable
CREATE TABLE "ParentTeacherLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "parentId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "ParentTeacherLink_parentId_idx" ON "ParentTeacherLink"("parentId");

-- CreateIndex
CREATE INDEX "ParentTeacherLink_teacherId_idx" ON "ParentTeacherLink"("teacherId");

-- CreateIndex
CREATE INDEX "ParentTeacherLink_createdAt_idx" ON "ParentTeacherLink"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ParentTeacherLink_parentId_teacherId_key" ON "ParentTeacherLink"("parentId", "teacherId");
