import { PricesResp } from '@/lib/types';
import { NextRequest } from 'next/server';

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }) 
{
  const { slug } = await params
  const req_params = request.nextUrl.searchParams;
  const type = req_params.get('type');

  const EODHD_url = "https://eodhd.com/api/real-time/"
  const url_params = new  URLSearchParams({
    'fmt' : 'json',
    'api_token' : '6988a5f821a6e5.04358720',
  })
  try {
    console.error(EODHD_url + `${slug}-USD.${type}?${url_params}`)
    const res = await fetch(EODHD_url + `${slug}-USD.${type}?${url_params}`, {
      method : 'GET',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      }, 
    });

    const eodhd_data : EODHDResp = await res.json()

    const resp_out : PricesResp = {
      symbol: slug,
      pct_change : eodhd_data.change_p,
      close : eodhd_data.close
    }
    return Response.json(resp_out)

  } catch (e) {
    console.error('EODHD error:', e);
    return Response.json({
      symbol: slug,
      close: 0,
      pct_change: 0,
    })
  }
}
