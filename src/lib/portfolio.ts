"use client"

import { PosSchema } from "@/schemas/portfolio";
import { PfTokResp, PortfolioResponse, Position, TradPortfolio } from "./types";
import { nanoid } from "nanoid";

export async function fetchPortfolio() {
    const resp = await fetch('/api/trezor')
    const coins : PfTokResp = await resp.json()

    const crypto_pf = Object.keys(coins).map((symbol) => {
      const ret : PosSchema = {
        id: nanoid(),
        date: new Date(), 
        ticker: symbol, 
        quantity: coins[symbol].balance,
        type: "CRYPTO",
      }
      return ret
    });

    const resp3  = await fetch('/api/ibrk')
    const trad_pf : TradPortfolio = await resp3.json()
    console.log(trad_pf)

    const stocks_pf = Object.keys(trad_pf.positions).map((ticker) => {
      const ret : PosSchema = {
        id: nanoid(),
        date: new Date(),
        ticker,
        quantity: trad_pf.positions[ticker].position,
        type: "STOCK",
      }
      return ret
    })

    let cash = {
      id:nanoid(),
        date: new Date(),
      ticker: "CASH",
      quantity: trad_pf.allocation.assetClass.long["CASH"],
      type: "CASH"
    }

    /*
    const resp5 = await fetch('/api/etrade/balance')
    const {BalanceResponse : etrade_balance} =  await resp5.json()
    cash.quantity = cash.quantity + Number(etrade_balance.Cash.moneyMktBalance)
    */

    let payload = [...stocks_pf, ...crypto_pf, cash]

    const resp4 = await fetch('/api/etrade/portfolio')
    const etrade_pf : PortfolioResponse = await resp4.json()
    if(etrade_pf && Object.entries(etrade_pf).length > 0) { 
      // Normalize positions to always be an array
      const positions: Position[] = Array.isArray(etrade_pf.PortfolioResponse.AccountPortfolio.Position)
        ? etrade_pf.PortfolioResponse.AccountPortfolio.Position
        : [etrade_pf.PortfolioResponse.AccountPortfolio.Position];

      console.log(etrade_pf)

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
      console.log(etrade_stocks_pf)
      payload = [...payload, ...etrade_stocks_pf]
    }

    return payload
}
