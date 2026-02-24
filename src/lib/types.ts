import { BlogPostSchema } from "@/schemas/blog"
import { PortfolioHoldings, Positions } from "./ibrk_types"
import { RiskProfileEnum, StrategyCategoryEnum, StrategyStatusEnum, TimeframeEnum } from "@/schemas/strategy"
import {z} from 'zod'

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

export const DisplayPostSchema = BlogPostSchema.extend({
  strategy: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    category: StrategyCategoryEnum,
    timeframe: TimeframeEnum,
    riskProfile: RiskProfileEnum,
    status: StrategyStatusEnum,
  })
})
export type DisplayPost = z.infer<typeof DisplayPostSchema>

export interface DatePickerProps {
  date: Date | undefined;
  setDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
}
