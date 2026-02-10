import { PortfolioHoldings, Positions } from "./ibrk_types"

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
