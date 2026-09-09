import prisma from "@/lib/prisma";
import { isValidKey } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";   // Bytes/Buffer need Node runtime

export async function GET(req: NextRequest) {
  const in_key = req.headers.get("x-api-key");
  if (!isValidKey(in_key ?? "0", process.env.ESP32_API_KEY ?? "1")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await prisma.schedule.findFirst({
    select: {
      id: true,
      start: true,
      zone_durations: true,
      auto: true,
    },
  });

  return NextResponse.json(data);
}
