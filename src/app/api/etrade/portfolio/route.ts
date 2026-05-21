import { NextRequest, NextResponse } from 'next/server';
import '@/lib/envConfig'
import { etrade } from '@/lib/etrade';

export async function GET(req: NextRequest) {
  const access_token = req.cookies.get("etrade_access_token")?.value ?? ""
  const access_secret = req.cookies.get("etrade_access_secret")?.value ?? "";

  const portfolio_url = `https://api.etrade.com/v1/accounts/${process.env.ETRADE_ACCOUNT_KEY_ID}/portfolio`
  const data = await etrade.fetch(portfolio_url, access_token, access_secret)

  return NextResponse.json(data);
}

