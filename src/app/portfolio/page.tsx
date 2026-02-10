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


export default function PortfolioPage() {
  const [cryptoPf, setCryptoPf] = useState<CryptoPortfolio>()
  const [tradPf, setTradPf] = useState<TradPortfolio>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const resp = await fetch('/api/portfolio')
        const coins : PfTokResp = await resp.json()

        const p_promises = Object.keys(coins).map(async (symbol) => {
          const resp = await fetch(`/api/prices/${symbol}?type=CC`)
          const newData : PricesResp = await resp.json()
          return {
            [symbol]: {
              ...newData[symbol], 
              ...coins[symbol],
              balance_usd : newData[symbol].close * coins[symbol].balance
            }
          }
        });
        const holdings_and_prices_arr = await Promise.all(p_promises)

        const digital_assets : CryptoPortfolio = holdings_and_prices_arr.reduce((acc, price) => {
          return {...acc, ...price}
        }, {})
        setCryptoPf(digital_assets)
        console.log(digital_assets)

        const resp3  = await fetch('/api/ibrk')
        const trad_pf : TradPortfolio = await resp3.json()
        setTradPf(trad_pf)
        console.log(trad_pf)

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

        <Card className="w-full gap-3">
          <CardHeader>
            <CardTitle>Portfolio Allocations</CardTitle>
            <CardDescription>
              Holdings as percent of total portfolio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="trad" className="w-full">
              <TabsList>
                <TabsTrigger value="trad">Stocks & Options</TabsTrigger>
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
                    <StockAllocations tradPf={tradPf} />
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
                    <CryptoAllocations cryptoPf={cryptoPf} />
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

