import {z} from 'zod'

export const TradeDirectionEnum = z.enum([
  "LONG", 
  "SHORT"
])
export type TradeDirectionEnum = z.infer<typeof TradeDirectionEnum>

export const TradeStatusEnum = z.enum([
  "PENDING", 
  "FILLED", 
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
  date: z.coerce.date(),
  direction: TradeDirectionEnum,
  orderType: OrderTypeEnum,
  status: TradeStatusEnum,
  quantity: z.number(),
  positionId : z.string()
})
export type CreateTradeSchema = z.infer<typeof CreateTradeSchema>

export const TradeSchema = CreateTradeSchema.extend({
  limitPrice: z.number().nullable().optional(),
  filledPrice: z.number().nullable().optional(),
  fees: z.number().nullable().optional(),
  slippage: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
})
export type TradeSchema = z.infer<typeof TradeSchema>

export const UpdateTradeSchema = TradeSchema.extend({
  tradeId : z.string(),
})
export type UpdateTradeSchema  = z.infer<typeof UpdateTradeSchema >
