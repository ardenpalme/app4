import prisma from "@/lib/prisma";
import {z} from 'zod'
import { publicProcedure, router } from "../trpc";
import { ScheduleSchema } from '@/schemas/garden';

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
