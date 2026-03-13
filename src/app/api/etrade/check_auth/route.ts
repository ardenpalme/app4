import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const accessToken = req.cookies.get("etrade_access_token")?.value;
  const accessSecret = req.cookies.get("etrade_access_secret")?.value;
  const authTs = req.cookies.get("etrade_auth_ts")?.value;

  const now = Date.now();
  const twoHours = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

  let authenticated = false;

  if (accessToken && accessSecret && authTs) {
    const elapsed = now - parseInt(authTs, 10);
    if (elapsed < twoHours) {
      authenticated = true;
    } else {
      // Token expired — clear cookies
      const resp = NextResponse.json({ authenticated: false });
      resp.cookies.set("etrade_access_token", "", { maxAge: 0, path: "/" });
      resp.cookies.set("etrade_access_secret", "", { maxAge: 0, path: "/" });
      resp.cookies.set("etrade_auth_ts", "", { maxAge: 0, path: "/" });
      return resp;
    }
  }

  return NextResponse.json({ authenticated });
}
