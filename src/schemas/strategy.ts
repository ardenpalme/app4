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
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: StrategyCategoryEnum,
  timeframe: TimeframeEnum,
  riskProfile: RiskProfileEnum,
  status: StrategyStatusEnum,
  createdAt: z.date(),
  post: z.object({
    id: z.string(),
  }),
  positions: z.array(z.object({
    id: z.string(),
    underlying: z.string(),
    openedAt : z.coerce.date(),
    capitalUsed : z.number(),
    status: PositionStatusEnum,
    notes: z.string().nullable(),
    trades: z.array(z.object({
      id: z.string(),
      date: z.coerce.date(),
      direction: TradeDirectionEnum,
      orderType: OrderTypeEnum,
      status: TradeStatusEnum,
      quantity: z.number(),
    })),
  })),
})

/* HELPER SCHEMAS */
export const UpsertStrategyInputSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: StrategyCategoryEnum,
  timeframe: TimeframeEnum,
  riskProfile: RiskProfileEnum,
  status: StrategyStatusEnum,
  post: z.object({
    id: z.string()
  })
})
export type UpsertStrategyInputSchema = z.infer<typeof UpsertStrategyInputSchema >
