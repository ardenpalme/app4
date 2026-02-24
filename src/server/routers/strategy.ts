import { Prisma } from '../../../prisma/generated/prisma/client'
import prisma from "@/lib/prisma";
import {z} from 'zod'
import { publicProcedure, router } from "../trpc";
import { StrategySchema, UpsertStrategyInputSchema } from "@/schemas/strategy";

export const StrategyRouter = router({
  listAll : publicProcedure
  .output(z.array(StrategySchema))    
  .query(async () => {
    const data = await prisma.strategy.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        timeframe: true,
        riskProfile: true,
        status: true,
        createdAt: true,
        post: {
          select : { id: true }
        },
        positions: {
          select : {
            id: true,
            underlying: true,
            openedAt : true,
            capitalUsed : true,
            status: true,
            notes: true,
            trades: {
              select : {
                id: true,
                date: true,
                direction: true,
                orderType: true,
                status: true,
                quantity: true,
              }
            }
          }
        }
      }
    });
    if(data == undefined) return []
    const result = z.array(StrategySchema).safeParse(data)
    if (!result.success) {
      const pretty = z.prettifyError(result.error);
      console.error(pretty)
      return []
    }
    return result.data
  }),

  getById : publicProcedure
  .input(z.string().nullable())
  .output(StrategySchema.nullable())
  .query(async ({input}) => {
    if(input == null) return null
    const data = await prisma.strategy.findUnique({
      where: {id: input},
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        timeframe: true,
        riskProfile: true,
        status: true,
        createdAt: true,
        post: {
          select : { id: true }
        },
        positions: {
          select : {
            id: true,
            underlying: true,
            openedAt : true,
            capitalUsed : true,
            status: true,
            notes: true,
            trades: {
              select : {
                id: true,
                date: true,
                direction: true,
                orderType: true,
                status: true,
                quantity: true,
              }
            }
          }
        }
      }
    });
    if(data == null) return null
    const result = StrategySchema.safeParse(data)
    if (!result.success) {
      const pretty = z.prettifyError(result.error);
      console.error(pretty)
      return null
    }
    return result.data
  }),

  upsertStrategy: publicProcedure
  .input(UpsertStrategyInputSchema)
  .mutation(async ({ input }) => {
    const base_data = {
      id: input.id,
      name: input.name,
      description: input.description,
      category: input.category,
      timeframe: input.timeframe,
      riskProfile: input.riskProfile,
      status: input.status,
    };

    if(input.post.id != null) {
      return prisma.strategy.upsert({
        where: { id: input.id },
        update : {...base_data },
        create : {
          ...base_data,
          post : {
            connect : {id : input.post.id} 
          }
        }
      });
    }
  }),

  delete : publicProcedure
  .input(z.string())
  .mutation(async ({ input }) => {
    return await prisma.strategy.delete({
      where: {id: input}
    })
  }),

});

