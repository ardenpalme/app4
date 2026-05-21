import {z} from 'zod'
import { PositionSchema, PositionStatusEnum, PositionTradesSchema } from './position'
import { TradeDirection } from '../../prisma/generated/prisma/enums'
import { OrderTypeEnum, TradeDirectionEnum, TradeStatusEnum } from './trade'
import { PositionTradesRow } from '@/app/_components/positions_trades_row'

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
    id: z.string().nullable(),
  }).nullable(),
  positions: z.array(PositionTradesSchema),
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
    id: z.string().nullable()
  })
})
export type UpsertStrategyInputSchema = z.infer<typeof UpsertStrategyInputSchema >
