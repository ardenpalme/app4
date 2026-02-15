import prisma from "@/lib/prisma";
import {z} from 'zod'
import { publicProcedure, router } from "../trpc";
import { BlogPostSchema, OptionsStrategySchema, StrategySummary, TradeStatusEnum } from "@/schemas/blog";

export const BlogPostRouter = router({
  listAllPosts : publicProcedure
    .output(z.array(BlogPostSchema))
    .query(async () => {
      const data = await prisma.post.findMany({
        select : {
          id: true,
          slug: true,
          title: true,
          date: true,
          summary:true,
          content: true,
          type: true,
        }
      })
      return data
    }),

  getBlogPostBySlug : publicProcedure
    .input(z.string())
    .output(BlogPostSchema.nullable())
    .query(async ({input}) => {
      const data = await prisma.post.findUnique({
        where : {slug : input},
        select : {
          id: true,
          slug: true,
          title: true,
          date: true,
          summary: true,
          content: true,
          type: true,
        }
      })
      return data
    }),

  getOptionsStrategySummaryById : publicProcedure
    .input(z.number())
    .output(StrategySummary.nullable())    
    .query(async ({input}) => {
      const data = await prisma.optionsStrategy.findUnique({
        where: {id : input},
        select: { 
          date: true,
          underlying: true,
          status: true,
        }
      })
      if(data != null) {
        return {
          date: data.date,
          status: data.status, 
          assets: [data.underlying]
        }
      } else {
        return null
      }
    }),

  getOptionsStrategyById : publicProcedure
      .input(z.number())
      .output(OptionsStrategySchema.nullable())    
      .query(async ({input}) => {
        const data = await prisma.optionsStrategy.findUnique({
          where: {id : input},
          select: {
            id: true,
            date: true,
            underlying: true,
            name: true,
            status: true,
            netPremium: true,
            pnl: true,
            legs: {
              select: {
                id: true,
                type: true,
                direction: true,
                strike: true,
                expiry: true,
                contracts: true,
                premium: true
              }
            },
            post: {
              select: {
                slug: true
              }
            }
          }
        })
        return data
      }),

  listAllOptionsStrategies : publicProcedure
    .output(z.array(OptionsStrategySchema))
    .query(async () => {
      const data = await prisma.optionsStrategy.findMany({
        select : {
          id: true,
          date: true,
          underlying: true,
          name: true,
          status: true,
          netPremium: true,
          pnl: true,
          legs: {
            select: {
              id: true,
              type: true,
              direction: true,
              strike: true,
              expiry: true,
              contracts: true,
              premium: true
            }
          },
          post: {
            select: {
              slug: true
            }
          }
        }
      })
      return data
    }),
});

