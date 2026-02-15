-- CreateEnum
CREATE TYPE "OptionType" AS ENUM ('CALL', 'PUT', 'NA');

-- CreateEnum
CREATE TYPE "TradeDirection" AS ENUM ('BUY', 'SELL');

-- CreateEnum
CREATE TYPE "TradeStatus" AS ENUM ('OPEN', 'CLOSED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('TRADE', 'RESEARCH');

-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "content" TEXT,
    "type" "PostType" NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OptionsTradePost" (
    "id" SERIAL NOT NULL,
    "postId" INTEGER NOT NULL,
    "underlying" TEXT NOT NULL,
    "type" "OptionType",
    "direction" "TradeDirection" NOT NULL,
    "strike" DOUBLE PRECISION NOT NULL,
    "expiry" TEXT NOT NULL,
    "contracts" INTEGER NOT NULL,
    "premium" DOUBLE PRECISION NOT NULL,
    "status" "TradeStatus" NOT NULL,
    "pnl" DOUBLE PRECISION,

    CONSTRAINT "OptionsTradePost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OptionsTradePost_postId_key" ON "OptionsTradePost"("postId");

-- AddForeignKey
ALTER TABLE "OptionsTradePost" ADD CONSTRAINT "OptionsTradePost_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
