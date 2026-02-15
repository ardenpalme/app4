import { PricesResp } from '@/lib/types';
import { NextRequest, NextResponse } from 'next/server';

import '@/lib/envConfig'

interface EODHDResp {
  code: string,
  timestamp: number,
  gmtoffset: number,
  open: number,
  high: number,
  low: number,
  close: number,
  volume: number,
  previousClose: number,
  change: number,
  change_p: number,
}

const cache: Record<string, { data: any; timestamp: number }> = {}
const TTL=82_800_000 // 23 hours

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }) 
{
  const { slug } = await params
  const req_params = request.nextUrl.searchParams;
  const type = req_params.get('type');

  const now = Date.now()
  const key = `${slug}-${type}`
  if(cache[key] && (now - cache[key].timestamp < TTL)) {
    console.log("serving from cache")
    return NextResponse.json(cache[key].data)
  }

  const EODHD_url = "https://eodhd.com/api/real-time/"
  const url_params = new  URLSearchParams({
    'fmt' : 'json',
    'api_token' : `${process.env.EODHD_api_token}`,
  })
  let sym = ''
  if(type == 'CC') {
    sym = `${slug}-USD`
  }else if(type == 'US') {
    sym = `${slug}`
  }
  try {
    console.log(EODHD_url + `${sym}.${type}?${url_params}`)
    const res = await fetch(EODHD_url + `${sym}.${type}?${url_params}`, {
      method : 'GET',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      }, 
    });

    const eodhd_data : EODHDResp = await res.json()

    const resp_out : PricesResp = {
      [slug] : {
        symbol: slug,
        pct_change : eodhd_data.change_p,
        close : eodhd_data.close
      }
    }
    cache[key] = {data: resp_out, timestamp:now}
    return NextResponse.json(resp_out)

  } catch (e) {
    console.error('EODHD error:', e);
    const ret = {
      [slug]: {
        symbol: slug,
        close: 0,
        pct_change: 0,
      }
    }
    cache[key] = {data: ret, timestamp:now}
    return NextResponse.json(ret)
  }
}
