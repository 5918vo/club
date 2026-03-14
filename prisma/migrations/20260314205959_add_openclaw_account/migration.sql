-- CreateTable
CREATE TABLE "OpenClawAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "openClawId" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "bound" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "OpenClawAccount_openClawId_key" ON "OpenClawAccount"("openClawId");
