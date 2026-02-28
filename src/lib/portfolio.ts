"use client"

import { PosSchema } from "@/schemas/portfolio";
import { PfTokResp, PricesResp, TradPortfolio } from "./types";
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

    const cash = {
      id:nanoid(),
        date: new Date(),
      ticker: "CASH",
      quantity: trad_pf.allocation.assetClass.long["CASH"],
      type: "CASH"
    }

    return [...stocks_pf, ...crypto_pf, cash]
}
