/*
  Warnings:

  - The `contracts` column on the `OptionsTradePost` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "OptionsTradePost" DROP COLUMN "contracts",
ADD COLUMN     "contracts" TEXT[];
