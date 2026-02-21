import { BlogPostSchema, StrategySummary } from "@/schemas/blog"
import { PortfolioHoldings, Positions } from "./ibrk_types"
import { CreateStrategyInputSchema } from "@/schemas/strategy"

export interface PfTokResp {
  [key: string]: {
    logo: string,
    balance: number,
    contractAddress: string,
  }
}

export interface PricesResp {
  [key: string]: {
    symbol: string,
    close: number,
    pct_change: number,
  }
}

export interface CryptoPortfolio{
  [key: string] : {
    logo: string,
    balance: number,
    contractAddress: string,
    balance_usd: number,
    close: number,
    pct_change: number,
  }
}

export interface TradPortfolio {
  positions : Positions,
  allocation: PortfolioHoldings,
}

export interface DisplayPost extends BlogPostSchema {
  data: CreateStrategyInputSchema | null,
}
