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

export default function PortfolioPage() {
  const [plotData, setPlotData] = useState<{date: Date, balance:number}[] | null>(null);
  const {data : pf, isLoading : isPfLoading} = trpc.pf.listAll.useQuery()
  const [allocDate, setAllocDate] = useState<Date | null>(null)
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
        function normalizePrices(data : {date: string, balance: number}[]) {
          // assume dates sorted
          const ret = data.map((ele, idx, arr) => {
            let pct_change = 0
            if(idx > 0) {
              pct_change = (ele.balance - arr[idx-1].balance) / ele.balance
            }else{
              pct_change = 0
            }
            return {
              ...ele,
              balance: pct_change
            }
          })
          console.log(ret)
          return ret
        }
        const {plot_data, snaps} = await calculatePfData(tmp)
        setPlotData(plot_data.map(p => ({ date: new Date(p.date), balance: p.balance})));
        const dates = Object.keys(snaps).slice().sort((a,b) => {
          return new Date(a).getTime() - new Date(b).getTime()
        })
        const lastTradeDate = dates[dates.length-1]
        setAllocDate(new Date(lastTradeDate))
        const lastTrade = snaps[lastTradeDate]
        setLatestTrade(lastTrade)
        console.log(lastTrade)
        const latestTradeTotalUSD = lastTrade.reduce((acc, ele) => {
          acc += ele.balance
          return acc
        },0)
        setLatestTradeTotalUSD(latestTradeTotalUSD)
      }
    }
    foo();
  }, [pf])


  const {data : positions, isLoading : positionsLoading} = trpc.position.listAll.useQuery()
  console.log(positions)

  if (isPfLoading || positionsLoading) {
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
      <Card>
        <CardHeader>
          <CardTitle> Investment Portfolio
          </CardTitle>
        {plotData && (<MyPlot in_data={plotData} start_date="2026-02-10" end_date="2026-02-25"/>)}
        </CardHeader>
      </Card>
      <Card className="w-full gap-4">
        <CardHeader>
          <CardTitle>
            Allocations
            {allocDate && <span className="font-light px-2">({format(allocDate, "short")})</span>}
          </CardTitle>
          <CardDescription>
            Holdings as percent of total portfolio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticker</TableHead>
                <TableHead>Pct</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {latestTrade && latestTradeTotalUSD && latestTrade.map((trade) => (
                <TableRow key={trade.ticker}>
                  <TableCell> {trade.ticker} </TableCell>
                  <TableCell> {((trade.balance / latestTradeTotalUSD) * 100).toFixed(2)} </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
