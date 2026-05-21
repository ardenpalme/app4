import { BlogPostSchema } from "@/schemas/blog"
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

export type DisplayPost = z.infer<typeof BlogPostSchema>

export interface DatePickerProps {
  date: Date | undefined;
  setDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
}

export interface EODHDRespDaily {
  code: string,
  timestamp: number,
  gmtoffset: number,
  open: number,
  high: number,
  low: number,
  close: number,
  volume: number,
  previousClose: number,
  change: number,
  change_p: number,
}

export interface EODHDRespHist {
  //{"date":"2020-01-06","open":199.6,"high":202.77,"low":199.35,"close":202.33,"adjusted_close":176.1009,"volume":4660400}
  date: Date,
  open: number,
  high: number,
  low: number,
  close: number,
  adjusted_close: number,
  volume: number,
}

export interface PricesRespHist{
  ticker: string,
  date: Date,
  close: number,
}

export type PortfolioResponse = {
  PortfolioResponse: {
    AccountPortfolio: {
      accountId: string;
      totalPages: number;
      Position: Position[] | Position; // can be array or single object
    };
  };
};

export type Position = {
  positionId: string;
  Product: Product;
  symbolDescription: string;
  dateAcquired: number;
  pricePaid: number;
  commissions: number;
  otherFees: number;
  quantity: number;
  positionIndicator: string;
  positionType: 'LONG' | 'SHORT';
  daysGain: number;
  daysGainPct: number;
  marketValue: number;
  totalCost: number;
  totalGain: number;
  totalGainPct: number;
  pctOfPortfolio: number;
  costPerShare: number;
  todayCommissions: number;
  todayFees: number;
  todayPricePaid: number;
  todayQuantity: number;
  Quick: QuickData;
  lotsDetails: string;
  quoteDetails: string;
};

export type Product = {
  expiryDay: number;
  expiryMonth: number;
  expiryYear: number;
  productId: {
    symbol: string;
  };
  securityType: 'EQ' | string;
  strikePrice: number;
  symbol: string;
};

export type QuickData = {
  change: number;
  changePct: number;
  lastTrade: number;
  lastTradeTime: number;
  volume: number;
};

