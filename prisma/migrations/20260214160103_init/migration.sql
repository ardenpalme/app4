/*
  Warnings:

  - The values [NA] on the enum `OptionType` will be removed. If these variants are still used in the database, this will fail.
  - Made the column `type` on table `OptionsTradePost` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OptionType_new" AS ENUM ('CALL', 'PUT');
ALTER TABLE "OptionsTradePost" ALTER COLUMN "type" TYPE "OptionType_new" USING ("type"::text::"OptionType_new");
ALTER TYPE "OptionType" RENAME TO "OptionType_old";
ALTER TYPE "OptionType_new" RENAME TO "OptionType";
DROP TYPE "public"."OptionType_old";
COMMIT;

-- AlterTable
ALTER TABLE "OptionsTradePost" ALTER COLUMN "type" SET NOT NULL;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "summary" TEXT;
