-- Add monthly pro-receipt usage tracking fields on profile
ALTER TABLE "profile"
ADD COLUMN "proReceiptUsageCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "proReceiptUsageMonth" TEXT;
