import {z} from 'zod'
import { PositionSchema, PositionStatusEnum } from './position'
import { TradeDirection } from '../../prisma/generated/prisma/enums'
import { OrderTypeEnum, TradeDirectionEnum, TradeStatusEnum } from './trade'

export const StrategyStatusEnum = z.enum([
  "DEVELOPMENT",
  "ACTIVE",
  "PAUSED",
  "RETIRED",
])
export type StrategyStatusEnum = z.infer<typeof StrategyStatusEnum >


export const StrategyCategoryEnum = z.enum([
  "INCOME",
  "SWING",
  "SCALP",
  "TREND",
  "BREAKOUT",
  "REVERSAL",
])
export type StrategyCategoryEnum = z.infer<typeof StrategyCategoryEnum >

export const TimeframeEnum = z.enum([
  "INTRADAY",
  "DAILY",
  "WEEKLY",
  "MONTHLY",
  "POSITION",
])
export type TimeframeEnum = z.infer<typeof TimeframeEnum >

export const RiskProfileEnum = z.enum([
  "LOW",
  "MODERATE",
  "HIGH",
  "SPECULATIVE",
])
export type RiskProfileEnum  = z.infer<typeof RiskProfileEnum >

export const StrategySchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  category: StrategyCategoryEnum,
  timeframe: TimeframeEnum,
  riskProfile: RiskProfileEnum,
  status: StrategyStatusEnum,
  createdAt: z.date().optional(),
  post: z.object({
    id: z.number()
  }),
  positions: z.array(z.object({
    id: z.number().nullable(),
    underlying: z.string(),
    openedAt : z.date(),
    capitalUsed : z.number(),
    status: PositionStatusEnum.nullable(),
    notes: z.string().optional(),
    trades: z.array(z.object({
      id: z.number().nullable(),
      date: z.date().nullable(),
      direction: TradeDirectionEnum.nullable(),
      orderType: OrderTypeEnum.nullable(),
      status: TradeStatusEnum.nullable(),
      quantity: z.number(),
    })),
  })),
})
export type StrategySchema = z.infer<typeof StrategySchema>


/* HELPER SCHEMAS */
export const CreateStrategyInputSchema = z.object({
  id: z.number().nullable(),
  name: z.string(),
  description: z.string(),
  category: StrategyCategoryEnum,
  timeframe: TimeframeEnum,
  riskProfile: RiskProfileEnum,
  status: StrategyStatusEnum,
  post: z.object({
    id: z.number()
  })
})
export type CreateStrategyInputSchema = z.infer<typeof CreateStrategyInputSchema >
