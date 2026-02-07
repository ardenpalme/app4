export interface PfTokResp {
  symbol: string,
  logo: string,
  balance: number,
  contractAddress: string,
  error: boolean,
}

export interface PricesResp {
  symbol: string,
  close: number,
  pct_change: number,
}

