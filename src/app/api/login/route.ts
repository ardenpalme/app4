import { NextRequest, NextResponse } from "next/server";
import '@/lib/envConfig'

export async function POST(req: NextRequest) {
  const body = await req.json() as { password?: string };

  if (body.password === process.env.AUTH_PASSWORD) {
    const res = NextResponse.json({ success: true });
    res.cookies.set({
      name: "auth",
      value: "1",
      httpOnly: true,
      path: "/",
      maxAge: 24 * 60 * 60, // 1 day
    });
    return res;
  }

  return NextResponse.json({ success: false }, { status: 401 });
}
