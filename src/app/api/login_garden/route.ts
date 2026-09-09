import { NextRequest, NextResponse } from "next/server";
import '@/lib/envConfig'

export async function POST(req: NextRequest) {
  const body = await req.json() as { password?: string };
  console.log("received:", JSON.stringify(body.password));
  console.log("expected:", JSON.stringify(process.env.GARDEN_PASSWORD));

  if (body.password === process.env.GARDEN_PASSWORD) {
    const res = NextResponse.json({ success: true });
    res.cookies.set({
      name: "garden_auth",
      value: "1",
      httpOnly: true,
      path: "/",
      maxAge: 24 * 60 * 60, // 1 day (seconds)
    });
    return res;
  }

  return NextResponse.json({ success: false }, { status: 401 });
}

