"use client"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import Link from "next/link"
import { ArrowLeft, ChevronDown, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { CryptoAllocations } from "../_components/allocations"
import { CryptoPortfolio, PfTokResp, PricesResp, TradPortfolio } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StockAllocations } from "../_components/stock_allocations"
import { Positions } from "@/lib/ibrk_types"
import { format } from "@formkit/tempo"
import {z} from 'zod'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { trpc } from "../_trpc/client"
import { StrategySchema } from "@/schemas/strategy"
import { PositionTradesRow } from "../_components/positions_trades_row"
import { PositionTradesSchema } from "@/schemas/position"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)
}

export default function PortfolioPage() {
  const [cryptoPf, setCryptoPf] = useState<CryptoPortfolio>()
  const [tradPf, setTradPf] = useState<TradPortfolio>()
  const [cash, setCash] = useState<Number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const resp = await fetch('/api/trezor')
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

        const trad_pf_asset_data_arr : PricesResp[] = await Promise.all(Object.keys(trad_pf.positions).map(async (ticker) => {
          const resp = await fetch(`/api/prices/${ticker}?type=US`)
          const resp_data : PricesResp = await resp.json()
          return resp_data
        }))
        const trad_pf_asset_data = trad_pf_asset_data_arr.reduce((acc,elem) => {
          return {...acc, ...elem}
        }, {})
        console.log(trad_pf_asset_data)


        const total_trad_assets_usd = Object.keys(trad_pf.allocation.assetClass.long).reduce((acc, asset) => {
            trad_pf.allocation.assetClass.long[asset]
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
              pct_total_pf: Number(norm_asset_price.toFixed(2)),
              pct_change : trad_pf_asset_data[contract].pct_change
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

  const {data : positions, isLoading : positionsLoading} = trpc.position.listAll.useQuery()
  console.log(positions)

  if (loading || positionsLoading) {
     return(
       <>
        <h1 className="text-2xl font-bold text-foreground">Investment Portfolio</h1>
        <Skeleton className="w-full h-64"/>
        <Skeleton className="w-full h-64"/>
      </>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-foreground">Investment Portfolio</h1>
      <Card className="w-full gap-4">
        <CardHeader>
          <CardTitle>Allocations</CardTitle>
          <CardDescription>
            Holdings as percent of total portfolio (currently {cash.toFixed(2)}% cash).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="trad" className="w-full">
            <TabsList>
              <TabsTrigger className="cursor-pointer" value="trad">Stocks</TabsTrigger>
              <TabsTrigger className="cursor-pointer" value="crypto">Crypto</TabsTrigger>
            </TabsList>
            <TabsContent value="trad">
              <Card className="w-full">
                <CardHeader>
                  <CardDescription>
                    Stocks managed via International Brokers.
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

      <Card className="w-full gap-4">
        <CardHeader>
          <CardTitle>Positions</CardTitle>
        </CardHeader>
        <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"> </TableHead>
              <TableHead className="hidden sm:table-cell">Underlying</TableHead>
              <TableHead className="hidden sm:table-cell">Date</TableHead>
              <TableHead className="hidden sm:table-cell">Capital Used</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {positions && positions.map((pos) => (
              <PositionTradesRow key={pos.id} position={PositionTradesSchema.parse(pos)} />
            ))}
          </TableBody>
        </Table>
          
        </CardContent>
      </Card>
    </>
  );
}
