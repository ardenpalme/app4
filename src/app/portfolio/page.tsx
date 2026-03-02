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
import { trpc } from "../_trpc/client"
import MyPlot from "../_components/plot"
import { calculatePfData } from "../_components/portfolio_uploader"
import { PosSchema } from "@/schemas/portfolio"
import { Sen } from "next/font/google"
import { normalizePrices } from "@/lib/utils"
import { start } from "repl"

export default function PortfolioPage() {
  const [plotData, setPlotData] = useState<{date: Date, balance:number}[] | null>(null);
  const {data : pf, isLoading : isPfLoading} = trpc.pf.listAll.useQuery()
  const [allocDate, setAllocDate] = useState<Date | null>(null)
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [latestTrade, setLatestTrade] = useState< {balance: number, quantity: number, ticker: string}[] | null>(null)
  const [latestTradeTotalUSD, setLatestTradeTotalUSD] = useState<number | null>(null)

  useEffect(()=>{
    async function foo () {
      if(pf) {
        const tmp = pf.map((pos) => {
          return {
            ...pos,
            date: new Date(pos.date)
          }
        })
        const {plot_data, snaps} = await calculatePfData(tmp)
        console.log(snaps)
        setPlotData(normalizePrices(plot_data.map(p => ({ date: new Date(p.date), balance: p.balance}))));
        const dates = Object.keys(snaps).slice().sort((a,b) => {
          return new Date(a).getTime() - new Date(b).getTime()
        })
        console.log(dates)
        const firstTradeDate = dates[0]
        const lastTradeDate = dates[dates.length-1]
        setAllocDate(new Date(lastTradeDate))
        setStartDate(new Date(firstTradeDate))
        const lastTrade = snaps[lastTradeDate]
        setLatestTrade(lastTrade)
        //console.log(lastTrade)
        const latestTradeTotalUSD = lastTrade.reduce((acc, ele) => {
          acc += ele.balance
          return acc
        },0)
        setLatestTradeTotalUSD(latestTradeTotalUSD)
      }
    }
    foo();
  }, [pf])

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle> Investment Portfolio </CardTitle>
        {plotData && startDate && (
          <>
            <CardDescription>
              Percent increase from portfolio value in USD on <span>{format(startDate, "long")}</span>
            </CardDescription>
            <MyPlot in_data={plotData} start_date={format(startDate, "YYYY-MM-DD")} end_date={format(new Date(), "YYYY-MM-DD")}/>
          </>
        )}
        {(!plotData || !startDate) && <Skeleton className="w-full h-50"/>}
        </CardHeader>
      </Card>
      <Card className="w-full gap-4">
        <CardHeader>
          <CardTitle>
            Allocations
          </CardTitle>
          <CardDescription>
            Holdings as percent of total portfolio value in USD as of {allocDate && <span>{format(allocDate, "long")}</span>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {latestTrade && latestTradeTotalUSD && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticker</TableHead>
                <TableHead>Pct</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {latestTrade.map((trade) => (
                <TableRow key={trade.ticker}>
                  <TableCell> {trade.ticker} </TableCell>
                  <TableCell> {((trade.balance / latestTradeTotalUSD) * 100).toFixed(2)} </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>)}
          {(!latestTrade || !latestTradeTotalUSD) && (
            <Skeleton className="w-full h-50" />
          )}
        </CardContent>
      </Card>
    </>
  );
}
