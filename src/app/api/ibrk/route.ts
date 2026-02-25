import { NextRequest, NextResponse } from 'next/server';
import { ibrk } from '@/lib/ibrk';
import '@/lib/envConfig'

const cache: Record<string, { data: any; timestamp: number }> = {}
const TTL=82_800_000 // 23 hours

export async function GET(request: NextRequest) {
  console.log(`LoggedIn status: ${ibrk.get_isLoggedIn()}, GW status : ${ibrk.get_isGWRunning() ? 'active' : 'inactive'}`)

  const now = Date.now()
  const key = 'ibrk'

  if(cache[key] && (now - cache[key].timestamp < TTL)) {
    console.log("serving from cache")
    return NextResponse.json(cache[key].data)
  }

  if(ibrk.get_isGWRunning() === false) {
    const res = await ibrk.startGW()
    console.log(res)
  }

  if(ibrk.get_isLoggedIn() === false) {
    if(ibrk.get_isGWRunning() === false) {
      console.log("Not logged in and GW not running - restarting GW")
      const res = await ibrk.startGW()
      console.log(res)
    }
    const res = await ibrk.login()
    console.log(res)
  }

  const allocation = await ibrk.request('GET',`/portfolio/${process.env.IBRK_accountId}/allocation`, {})

  const pos_pages = [0,1]
  const positions_arr = await Promise.all(
    pos_pages.map(
      async (page) => {
        return ibrk.request('GET',`/portfolio/${process.env.IBRK_accountId}/positions/${page}`, {})
      }
    )
  )

  const positions = positions_arr.flat().reduce((acc, elem) => {
    acc[elem.contractDesc] = {...elem, pct_total_pf: 0, pct_change: 0}
    return acc
  }, {})


  ibrk.stopGW() // since the caching time > timespan in which a login is required
  cache[key] = {data: {allocation, positions}, timestamp:now}
  return NextResponse.json({allocation, positions})
} 

