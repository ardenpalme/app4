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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import MyPlot from "./plot";
import { Record } from "@prisma/client/runtime/client";

const portfolioHistory = [
  { date: "2025-01-01", balance: 10000 },
  { date: "2025-01-15", balance: 10450 },
  { date: "2025-02-01", balance: 9800 },
  { date: "2025-02-15", balance: 11200 },
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

export async function calculatePfData(poses : PosSchema[]) {
  const start_date = new Date("2026-02-01")
  const end_date = new Date() 

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
        date: start_date,
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

  const hist_prices : Record<string, {ticker: string, close: number}[]> = tf_data_red.reduce((acc, ele) => {
    const date = format(ele.date, "YYYY-MM-DD")
    if (!acc[date]) acc[date] = [];
    acc[date].push({ ticker: ele.ticker, close: ele.close });
    return acc
  }, {} as Record<string, {ticker: string, close: number}[]>)

  console.log(hist_prices)
  const nperiod_lb = 5
  const getClose = (dates: string[], idx : number, ticker : string) => {
    let iter = 0
    let price = null

    if(ticker === "CASH") return 1

    do { 
      price = hist_prices[dates[idx-iter]]?.find(ele => ele.ticker == ticker)
      if(price) return price.close
      
      iter += 1
    } while(iter < nperiod_lb && !price);


    return 0
  }

  const sortedTradingDates = Object.keys(hist_prices).map(date => date).slice().sort((a,b) => {
    return new Date(a).getTime() - new Date(b).getTime()
  })

  const tmp2 = sortedTradingDates.map((date, idx, arr) => {
    const curr_tf = timeframes.find((tf) => {
      return (isBefore(date, tf.to_date) && isAfter(date, tf.from_date)) || isEqual(date, tf.from_date) || isEqual(date, tf.to_date)
    })
    if(!curr_tf) {
      return {
        [format(date, "YYYY-MM-DD")]: [{
          balance: 0,
          quantity: 0,
          ticker: ''
        }]
      }
    }
    const trades_ = trades[format(curr_tf?.from_date, "YYYY-MM-DD")] || []
    const tmp4 = trades_.reduce((acc, pos) => {
      const date_str = format(date, "YYYY-MM-DD")
      if (!acc[date_str]) acc[date_str] = [];
      const close = getClose(arr, idx, pos.ticker)
      if(!close) console.error(`could not retrieve close in ${nperiod_lb} day(s) lookback [${pos.ticker}]`)
      
      acc[date_str].push({
        ...pos,
        balance: close ? (pos.quantity * close) : pos.quantity
      })
      return acc
    }, {} as Record<string, {ticker:string, balance: number, quantity: number}[]>)
    return tmp4
  })
  const combined = tmp2.flat().reduce((ele, acc)=> {
    return {...acc, ...ele}
  }, {})
  console.log(combined)

  const ret1 = Object.keys(combined).map((date) => {
    const curr_pos = combined[date]
    const comb = curr_pos.reduce((acc, pos) => {
      acc += pos.balance
      return acc
    }, 0)
    return {
      date,
      balance : comb,
    }
  })

  const ret2 = ret1.slice().sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  return {snaps : combined, plot_data: ret2}
}

function getUniqueTickers(poses : PosSchema[]) {
  const uniqueTickersMap = new Map<string, string >();
  poses?.forEach(pos => {
    const key = `${pos.id}`;
    if(!uniqueTickersMap.has(key)) {
      uniqueTickersMap.set(key, pos.ticker)
    }
  })
  return Array.from(uniqueTickersMap.values())
}

function getUniquePoses(poses : PosSchema[]) {
  const trades = poses.reduce((acc, ele) => {
    const date = format(ele.date, "YYYY-MM-DD")
    if (!acc[date]) acc[date] = [];
    acc[date].push({ ...ele });
    return acc
  }, {} as Record<string, PosSchema[]>)

  const uniquePosesMap = new Map<string, PosSchema >();
  Object.keys(trades).forEach(date => {
    const curr_trade = trades[date]
    curr_trade.forEach(trade => {
      const key = `${date}-${trade.ticker}-${trade.quantity}`
      if(!uniquePosesMap.has(key)) {
        uniquePosesMap.set(key, trade)
      }
    })
  })
  return Array.from(uniquePosesMap.values())
}

export function PortfolioUploader() {
  const [pf, setPf] = useState<PosSchema[] | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const {data : poses, refetch : refetchPoses} = trpc.pf.listAll.useQuery()
  const [isUpserting, setIsUpserting] = useState<boolean>(false);
  const [plotData, setPlotData] = useState<{date: Date, balance:number}[] | null>(null);
  const upsertPf = trpc.pf.upsertMany.useMutation();

  const syncPortfolio = async () => {
    setIsSyncing(true)
    try {
      const loc_poses = await fetchPortfolio() as PosSchema[]
      setPf(loc_poses); 

      if(isUpserting) {
        refetchPoses()
        const local_tickers = getUniqueTickers(loc_poses)
        const payload = local_tickers.map((ticker) => {
          const ret = loc_poses.find(ele => ele.ticker == ticker)
          if(ret) return ret
        })

        if(!payload.includes(undefined)) await upsertPf.mutateAsync(payload as PosSchema[]) 
        console.log(payload)
      }

      if(poses) { 
        const glob_poses = getUniquePoses([...loc_poses, ...poses.map(pos => ({...pos, date: new Date(pos.date)}))]); 
        const {plot_data, snaps} = await calculatePfData(glob_poses)
        setPlotData(plot_data.map(p => ({ date: new Date(p.date), balance: p.balance})));
      }

    } catch (err) {
      console.error("Failed to sync portfolio:", err);
      setIsSyncing(false)
    } finally {
      setIsSyncing(false)
    }
  }

  return(
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            Portfolio
          </CardTitle>
          <div className="flex items-center justify-between gap-x-8">
            <div className="flex gap-2">
              <Label>Update Remote</Label>
              <Checkbox checked={isUpserting} onCheckedChange={(checked) => setIsUpserting(checked === true)} />
            </div>
            <Button
              type="button"
              variant="default"
              onClick={syncPortfolio}
              className="cursor-pointer "
            >
              Sync
              {<RefreshCw className={isSyncing ? "animate-spin" : ""}/>}
            </Button>
          </div>
        </div>
        {plotData && (<MyPlot in_data={plotData} start_date="2026-02-10" end_date={format(new Date(), "YYYY-MM-DD")}/>)}
      </CardHeader>
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
                <Skeleton className="min-h-2"/>
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
