"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Allocations } from "../_components/allocations"
import { PfTokResp, PricesResp } from "@/lib/types"


export default function PortfolioPage() {
  const [data, setData] = useState<PfTokResp[]>()
  const [prices, setPrices] = useState<PricesResp[]>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const resp3 = await fetch('/api/ibrk')
        const res3 = await resp3.json()
        console.log(res3)

	/*
        const resp = await fetch('/api/portfolio')
        const newData : PfTokResp[] = await resp.json()
        setData(newData)
        console.log(newData)

        const p_promises = newData.map(async (e) => {
          const resp = await fetch(`/api/prices/${e.symbol}?type=CC`)
          const newData : PricesResp = await resp.json()
          return newData
        });

        const ps : PricesResp[] = await Promise.all(p_promises)
        setPrices(ps)
        console.log(ps)
       */

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
      </main>
    </div>
  );
}

