"use client"

import { PortfolioSchema } from "@/schemas/portfolio";
import { PfTokResp, PricesResp, TradPortfolio } from "./types";
import { nanoid } from "nanoid";

export async function fetchPortfolio() {
    const resp = await fetch('/api/trezor')
    const coins : PfTokResp = await resp.json()

    const crypto_pf = Object.keys(coins).map((symbol) => {
      const ret : PortfolioSchema = {
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
      const ret : PortfolioSchema = {
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

export async function fetchPrices(pf : PortfolioSchema[]) {
  const ret = Promise.all(pf.map(async (pos) => {
    const ticker = pos.ticker
    let prices_arg = "US"
    if(pos.type == "STOCK") {
      prices_arg = "US"
    }else if(pos.type == "CRYPTO") {
      prices_arg = "CC"
    }
    const resp = await fetch(`/api/prices/${ticker}?type=${prices_arg}`)
    const resp_data : PricesResp = await resp.json()
    return {
      ticker,
      close: resp_data[ticker].close
    }
  }));
  return ret
}
