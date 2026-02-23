import { PrismaClient, Prisma } from '../prisma/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'
import { nanoid } from 'nanoid'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({
  adapter,
})

// 2 strategy posts with nested positions and trades
const strategyPost: Prisma.StrategyCreateInput[] = [
  {
    id: nanoid(),
    name: 'Tech Swing',
    description: 'Swing trading strategy based on moving averages and RSI on major tech stocks.',
    category: 'SWING',
    timeframe: 'DAILY',
    riskProfile: 'MODERATE',
    status: 'ACTIVE',
    post: {
      create: {
        id: nanoid(),
        title: 'Swing Trading Strategy for Tech Stocks',
        slug: 'swing-trading-tech-stocks',
        content: 'This strategy uses the 50-day and 200-day moving averages along with RSI divergence to identify swing entries in stocks like AAPL, MSFT, and NVDA. Positions are held from a few days to several weeks.',
        summary: 'A systematic swing trading approach for tech stocks using moving averages and RSI.',
        type: 'STRATEGY',
        seoTitle: 'Swing Trading Tech Stocks Strategy',
        seoDescription: 'Learn a proven swing trading strategy for tech stocks using moving averages and RSI.',
      },
    },
    positions: {
      create: [
        {
          id: nanoid(),
          underlying: 'AAPL',
          status: 'OPEN',
          openedAt: new Date(),
          capitalUsed: 5000,
          thesis: 'Bullish breakout above resistance with strong volume.',
          notes: 'Entered after earnings dip; expecting recovery.',
          trades: {
            create: [
              {
                id: nanoid(),
                date: new Date(),
                direction: 'LONG',
                orderType: 'MARKET',
                status: 'FILLED',
                quantity: 33.333,
                filledPrice: 150.00,
                fees: 1.50,
                notes: 'Initial entry.',
              },
            ],
          },
        },
      ],
    },
  },
  {
    id: nanoid(),
    name: 'ES Scalper',
    description: 'Intraday scalping strategy on S&P 500 E-mini futures using order flow and market profile.',
    category: 'SCALP',
    timeframe: 'INTRADAY',
    riskProfile: 'HIGH',
    status: 'ACTIVE',
    post: {
      create: {
        id: nanoid(),
        title: 'Scalping ES Futures',
        slug: 'scalping-es-futures',
        content: 'This scalping strategy focuses on the ES futures during the first two hours of the session. Entries are based on order flow imbalances and market profile structure. Targets are typically 2-4 points with tight stops.',
        summary: 'High-frequency scalping approach for ES futures using order flow.',
        type: 'STRATEGY',
        seoTitle: 'Scalping ES Futures Strategy',
        seoDescription: 'Learn how to scalp ES futures using order flow and market profile.',
      },
    },
    positions: {
      create: [
        {
          id: nanoid(),
          underlying: 'ES',
          status: 'OPEN',
          openedAt: new Date(),
          capitalUsed: 10000,
          thesis: 'Strong buying pressure at support level.',
          notes: 'Scalping with partial exits.',
          trades: {
            create: [
              {
                id: nanoid(),
                date: new Date(),
                direction: 'LONG',
                orderType: 'MARKET',
                status: 'FILLED',
                quantity: 2,
                filledPrice: 5000.00,
                fees: 2.50,
                notes: 'Initial entry.',
              },
              {
                id: nanoid(),
                date: new Date(Date.now() + 3600000), // 1 hour later
                direction: 'LONG',
                orderType: 'LIMIT',
                status: 'FILLED',
                quantity: 1,
                limitPrice: 5005.00,
                filledPrice: 5005.00,
                fees: 1.25,
                notes: 'Added on pullback.',
              },
            ],
          },
        },
      ],
    },
  },
]

// 3 generic posts (standalone)
const genericPosts: Prisma.PostCreateInput[] = [
  {
    id: nanoid(),
    title: 'Understanding Market Cycles',
    slug: 'understanding-market-cycles',
    content: 'Market cycles are recurring patterns of bull and bear phases driven by investor psychology and economic conditions. This post explains the four stages: accumulation, markup, distribution, and markdown.',
    summary: 'A primer on the four stages of market cycles and how to identify them.',
    type: 'GENERIC',
    seoTitle: 'Market Cycles Explained',
    seoDescription: 'Learn about accumulation, markup, distribution, and markdown phases.',
  },
  {
    id: nanoid(),
    title: 'Risk Management in Trading',
    slug: 'risk-management-trading',
    content: 'Effective risk management is the cornerstone of long-term trading success. Topics include position sizing, stop-loss placement, risk-reward ratios, and diversification.',
    summary: 'Essential risk management techniques every trader should know.',
    type: 'GENERIC',
    seoTitle: 'Risk Management for Traders',
    seoDescription: 'Discover key risk management principles to protect your capital.',
  },
  {
    id: nanoid(),
    title: 'Technical Analysis Basics',
    slug: 'technical-analysis-basics',
    content: 'Technical analysis involves studying price charts and indicators to forecast future price movements. This article covers support/resistance, trend lines, and common chart patterns.',
    summary: 'An introduction to technical analysis concepts and tools.',
    type: 'GENERIC',
    seoTitle: 'Technical Analysis for Beginners',
    seoDescription: 'Learn the fundamentals of technical analysis including support, resistance, and patterns.',
  },
]

export async function main() {
  console.log('Seeding started...')

  for (const strategy of strategyPost) {
    await prisma.strategy.create({ data: strategy })
    console.log(`Created strategy: ${strategy.name}`)
  }

  for (const post of genericPosts) {
    await prisma.post.create({ data: post })
    console.log(`Created generic post: ${post.title}`)
  }

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
