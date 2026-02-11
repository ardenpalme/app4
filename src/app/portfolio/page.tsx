"use client"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { CryptoAllocations } from "../_components/allocations"
import { CryptoPortfolio, PfTokResp, PricesResp, TradPortfolio } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StockAllocations } from "../_components/stock_allocations"
import { Positions } from "@/lib/ibrk_types"

export default function PortfolioPage() {
  const [cryptoPf, setCryptoPf] = useState<CryptoPortfolio>()
  const [tradPf, setTradPf] = useState<TradPortfolio>()
  const [cash, setCash] = useState<Number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const resp = await fetch('/api/portfolio')
        const coins : PfTokResp = await resp.json()

        const p_promises = Object.keys(coins).map(async (symbol) => {
          const resp = await fetch(`/api/prices/${symbol}?type=CC`)
          const newData : PricesResp = await resp.json()
          const balance_usd = newData[symbol].close * coins[symbol].balance
          return {
            [symbol]: {
              ...newData[symbol], 
              ...coins[symbol],
              balance_usd : Number(balance_usd.toFixed(2))
            }
          }
        });
        const holdings_and_prices_arr = await Promise.all(p_promises)

        const digital_assets : CryptoPortfolio = holdings_and_prices_arr.reduce((acc, price) => {
          return {...acc, ...price}
        }, {})

        const total_digital_assets_usd = Object.keys(digital_assets).reduce((acc, token) => {
            return acc + digital_assets[token].balance_usd
          },0)

        const resp3  = await fetch('/api/ibrk')
        const trad_pf : TradPortfolio = await resp3.json()
        const total_trad_assets_usd = Object.keys(trad_pf.allocation.assetClass.long).reduce((acc, asset) => {
            return acc + trad_pf.allocation.assetClass.long[asset]
          },0)

        const total_pf = total_digital_assets_usd + total_trad_assets_usd

        const cash_pct = (trad_pf.allocation.assetClass.long["CASH"] / total_pf) * 100
        setCash(cash_pct)

        // normalize stock prices as % total portfolio
        const norm_trad_assets : Positions = Object.keys(trad_pf.positions).reduce((acc, contract) => {
          const norm_asset_price = (trad_pf.positions[contract].mktValue / total_pf) * 100
          const ret : Positions = {
            [contract] : {
              ...trad_pf.positions[contract],
              pct_total_pf: Number(norm_asset_price.toFixed(2))
            }
          }
          return {...ret, ...acc}
        }, {})

        setTradPf({positions: norm_trad_assets, allocation: trad_pf.allocation})
        console.log(tradPf)

        // normalize crypto prices as % total portfolio
        const norm_digital_assets = Object.keys(digital_assets).reduce((acc, symbol) => {
          const norm_asset_price = (digital_assets[symbol].balance_usd / total_pf) * 100
          const ret : CryptoPortfolio =  {
            [symbol]: {
              ...digital_assets[symbol],
              balance_usd : Number(norm_asset_price.toFixed(2))
            }
          }
          return {...ret, ...acc}
        }, {})

        setCryptoPf(norm_digital_assets)
        console.log(cryptoPf)

      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, []) // Empty array = runs once on mount

  if (loading) {
     return(
       <div className="min-h-screen bg-background">
        <header className="border-b border-border">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <Link href="/" className="font-semibold text-foreground">
              ADP
            </Link>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="size-4" />
                Back
              </Link>
            </Button>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-6 py-12">
          <h1 className="mb-8 text-2xl font-bold text-foreground">Investment Portfolio</h1>
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Strategy</h2>
              <div>
                This is a long-only swing-trading strategy for Ethereum and Bitcoin, 
                which achieved an SR of 1.8 with a MDD of 20% over 2024-2025. 
                For more details see
                [<Link href="https://github.com/ardenpalme/strat_v0/blob/main/strategy.ipynb" > 
                  <span className="underline underline-offset-1">link</span>
                </Link>].
              </div>
          </div>
          <Skeleton className="w-full h-64"/>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-semibold text-foreground">
            ADP
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="size-4" />
              Back
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="mb-8 text-2xl font-bold text-foreground">Investment Portfolio</h1>
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Strategy</h2>
            <div>
              This is a long-only swing-trading strategy for Ethereum and Bitcoin, 
              which achieved an SR of 1.8 with a MDD of 20% over 2024-2025. 
              For more details see
              [<Link href="https://github.com/ardenpalme/strat_v0/blob/main/strategy.ipynb" > 
                <span className="underline underline-offset-1">link</span>
              </Link>].
            </div>
        </div>

        <Card className="w-full gap-4">
          <CardHeader>
            <CardTitle>Portfolio Allocations</CardTitle>
            <CardDescription>
              Holdings as percent of total portfolio (currently {cash.toFixed(2)}% cash).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="trad" className="w-full">
              <TabsList>
                <TabsTrigger value="trad">Stocks</TabsTrigger>
                <TabsTrigger value="crypto">Crypto</TabsTrigger>
              </TabsList>
              <TabsContent value="trad">
                <Card className="w-full">
                  <CardHeader>
                    <CardDescription>
                      Stocks and Options managed via International Brokers.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-muted-foreground text-sm">
                  {tradPf ? (
                    <StockAllocations tradPf={tradPf} />
                  ) : (
                    <div>No portfolio available</div>  
                  )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="crypto">
                <Card>
                  <CardHeader>
                    <CardDescription>
                      Crytocurrencies stored in Trezor hardware wallet.
                    </CardDescription>
                      </CardHeader>
                      <CardContent className="text-muted-foreground text-sm">
                      {cryptoPf ? (
                        <CryptoAllocations cryptoPf={cryptoPf} />
                      ) : (
                      <div>No portfolio available</div>  
                      )}
                      </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

          </CardContent>
        </Card>
      </main>
    </div>
  );
}

