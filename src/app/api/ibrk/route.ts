import { NextRequest } from 'next/server';
import { ibrk } from '@/lib/ibrk';
import axios from 'axios';
import https from 'https';
import '@/lib/envConfig'

export async function GET(request: NextRequest) {
  console.log(`LoggedIn status: ${ibrk.get_isLoggedIn()}, GW status : ${ibrk.get_isGWRunning() ? 'active' : 'inactive'}`)

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

  const allocation = ibrk.request('GET',`/portfolio/${process.env.IBRK_accountId}/allocation`, {})

  const pos_pages = [0,1]
  const positions_arr = await Promise.all(
    pos_pages.map(
      async (page) => {
        return ibrk.request('GET',`/portfolio/${process.env.IBRK_accountId}/positions/${page}`, {})
      }
    )
  )

  const positions = positions_arr.flat().reduce((acc, elem) => {
    acc[elem.contractDesc] = elem
    return acc
  }, {})

  return Response.json({allocation, positions})
}

