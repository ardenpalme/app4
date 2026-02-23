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
    }
    return result.data
  }),

  upsertStrategy: publicProcedure
  .input(UpsertStrategyInputSchema)
  .mutation(async ({ input }) => {
    const base_data = {
      name: input.name,
      description: input.description,
      category: input.category,
      timeframe: input.timeframe,
      riskProfile: input.riskProfile,
      status: input.status,
    };

    if (input.id) {
      const data = base_data as Prisma.StrategyUpdateInput
      //strategy # input.id must already have a post
      //connect the strategy to the passed post
      return prisma.strategy.update({
        where: { id: input.id },
        data
      });
    }
    
    //new strategies need a parent post
    const data = base_data as Prisma.StrategyCreateInput
    return prisma.strategy.create({
      data : {
        ...data,
        post : {
          connect : {id : input.post.id} 
        }
      }
    });
  }),

});

