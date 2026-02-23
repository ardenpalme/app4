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
import { OptionsStrategyLegSchema, OptionsStrategySchema } from "@/schemas/blog"
import { format } from "@formkit/tempo"

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
        const resp = await fetch('/api/portfolio' )
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

  const {data : options_strategies_raw, isLoading : optionsStrategiesLoading, isError} = trpc.strategy.listAll.useQuery()
  console.log(options_strategies_raw)

  //TODO Prisma returns date as ISO
  const optionsStrategies = options_strategies_raw?.map((strategy) => ({
    ...strategy,
    date: new Date(strategy.date), 
    legs: strategy.legs.map((leg) => ({
      ...leg,
      expiry: new Date(leg.expiry), 
    })),
  }));

  if (loading || optionsStrategiesLoading) {
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
          <CardTitle>Trading Log</CardTitle>
        </CardHeader>
        <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">
                <span className="sr-only">Expand</span>
              </TableHead>
              <TableHead className="hidden sm:table-cell">Date</TableHead>
              <TableHead className="hidden sm:table-cell">Underlying</TableHead>
              <TableHead>Strategy</TableHead>
              <TableHead className="hidden sm:table-cell text-right">P&L</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead className="w-10">
                <span className="sr-only">Write-up</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {optionsStrategies?.map((strat) => (
              <OptionsTradeRow key={strat.id} strat={strat} />
            ))}
          </TableBody>
        </Table>
          
        </CardContent>
      </Card>
    </>
  );
}

function OptionsTradeRow({strat} : {strat: OptionsStrategySchema }) {
  const [open, setOpen] = useState(false)
  
  return (
    <>
      <TableRow
        className="cursor-pointer hover:bg-muted/50"
        onClick={() => setOpen((prev) => !prev)}
      >
        <TableCell>
          <ChevronDown
            className={`size-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
          />
        </TableCell>
        <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">{format(strat.date, "short", "en")}</TableCell>
        <TableCell className="hidden sm:table-cell font-medium">{strat.underlying}</TableCell>
        <TableCell>{strat.name}</TableCell>
        <TableCell className="hidden sm:table-cell text-right">
          {strat.pnl !== null ? (
            <span className={strat.pnl >= 0 ? "text-green-500" : "text-red-500"}>
              {formatCurrency(strat.pnl)}
            </span>
          ) : (
            <span className="text-muted-foreground">--</span>
          )}
        </TableCell>
        <TableCell className="hidden sm:table-cell">
          <Badge
            variant={
              strat.status === "OPEN"
                ? "default"
                : strat.status === "CLOSED"
                  ? "secondary"
                  : "outline"
            }
          >
            {strat.status}
          </Badge>
        </TableCell>
        <TableCell>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            asChild
            onClick={(e) => e.stopPropagation()}
          >
            <Link href={`/blog/${strat.post.slug}`}>
              <ExternalLink className="size-4" />
              <span className="sr-only">Read trade write-up</span>
            </Link>
          </Button>
        </TableCell>
      </TableRow>
      {open && (
        <tr>
          <td colSpan={9} className="p-0">
            <div className="border-b border-border bg-muted/30 px-6 py-3">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs">Direction</TableHead>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs">Strike</TableHead>
                    <TableHead className="text-xs">Expiry</TableHead>
                    <TableHead className="text-xs text-right hidden sm:table-cell">Contracts</TableHead>
                    <TableHead className="text-xs text-right hidden sm:table-cell">Premium</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {strat.legs.map((leg, i) => (
                    <TableRow key={i} className="hover:bg-transparent">
                      <TableCell className="py-1.5">
                        <Badge variant={leg.direction === "BUY" ? "default" : "secondary"} className="text-xs">
                          {leg.direction}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-1.5 text-sm">{leg.type}</TableCell>
                      <TableCell className="py-1.5 text-sm">{formatCurrency(leg.strike)}</TableCell>
                      <TableCell className="py-1.5 text-sm text-muted-foreground">{format(leg.expiry,"short","en")}</TableCell>
                      <TableCell className="py-1.5 text-sm text-right hidden sm:table-cell">{leg.contracts.length}</TableCell>
                      <TableCell className="py-1.5 text-sm text-right hidden sm:table-cell">{formatCurrency(leg.premium)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}


