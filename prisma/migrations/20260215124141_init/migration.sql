/*
  Warnings:

  - The values [TRADE,RESEARCH] on the enum `PostType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `OptionsTradePost` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `content` on table `Post` required. This step will fail if there are existing NULL values in that column.
  - Made the column `summary` on table `Post` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PostType_new" AS ENUM ('OPTIONS_STRATEGY', 'GENERIC');
ALTER TABLE "Post" ALTER COLUMN "type" TYPE "PostType_new" USING ("type"::text::"PostType_new");
ALTER TYPE "PostType" RENAME TO "PostType_old";
ALTER TYPE "PostType_new" RENAME TO "PostType";
DROP TYPE "public"."PostType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "OptionsTradePost" DROP CONSTRAINT "OptionsTradePost_postId_fkey";

-- AlterTable
ALTER TABLE "Post" ALTER COLUMN "content" SET NOT NULL,
ALTER COLUMN "summary" SET NOT NULL;

-- DropTable
DROP TABLE "OptionsTradePost";

-- CreateTable
CREATE TABLE "OptionsStrategy" (
    "id" SERIAL NOT NULL,
    "PostId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "underlying" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "TradeStatus" NOT NULL,
    "netPremium" DOUBLE PRECISION NOT NULL,
    "pnl" DOUBLE PRECISION,

    CONSTRAINT "OptionsStrategy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OptionsStrategyLeg" (
    "id" SERIAL NOT NULL,
    "strategyId" INTEGER NOT NULL,
    "type" "OptionType" NOT NULL,
    "direction" "TradeDirection" NOT NULL,
    "strike" DOUBLE PRECISION NOT NULL,
    "expiry" TIMESTAMP(3) NOT NULL,
    "contracts" TEXT[],
    "premium" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "OptionsStrategyLeg_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OptionsStrategy_PostId_key" ON "OptionsStrategy"("PostId");

-- AddForeignKey
ALTER TABLE "OptionsStrategy" ADD CONSTRAINT "OptionsStrategy_PostId_fkey" FOREIGN KEY ("PostId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OptionsStrategyLeg" ADD CONSTRAINT "OptionsStrategyLeg_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "OptionsStrategy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
