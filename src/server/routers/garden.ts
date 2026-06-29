import prisma from "@/lib/prisma";
import {z} from 'zod'
import { publicProcedure, router } from "../trpc";
import { LogLineSchema, ScheduleSchema } from '@/schemas/garden';

export const GardenRouter = router({
  list: publicProcedure
    .output(ScheduleSchema.nullable())
    .query(async () => {
      return prisma.schedule.findFirst({
        select : {
          id: true,
          start: true,
          durationSec: true,
          auto: true,
        }
      })
    }),

  updateUnique: publicProcedure
    .input(ScheduleSchema)
    .mutation(async ({input}) => {
      return prisma.schedule.update({
        where: {id: input.id},
        data: {
          start: input.start,
          auto: input.auto,
          durationSec: input.durationSec
        }
      })
    })
})

export const DeviceLogRouter = router({
  listLatest: publicProcedure
  .output(z.array(LogLineSchema))
  .query(async () => {
    const rows = await prisma.deviceLog.findMany({
      orderBy: { receivedAt: "desc" },
      take: 20, // batches of 32
      select: { messages: true },
    });

    let lines: { time: Date | null; message: string }[] = [];
    for (const row of rows) {
      let text: string;
      const buf = Buffer.from(row.messages);
      text = buf.toString("utf8");
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
