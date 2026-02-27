import { EODHDRespDaily, EODHDRespHist, PricesResp, PricesRespHist } from '@/lib/types';
import { NextRequest, NextResponse } from 'next/server';

import '@/lib/envConfig'
import { format } from '@formkit/tempo';

const cache: Record<string, { data: any; timestamp: number }> = {}
const TTL=82_800_000 // 23 hours

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }) 
{

  const { slug } = await params
  const req_params = request.nextUrl.searchParams;
  const type = req_params.get('type');
  const from_date = req_params.get('from');
  const to_date = req_params.get('to');

  const now = Date.now()
  let key = `${slug}-${type}`
  if(from_date != null && to_date != null) key = `${slug}-${type}-${to_date}-${from_date}`
  if(cache[key] && (now - cache[key].timestamp < TTL)) {
    console.log("serving from cache")
    return NextResponse.json(cache[key].data)
  }

  let sym = ''
  if(type == 'CC') {
    sym = `${slug}-USD`
  }else if(type == 'US') {
    sym = `${slug}`
  }

  // Fetch historical data
  if(to_date != null && from_date != null) {
    const EODHD_url = "https://eodhd.com/api/eod/"
    const url_params = new  URLSearchParams({
      'fmt' : 'json',
      'from': from_date,
      'to': to_date,
      'period': 'd',
      'api_token' : `${process.env.EODHD_api_token}`,
    })
    console.log(EODHD_url + `${sym}.${type}?${url_params}`)

    try {
      const res = await fetch(EODHD_url + `${sym}.${type}?${url_params}`, {
        method : 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }, 
      });

      const eodhd_data : EODHDRespHist[] = await res.json()
      console.log(eodhd_data)
      // {"date":"2020-01-06","open":199.6,"high":202.77,"low":199.35,"close":202.33,"adjusted_close":176.1009,"volume":4660400}

      const ret : PricesRespHist[] = eodhd_data.map((ele) => {
        const tmp : PricesRespHist = {
          ticker: sym,
          date: ele.date,
          close: ele.close,
        }
        return tmp
      })


      cache[key] = {data: ret, timestamp:now}
      return NextResponse.json(ret)

    } catch (e) {
      console.error('EODHD error:', e);
      const ret : PricesRespHist = {
        ticker: sym,
        date: new Date(),
        close: 0,
      }
      return NextResponse.json([ret])
    }
  }

  // Fetch Daily Data (optionally from cache)
  if(from_date == null && to_date == null) {
    const EODHD_url = "https://eodhd.com/api/real-time/"
    const url_params = new  URLSearchParams({
      'fmt' : 'json',
      'api_token' : `${process.env.EODHD_api_token}`,
    })

    try {
      console.log(EODHD_url + `${sym}.${type}?${url_params}`)
      const res = await fetch(EODHD_url + `${sym}.${type}?${url_params}`, {
        method : 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }, 
      });

      const eodhd_data : EODHDRespDaily = await res.json()

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
      return NextResponse.json(ret)
    }
  }
}
