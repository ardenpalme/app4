import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { isValidKey } from "@/lib/utils";

export const runtime = "nodejs";   // Bytes/Buffer need Node runtime

export async function POST(req: NextRequest) {
  const key = req.headers.get("x-api-key");
  if (!key || !isValidKey(key)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const messages = Buffer.from(await req.arrayBuffer());
  await prisma.deviceLog.create({
    data: { messages },
  });

  return NextResponse.json({ ok: true });
}
