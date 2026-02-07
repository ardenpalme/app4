import { PricesResp } from '@/lib/types';
import YahooFinance from '@gadicc/yahoo-finance2';
import { NextRequest } from 'next/server';

const yahooFinance = new YahooFinance()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }) 
{
  const queryOptions = { modules: ['price', 'summaryDetail'] }; // defaults
  const { slug } = await params
  //try {
    // TODO: lots of good data here to use
    const result = await yahooFinance.quoteSummary(`${slug}-USD`, queryOptions);
    /*
    const resp_out : PricesResp = {
      symbol: slug,
      pct_change : result.price?.regularMarketChangePercent,
      close : result.price?.regularMarketPrice
    }
    */
    return Response.json(result)

    /*
  } catch (e) {
    console.error('YFinance error:', e);
    return Response.json({
      symbol: slug,
      close: 0,
      pct_change: 0,
    })
  }
  */
}
