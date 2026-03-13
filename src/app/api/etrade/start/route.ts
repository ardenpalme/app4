import { NextRequest, NextResponse } from 'next/server';
import '@/lib/envConfig'
import { etrade } from '@/lib/etrade';

export async function GET(request: NextRequest) {
  const {authorizeUrl, oauth_token, oauth_token_secret} = await etrade.authenticate()
  console.log(authorizeUrl)

  const redirectUrl = new URL("/login_etrade", request.url);
  redirectUrl.searchParams.set("authorizeUrl", authorizeUrl.toString());

  const redirect_resp = NextResponse.redirect(redirectUrl);
  redirect_resp.cookies.set("oauth_token", oauth_token ?? "", { httpOnly: true });
  redirect_resp.cookies.set("oauth_token_secret", oauth_token_secret ?? "", { httpOnly: true });

  return redirect_resp
}

