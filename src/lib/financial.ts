import { PortfolioHoldings } from '@/lib/ibrk_types'
import { PfItem, PfTokResp, PricesResp } from './types'

export function calc_pf(coins : PfTokResp[], prices :PricesResp, pf:PortfolioHoldings) : PfItem[] {
  const pf_alloc: PfItem = Object.entries(pf.assetClass.long).reduce(
    (acc, [symbol, amount]) => {
      acc[symbol] = {
        balance_native: amount,
        balance_usd: symbol === "CASH"
          ? amount
          : amount * prices[symbol].close,
          close: symbol === "CASH" ? 1 : prices[symbol].close,
          pct_change: symbol === "CASH" ? 0 : prices[symbol].pct_change
      }
      return acc
    },
    {} as PfItem
  )

  return {...pf_alloc}
}
