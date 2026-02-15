import {z} from 'zod'

export const OptionTypeEnum = z.enum(["CALL", "PUT"])
export type OptionTypeEnum = z.infer<typeof OptionTypeEnum>

export const TradeDirectionEnum = z.enum(["BUY", "SELL"])
export type TradeDirectionEnum  = z.infer<typeof TradeDirectionEnum>

export const TradeStatusEnum = z.enum(["OPEN", "CLOSED", "EXPIRED"])
export type TradeStatusEnum = z.infer<typeof TradeStatusEnum>

export const PostTypeEnum = z.enum(["OPTIONS_STRATEGY", "GENERIC"])
export type PostTypeEnum = z.infer<typeof PostTypeEnum >

export const BlogPostSchema = z.object({
  id: z.number(),
  slug: z.string(),
  title: z.string(),
  date: z.date(),
  summary: z.string(),
  content: z.string().optional(),
  type: PostTypeEnum,
})
export type BlogPostSchema = z.infer<typeof BlogPostSchema>

export const OptionsStrategyLegSchema = z.object({
  id: z.number(),
  type: OptionTypeEnum,
  direction: TradeDirectionEnum,
  strike: z.number(),
  expiry: z.date(),
  contracts: z.array(z.string()),
  premium: z.number(),
})
export type OptionsStrategyLegSchema = z.infer<typeof OptionsStrategyLegSchema>

export const OptionsStrategySchema = z.object({
  id: z.number(),
  date: z.date(),
  underlying: z.string(),
  name: z.string(),
  status: TradeStatusEnum,
  netPremium: z.number(),
  pnl: z.number().nullable(),

  legs: z.array(OptionsStrategyLegSchema),
  post: z.object({
    slug: z.string(),
  })
})
export type OptionsStrategySchema = z.infer<typeof OptionsStrategySchema>

export const StrategySummary = z.object({
  date: z.date(),
  assets: z.array(z.string()),
  status: TradeStatusEnum
})
export type StrategySummary = z.infer<typeof StrategySummary >
