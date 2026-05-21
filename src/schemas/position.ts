import {z} from 'zod'
import { CreateTradeSchema, OrderTypeEnum, TradeDirectionEnum, TradeSchema, TradeStatusEnum } from './trade'

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
  strategyId : z.string(),
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
  positionId: z.string(),
})
export type UpdatePositionSchema = z.infer<typeof UpdatePositionSchema >

export const PositionTradesSchema = z.object({
    id: z.string(),
    underlying: z.string(),
    openedAt : z.coerce.date() as z.ZodDate,
    capitalUsed : z.number(),
    status: PositionStatusEnum,
    notes: z.string().nullable(),
    trades: z.array(z.object({
      id: z.string(),
      date: z.coerce.date() as z.ZodDate,
      direction: TradeDirectionEnum,
      orderType: OrderTypeEnum,
      status: TradeStatusEnum,
      quantity: z.number(),
    })),
  })
  export type PositionTradesSchema = z.infer<typeof PositionTradesSchema >



