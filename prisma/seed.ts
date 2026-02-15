import {  PrismaClient, Prisma } from '../prisma/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({
  adapter,
});

const tradeStrategies: Prisma.OptionsStrategyCreateInput[] = [
  {
    underlying: "NVDA",
    name: "NVDA Bull Call Spread",
    date: new Date("2025-12-15"),
    status: "OPEN",
    netPremium: 2500,
    legs: {
      create: [
        {
          type: "CALL",
          direction: "BUY",
          strike: 600,
          expiry: new Date("2026-01-17"),
          contracts: ["C600"],
          premium: 50,
        },
        {
          type: "CALL",
          direction: "SELL",
          strike: 650,
          expiry: new Date("2026-01-17"),
          contracts: ["C650"],
          premium: 25,
        }
      ]
    },
    post: {
      create: {
        title: "NVDA Long Calls: AI Capex Cycle Acceleration",
        slug: "nvda-call-spread-ai-capex",
        date: new Date("2025-12-15"),
        summary: "Positioning for hyperscaler capex acceleration and Blackwell ramp through Q4 earnings.",
        content: "Hyperscaler capex guidance for 2026 signals continued GPU demand growth. MSFT, GOOGL, and AMZN all raised AI infrastructure spending targets by 30-50% YoY. NVDA remains the bottleneck supplier with Blackwell ramp providing a new product cycle tailwind. Data center revenue should exceed consensus by 15%+ through Q1 2026.",
        type: "OPTIONS_STRATEGY",
      }
    }
  },

  // Single-leg Options Trade
  {
    underlying: "AAPL",
    name: "AAPL Long Call",
    date: new Date("2026-01-10"),
    status: "OPEN",
    netPremium: 1200,
    legs: {
      create: [
        {
          type: "CALL",
          direction: "BUY",
          strike: 180,
          expiry: new Date("2026-02-21"),
          contracts: ["C180"],
          premium: 12,
        }
      ]
    },
    post: {
      create: {
        title: "AAPL Single Long Call for Earnings Play",
        slug: "aapl-single-long-call-earnings",
        date: new Date("2026-01-10"),
        summary: "Taking a directional long call position ahead of AAPL earnings.",
        content: "Expecting upside in AAPL stock post-earnings driven by strong iPhone and services revenue. Buying a single call to leverage upside while limiting capital at risk.",
        type: "OPTIONS_STRATEGY",
      }
    }
  },
]

const posts: Prisma.PostCreateInput[] = [
  {
    title: "Factor Decomposition of AAPL Returns: Post-Earnings Drift and Volatility Regime Shift",
    slug: "aapl-factor-decomposition-post-earnings-drift",
    date: new Date("2025-11-20"),
    summary: "Event study and multi-factor regression analysis of AAPL’s post-earnings drift under elevated volatility conditions.",
    content: `
    # Factor Decomposition of AAPL Returns: Post-Earnings Drift and Volatility Regime Shift

    **Date:** 2025-11-20  

    **Summary:** Event study and multi-factor regression analysis of AAPL’s post-earnings drift under elevated volatility conditions.

    ---

    This study analyzes Apple (AAPL) price behavior following its Q4 earnings announcement using a cross-sectional event study framework and a Fama-French 5-factor + Momentum regression model.

    ### Analysis Objectives
    1. Abnormal returns (CAR) over a [-1, +20] trading-day window  
    2. Changes in implied volatility term structure  
    3. Regime classification using realized volatility clustering (GARCH(1,1))  

    ### Key Findings
    - **Cumulative Abnormal Returns (CAR):**  
      AAPL exhibited statistically significant positive cumulative abnormal returns (CAR = +2.3%, t = 2.41) over the +2 to +10 day window, consistent with post-earnings announcement drift (PEAD).

    - **Implied Volatility:**  
      Implied volatility spiked to the 87th percentile of its 1-year distribution pre-event and mean-reverted within 4 sessions, producing a temporary variance risk premium expansion.

    - **Factor Regression:**  
      Excess return attribution primarily to the Momentum factor (β_MOM = 0.42) rather than market beta expansion.

    - **Volatility Regime:**  
      Volatility regime classification shows transition from high-vol (σ > 1.5× 60-day median) to mean-reverting state within 6 trading days.

    ### Implications
    1. PEAD remains present in mega-cap equities despite increased institutional efficiency.  
    2. Short-horizon variance risk premium spikes create systematic options-selling opportunities.  
    3. Factor tilts toward Momentum exposure post-event improve risk-adjusted returns versus delta-only positioning.

    > All results are based on daily data from 2015–2025 with Newey-West adjusted standard errors.

    `,
    type: "GENERIC"
  }
];

export async function main() {
  for (const u of tradeStrategies) {
    await prisma.optionsStrategy.create({ data: u });
  }
  for (const u of posts) {
    await prisma.post.create({ data: u });
  }
}

main();
