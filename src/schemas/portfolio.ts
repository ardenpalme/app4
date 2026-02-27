import {z} from 'zod'

export const PfPositionTypeEnum = z.enum(["STOCK", "CRYPTO", "CASH"])
export type PfPositionTypeEnum  = z.infer<typeof PfPositionTypeEnum >

export const PosSchema = z.object({
  id: z.string(),
  date: z.coerce.date(),
  ticker: z.string(),
  quantity: z.number(),
  type: PfPositionTypeEnum,
})
export type PosSchema = z.infer<typeof PosSchema>
