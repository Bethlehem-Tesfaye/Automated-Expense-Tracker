-- AlterTable
ALTER TABLE "profile"
ALTER COLUMN "defaultCurrency" SET DEFAULT 'ETB';

-- Update existing defaults created before ETB became the default
UPDATE "profile"
SET "defaultCurrency" = 'ETB'
WHERE "defaultCurrency" = 'USD';
