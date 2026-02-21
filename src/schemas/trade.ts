import {z} from 'zod'

export const TradeDirectionEnum = z.enum([
  "LONG", 
  "SHORT"
])
export type TradeDirectionEnum = z.infer<typeof TradeDirectionEnum>

export const TradeStatusEnum = z.enum([
  "PENDING", 
  "FILLED", 
  "EXPIRED",
  "PARTIAL",
  "CANCELLED",
  "REJECTED",
])
export type TradeStatusEnum = z.infer<typeof TradeStatusEnum>

export const OrderTypeEnum = z.enum([
  "MARKET",
  "LIMIT",
  "STOP",
  "STOP_LIMIT",
  "TRAILING_STOP",
])
export type OrderTypeEnum = z.infer<typeof OrderTypeEnum >

export const CreateTradeSchema = z.object({
  date: z.date(),
  direction: TradeDirectionEnum,
  orderType: OrderTypeEnum,
  status: TradeStatusEnum,
  quantity: z.number(),
  limitPrice: z.number().optional(),
  filledPrice: z.number().optional(),
  fees: z.number().optional(),
  slippage: z.number().optional(),
  notes: z.string().optional(),
})
export type CreateTradeSchema = z.infer<typeof CreateTradeSchema>

export const TradeSchema = CreateTradeSchema.extend({
  id: z.number().nullable(),
  positionId: z.number(),
})
export type TradeSchema = z.infer<typeof TradeSchema>
