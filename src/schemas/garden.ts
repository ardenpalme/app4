import {z} from 'zod'

export const ScheduleSchema = z.object({
  id: z.string(),
  start: z.string(),
  durationSec: z.int()
})

