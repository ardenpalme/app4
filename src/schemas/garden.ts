import {z} from 'zod'

export const ScheduleSchema = z.object({
  id: z.string(),
  start: z.string(),
  durationSec: z.int(),
  auto: z.boolean(),
})

export const LogsSchema = z.array(z.object({
  id: z.string(),
  receivedAt: z.date(),
  text: z.string(),
}))


export const LogLineSchema = z.object({
  time: z.date().nullable(),   // null if the line had no valid epoch
  message: z.string(),
});

