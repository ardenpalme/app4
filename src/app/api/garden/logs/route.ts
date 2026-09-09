import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { isValidKey } from "@/lib/utils";

export const runtime = "nodejs";   // Bytes/Buffer need Node runtime

export async function POST(req: NextRequest) {
  const in_key = req.headers.get("x-api-key");
  if (!isValidKey(in_key ?? "0", process.env.ESP32_API_KEY ?? "1")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const messages = Buffer.from(await req.arrayBuffer());
  await prisma.deviceLog.create({
    data: { messages },
  });

  return NextResponse.json({ ok: true });
}
