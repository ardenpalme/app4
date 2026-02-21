import { Prisma } from '../../../prisma/generated/prisma/client'
import prisma from "@/lib/prisma";
import {z} from 'zod'
import { publicProcedure, router } from "../trpc";
import { CreateStrategyInputSchema, StrategySchema } from "@/schemas/strategy";
import { CreatePositionSchemaInput } from '@/schemas/position';

export const StrategyRouter = router({
  listAll : publicProcedure
  .output(z.array(StrategySchema))    
  .query(async () => {
    return await prisma.strategy.findMany({
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
        }
      },
    });
  }),

  getById : publicProcedure
  .input(z.number().nullable())
  .output(StrategySchema.nullable())
  .query(async ({input}) => {
    if(input === null) return null
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
        post: {
          select : { id: true }
        }
      }
    });
    return data;
  }),

  upsertStrategy: publicProcedure
  .input(CreateStrategyInputSchema)
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

  updatePositions: publicProcedure
  .input(z.object({
    id: z.number(),
    positions: z.array(CreatePositionSchemaInput),
  }))
  .mutation(async ({input}) => {
    const positions = input.positions as Prisma.PositionCreateInput[]
    return await prisma.strategy.update({
      where: {id: input.id},
      data: {
        positions: {
          // delete all existing positions for this strategy
          deleteMany: {},
          // replace positions with passed array
          create: positions.map((pos) => ({ 
            ...pos
          })),
        }
      }
    })
  }),


});

