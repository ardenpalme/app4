/*
 *
import { PortfolioHoldings } from '@/lib/ibrk_types'
import { PfItem, PfTokResp, PricesResp } from './types'
export function calc_pf(coins : PfTokResp[], prices :PricesResp, pf:PortfolioHoldings) : PfItem[] {
  const ibrk_cash = pf.assetClass.long.CASH;
  const dig_curr  = coins.map((e:PfTokResp) => {
    return {
      e.symbol : {
        balance_native: e.balance,
        balance_usd: e.balance * prices[e.symbol].close
      }
    }
  })

  const pf_alloc : PfItem = pf.map((e:))
  let out : PfItem[] = []
  for(var coin : PfTokResp in coins) {
    var item : PfItem; 
    item.symbol = coin.symbol;
    item.close = prices[item.symbol].close
  }
  return out
}

export function calc_pf_pct(pf : PortfolioHoldings,  )
{
    "resp2": {
        "assetClass": {
            "long": {
                "CASH": 50
            },
            "short": {}
        },
        "sector": {
            "long": {},
            "short": {}
        },
        "group": {
            "long": {},
            "short": {}
        }
    }
}
*/
