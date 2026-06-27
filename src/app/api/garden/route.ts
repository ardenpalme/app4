import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";

function isValidKey(provided: string): boolean {
  const expected = process.env.ESP32_API_KEY;
  if (!expected) return false;

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  // Length check first — timingSafeEqual throws on length mismatch
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function GET(req: NextRequest) {
  // 1. Extract the key from the request
  const apiKey = req.headers.get("x-api-key");

  // 2. Validate
  if (!apiKey || !isValidKey(apiKey)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // 3. Do the work
  const data = { message: "hello", time: Date.now() };
  return NextResponse.json(data);
}



