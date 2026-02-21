import {z} from 'zod'
import { TradeSchema } from './trade'

export const PositionStatusEnum = z.enum([
  "OPEN",
  "CLOSED",
  "EXPIRED",
  "STOPPED",
])
export type PositionStatusEnum = z.infer<typeof PositionStatusEnum >

export const PositionSchema = z.object({
  id: z.number().nullable(),
  underlying: z.string(),
  openedAt : z.date(),
  closedAt : z.date().optional(),
  capitalUsed : z.number(),
  realizedPnL : z.number().optional(),
  unrealizedPnL : z.number().optional(),
  returnPct : z.number().optional(),
  thesis: z.string().optional(),
  notes: z.string().optional(),
  trades : z.array(TradeSchema),
  strategyId : z.number(),
})
export type PositionSchema = z.infer<typeof PositionSchema>

export const CreatePositionSchemaInput = z.object({
  underlying: z.string(),
  openedAt : z.date(),
  closedAt : z.date().optional(),
  capitalUsed : z.number(),
  realizedPnL : z.number().optional(),
  unrealizedPnL : z.number().optional(),
  returnPct : z.number().optional(),
  thesis: z.string().optional(),
  notes: z.string().optional(),
})
export type CreatePositionSchemaInput  = z.infer<typeof CreatePositionSchemaInput >
