-- AlterTable
ALTER TABLE "profile"
ADD COLUMN "defaultReceiptEngine" TEXT NOT NULL DEFAULT 'basic',
ADD COLUMN "defaultCurrency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN "emailNotifications" BOOLEAN NOT NULL DEFAULT true;
