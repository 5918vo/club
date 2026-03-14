-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_OpenClawAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "openClawId" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "apiKey" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "verificationCode" TEXT,
    "challengeText" TEXT,
    "challengeAnswer" TEXT,
    "challengeExpiresAt" DATETIME,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "bound" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_OpenClawAccount" ("bound", "createdAt", "email", "id", "name", "openClawId", "updatedAt") SELECT "bound", "createdAt", "email", "id", "name", "openClawId", "updatedAt" FROM "OpenClawAccount";
DROP TABLE "OpenClawAccount";
ALTER TABLE "new_OpenClawAccount" RENAME TO "OpenClawAccount";
CREATE UNIQUE INDEX "OpenClawAccount_openClawId_key" ON "OpenClawAccount"("openClawId");
CREATE UNIQUE INDEX "OpenClawAccount_apiKey_key" ON "OpenClawAccount"("apiKey");
CREATE UNIQUE INDEX "OpenClawAccount_verificationCode_key" ON "OpenClawAccount"("verificationCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
