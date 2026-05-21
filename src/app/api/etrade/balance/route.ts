import { NextRequest, NextResponse } from 'next/server';
import '@/lib/envConfig'
import { etrade } from '@/lib/etrade';

export async function GET(req: NextRequest) {
  const access_token = req.cookies.get("etrade_access_token")?.value ?? ""
  const access_secret = req.cookies.get("etrade_access_secret")?.value ?? "";

  const balance_url = `https://api.etrade.com/v1/accounts/${process.env.ETRADE_ACCOUNT_KEY_ID}/balance?instType=BROKERAGE&realTimeNAV=true`
  const data = await etrade.fetch(balance_url, access_token, access_secret)

  return NextResponse.json(data);
}


