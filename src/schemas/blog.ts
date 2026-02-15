import {z} from 'zod'

export const OptionTypeEnum = z.enum(["CALL", "PUT"])
export type OptionTypeEnum = z.infer<typeof OptionTypeEnum>

export const TradeDirectionEnum = z.enum(["BUY", "SELL"])
export type TradeDirectionEnum  = z.infer<typeof TradeDirectionEnum>

export const TradeStatusEnum = z.enum(["OPEN", "CLOSED", "EXPIRED"])
export type TradeStatusEnum = z.infer<typeof TradeStatusEnum>

export const PostTypeEnum = z.enum(["TRADE", "RESEARCH"])
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

export const OptionsTradeDataSchema = z.object({
  id: z.number(),
  underlying: z.string(),
  type: OptionTypeEnum,
  direction: TradeDirectionEnum,
  strike: z.number(),
  expiry: z.date(),
  contracts: z.array(z.string()),
  premium: z.number(),
  status: TradeStatusEnum,
  pnl: z.number(),
})

export type OptionsTradeDataSchema = z.infer<typeof OptionsTradeDataSchema  >


