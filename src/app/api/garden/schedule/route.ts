import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { isValidKey } from "@/lib/utils";


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

  const data = await prisma.schedule.findFirst({
    select : {
      id: true,
      start: true,
      durationSec: true
    }
  });

  return NextResponse.json(data);
}


