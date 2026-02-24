import { Prisma } from '../../../prisma/generated/prisma/client'
import prisma from "@/lib/prisma";
import {z} from 'zod'
import { publicProcedure, router } from "../trpc";
import { CreatePositionSchema, PositionTradesSchema, UpdatePositionSchema } from '@/schemas/position';

export const position_sel = {
  underlying: true,
  openedAt : true,
  capitalUsed : true,
  status: true,
  closedAt : true,
  realizedPnL : true,
  unrealizedPnL : true,
  returnPct : true,
  notes: true,
}

export const PositionRouter = router({
  upsert : publicProcedure
  .input(z.array(UpdatePositionSchema))
  .mutation(async ({input}) => {
    input.map(async (ele) => {
      const data  = {
        id: ele.positionId,
        underlying: ele.underlying,
        status: ele.status,
        openedAt: ele.openedAt,
        capitalUsed: ele.capitalUsed,
      }

      return await prisma.position.upsert({
        where: {id: ele.positionId},
        update: { ...data },
        create: { ...data,
          strategy: {
            connect : {id : ele.strategyId}
          }
        } 
      })
    }) 
  }),

  delete : publicProcedure
  .input(z.string())
  .mutation(async ({input}) => {
    return await prisma.position.delete({
      where: {id: input},
    })
  }),

  listAll : publicProcedure
  .output(z.array(PositionTradesSchema))
  .query(async () => {
    const data = await prisma.position.findMany({
      select: {
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
    });
    if(data == undefined) return []
    const result = z.array(PositionTradesSchema).safeParse(data)
    if (!result.success) {
      const pretty = z.prettifyError(result.error);
      console.error("listAll",pretty)
      return []
    }
    return result.data
  }),

});

