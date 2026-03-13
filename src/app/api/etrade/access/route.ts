import { NextRequest, NextResponse } from "next/server";
import { etrade } from "@/lib/etrade";

export async function POST(req: NextRequest) {
  const body = await req.json() as { verifier_code?: string };
  const oauth_verifier = body.verifier_code ?? "";
  console.log({oauth_verifier })

  const oauth_token = req.cookies.get("oauth_token")?.value ?? ""
  const oauth_token_secret = req.cookies.get("oauth_token_secret")?.value ?? "";

  if (!oauth_token || !oauth_token_secret) {
    return NextResponse.json({ error: "Missing OAuth token" }, { status: 400 });
  }
  const {access_token, access_secret} = await etrade.access(oauth_verifier, oauth_token, oauth_token_secret)

  const now = Date.now();
  const twoHoursInSeconds = 2 * 60 * 60;

  const resp = NextResponse.json({ success: true });
  resp.cookies.set("etrade_access_token", access_token!, { httpOnly: true, maxAge: twoHoursInSeconds, path: "/" });
  resp.cookies.set("etrade_access_secret", access_secret!, { httpOnly: true, maxAge: twoHoursInSeconds, path: "/" });
  resp.cookies.set("etrade_auth_ts", now.toString(), { httpOnly: true, maxAge: twoHoursInSeconds, path: "/" });

  return resp;
}

