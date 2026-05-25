"use client"

import { PosSchema } from "@/schemas/portfolio";
import { PfTokResp, PortfolioResponse, Position} from "./types";
import { nanoid } from "nanoid";

export async function fetchPortfolio() {
    const resp = await fetch('/api/trezor')
    const coins : PfTokResp = await resp.json()

    let usdc_balance = 0;
    const crypto_pf_raw = Object.keys(coins).map((symbol) => {
      const ret : PosSchema = {
        id: nanoid(),
        date: new Date(), 
        ticker: symbol, 
        quantity: coins[symbol].balance,
        type: "CRYPTO",
      }
      return ret
    });
    
    const crypto_pf = crypto_pf_raw.filter((pos) => {
      if(pos.ticker == 'USDC'){
        usdc_balance = coins[pos.ticker].balance;
        return false
      }
      return true
    })

    console.log('crypto wallet:', crypto_pf)

    const resp5 = await fetch('/api/etrade/balance')
    const {BalanceResponse : etrade_balance} =  await resp5.json()

    let cash = {
      id:nanoid(),
        date: new Date(),
        ticker: "CASH",
        quantity: Number(etrade_balance.Cash.moneyMktBalance) + usdc_balance,
        type: "CASH"
    }

    let payload = [cash, ...crypto_pf]

    const resp4 = await fetch('/api/etrade/portfolio')
    const etrade_pf : PortfolioResponse = await resp4.json()
    if(etrade_pf && Object.entries(etrade_pf).length > 0) { 
      // Normalize positions to always be an array
      const positions: Position[] = Array.isArray(etrade_pf.PortfolioResponse.AccountPortfolio.Position)
        ? etrade_pf.PortfolioResponse.AccountPortfolio.Position
        : [etrade_pf.PortfolioResponse.AccountPortfolio.Position];

      const etrade_stocks_pf = positions.map((pos) => {
        const ret : PosSchema = {
          id: nanoid(),
          date: new Date(),
          ticker: pos.symbolDescription,
          quantity: pos.quantity,
          type: "STOCK",
        }
        return ret
      })
      payload = [...payload, ...etrade_stocks_pf]
    }

    return payload
}
