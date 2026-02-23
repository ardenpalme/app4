import {z} from 'zod'
import { CreateTradeSchema, TradeSchema } from './trade'

export const PositionStatusEnum = z.enum([
  "OPEN",
  "CLOSED",
  "EXPIRED",
  "STOPPED",
])
export type PositionStatusEnum = z.infer<typeof PositionStatusEnum >

export const CreatePositionSchema = z.object({
  underlying: z.string(),
  openedAt : z.coerce.date(),
  capitalUsed : z.number(),
  status: PositionStatusEnum,
  strategyId : z.number(),
})
export type CreatePositionSchema = z.infer<typeof CreatePositionSchema>

export const PositionSchema = CreatePositionSchema.extend({
  closedAt : z.coerce.date().nullable().optional(),
  realizedPnL : z.number().nullable().optional(),
  unrealizedPnL : z.number().nullable().optional(),
  returnPct : z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
})
export type PositionSchema = z.infer<typeof PositionSchema>

export const UpdatePositionSchema = PositionSchema.extend({
  positionId: z.number(),
})
export type UpdatePositionSchema = z.infer<typeof UpdatePositionSchema >

/*
export const PositionTradesSchema = PositionSchema.extend({
  positionId: z.number(),
  trades: z.array(z.object({id : z.number()})),
})
export type PositionTradesSchema = z.infer<typeof PositionTradesSchema >
*/


