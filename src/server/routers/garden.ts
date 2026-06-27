import prisma from "@/lib/prisma";
import {z} from 'zod'
import { publicProcedure, router } from "../trpc";
import { LogLineSchema, ScheduleSchema } from '@/schemas/garden';
import { inflateSync, inflateRawSync } from "zlib";

export const GardenRouter = router({
  listAll: publicProcedure
    .output(z.array(ScheduleSchema))
    .query(async () => {
      const data = await prisma.schedule.findMany({
        select : {
          id: true,
          start: true,
          durationSec: true
        }
      })
      if(data == undefined) return []
      const result = z.array(ScheduleSchema).safeParse(data)
      if (!result.success) {
        const pretty = z.prettifyError(result.error);
        console.error("listAllSchedules",pretty)
        return []
      }
      return result.data
    }),
})

export const DeviceLogRouter = router({
  listLatest: publicProcedure
  .output(z.array(LogLineSchema))
  .query(async () => {
    const rows = await prisma.deviceLog.findMany({
      orderBy: { receivedAt: "desc" },
      take: 20,
      select: { compressed: true, encoding: true },
    });

    const lines: { time: Date | null; message: string }[] = [];
    for (const row of rows) {
      let text: string;
      try {
        const buf = Buffer.from(row.compressed);
        text = row.encoding === "deflate"
          ? inflateSync(buf).toString("utf8")
          : buf.toString("utf8");
      } catch {
        text = "[corrupt or unreadable log batch]";
      }

      for (const raw of text.split("\0")) {
        const line = raw.trim();
        if (!line) continue;

        // first token = unix epoch SECONDS
        const space = line.indexOf(" ");
        const epochStr = space === -1 ? line : line.slice(0, space);
        const rest     = space === -1 ? "" : line.slice(space + 1);

        const epoch = Number(epochStr);
        const time = Number.isFinite(epoch) && epoch > 0
          ? new Date(epoch * 1000)   // seconds -> ms
          : null;

        lines.push({ time, message: rest || line });
      }
    }
    return lines;
  }),
});
