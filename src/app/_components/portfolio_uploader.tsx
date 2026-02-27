"use client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { fetchPortfolio } from "@/lib/portfolio";
import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PosSchema } from "@/schemas/portfolio";
import { trpc } from "../_trpc/client";
import { addDay, format, isAfter, isBefore, isEqual } from "@formkit/tempo";
import { CryptoPortfolio, PfTokResp, PricesResp, PricesRespHist, TradPortfolio } from "@/lib/types";
import { Positions } from "@/lib/ibrk_types";
import { start } from "repl";

const portfolioHistory = [
  { date: "2025-01-01", value: 10000 },
  { date: "2025-01-15", value: 10450 },
  { date: "2025-02-01", value: 9800 },
  { date: "2025-02-15", value: 11200 },
];

type histDataType = Record<string, { ticker: string; close: number }> 
type pfBalanceType = Record<string, { balance: number }> 

async function getDigitalAssets() {
  const resp = await fetch('/api/trezor')
  const coins : PfTokResp = await resp.json()

  const holdings = Object.keys(coins).map((symbol) => {
    return {
      [symbol]: {
        balance: coins[symbol].balance
      }
    }
  });

  return holdings.reduce((acc, price) => {
    return {...acc, ...price}
  }, {})
}

async function getTradAssets() {
  const resp3  = await fetch('/api/ibrk')
  const trad_pf : TradPortfolio = await resp3.json()

  return Object.keys(trad_pf.positions).reduce((acc, contract) => {
    const ret  = {
      [contract] : {
        balance: trad_pf.positions[contract].position,
      }
    }
    return {...ret, ...acc}
  }, {})
}

export async function caluclatePfData(poses : PosSchema[]) {
  const start_date = new Date("2026-02-01")
  const end_date = new Date("2026-02-26")

  // get tickers
  const uniqueTickersMap = new Map<string, { ticker: string; type: string }>();
  poses.forEach(pos => {
    const key = `${pos.ticker}-${pos.type}`;
    if(!uniqueTickersMap.has(key)) {
      uniqueTickersMap.set(key, {ticker: pos.ticker, type: pos.type})
    }
  })
  const uniqueTickers = Array.from(uniqueTickersMap.values())
  const trades = poses.reduce((acc, ele) => {
    const date = format(ele.date, "YYYY-MM-DD")
    if (!acc[date]) acc[date] = [];
    acc[date].push({ ticker: ele.ticker, quantity: ele.quantity });
    return acc
  }, {} as Record<string, { ticker: string; quantity: number }[]>)
  console.log(trades)

  // get timeframes
  const allDates = poses.map(pos => pos.date);
  const uniqueDates = Array.from(new Set(allDates));
  const sortedDates = uniqueDates.slice().sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime();
  });
  const timeframes = sortedDates.map((date,idx,arr) => {
    let from_date = "";
    if(idx == 0) {
      from_date = format(start_date, "YYYY-MM-DD", "en")
    } else {
      from_date = format(arr[idx-1], "YYYY-MM-DD", "en")
    }

    let to_date="";
    if(idx == arr.length - 1) {
      to_date = format(end_date, "YYYY-MM-DD", "en")
    }else{
      to_date = format(date, "YYYY-MM-DD", "en")
    }
    return { from_date, to_date}
  })

  const tf_data = await Promise.all(uniqueTickers.map(async (ele) => {
    const ticker = ele.ticker
    let prices_arg = ""
    if(ele.type == "STOCK") {
      prices_arg = "US"
    }else if(ele.type == "CRYPTO") {
      prices_arg = "CC"
    }else if(ele.type == "CASH") { // TODO
      return {
        ticker: "CASH",
        date: "",
        close: 1,
      }
    }

    const data = await Promise.all(timeframes.map(async (tf)=>{
      const resp = await fetch(`/api/prices/${ticker}?type=${prices_arg}&from=${tf.from_date}&to=${tf.to_date}`)
      const res = await resp.json()
      return res
    }));

    return data
    
  }));
  const tf_data_red = tf_data.flat(2)

  const hist_prices = tf_data_red.reduce((acc, ele) => {
    const date = format(ele.date, "YYYY-MM-DD")
    if (!acc[date]) acc[date] = [];
    acc[date].push({ ticker: ele.ticker, close: ele.close });
    return acc
  }, {} as Record<string, {ticker: string, close: number}>)

  const tmp2 = Object.keys(hist_prices).map((date) => {
    const curr_tf = timeframes.find((tf) => {
      return (isBefore(date, tf.to_date) && isAfter(date, tf.from_date)) || isEqual(date, tf.from_date)
    })
    if(!curr_tf) return {date: new Date(), balance: 0 }
    console.log(curr_tf)
    const trades_ = trades[format(curr_tf?.from_date, "YYYY-MM-DD")] || []
    const price = hist_prices[format(date, "YYYY-MM-DD")]
    const total = trades_.reduce((acc, pos) => {
      const p = price.find(ele => ele.ticker == pos.ticker)?.close
      acc += pos.quantity / p
      return acc
    }, 0)

    return {
      date,
      balance: total,
    }
  })

  return tmp2
}


export function PortfolioUploader() {
  const [pf, setPf] = useState<PosSchema[] | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const {data : poses} = trpc.pf.listAll.useQuery()

  const syncPortfolio = async () => {
    setIsSyncing(true)
    try {
      const data : PosSchema[] = await fetchPortfolio()
      setPf(data); 
    } catch (err) {
      console.error("Failed to sync portfolio:", err);
      setIsSyncing(false)
    } finally {
      setIsSyncing(false)
    }
  }

  useEffect(() => {
    async function foo() {
      if(poses)
      console.log(await caluclatePfData(poses))
    }
    foo()
  }, [poses])


  return(
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            Portfolio
          </CardTitle>
          <Button
            type="button"
            variant="default"
            onClick={syncPortfolio}
            className="cursor-pointer"
          >
            Sync
            {<RefreshCw className={isSyncing ? "animate-spin" : ""}/>}
            {/*TOOD Add a create trade tick mark so that you can refresh or create a trade or both at once*/}
          </Button>
        </div>
      </CardHeader>
      {/*<MyPlot data={portfolioHistory}/>*/}
      {pf && (<CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticker</TableHead>
              <TableHead className="text-right tabular-nums">Quantity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
          {isSyncing && (
            <TableRow>
              <TableCell colSpan={2}>
                <Skeleton />
              </TableCell>
            </TableRow>
          )}
          {pf.map((pos) => (
            <TableRow key={pos.id}>
              <TableCell>{pos.ticker}</TableCell>
              <TableCell className="text-right tabular-nums">{pos.quantity.toFixed(2)}</TableCell>
            </TableRow>
          ))}
          </TableBody>
        </Table>
      </CardContent>)}
    </Card>
  ); 
}
