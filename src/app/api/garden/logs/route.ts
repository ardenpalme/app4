import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { isValidKey } from "@/lib/utils";

export const runtime = "nodejs";   // Bytes/Buffer need Node runtime

export async function POST(req: NextRequest) {
  const key = req.headers.get("x-api-key");
  if (!key || !isValidKey(key)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // read the raw compressed bytes — do NOT inflate
  const compressed = Buffer.from(await req.arrayBuffer());
  const encoding = req.headers.get("content-encoding") ?? "text/plain";

  await prisma.deviceLog.create({
    data: {
      compressed,
      encoding,
    },
  });

  return NextResponse.json({ ok: true });
}
