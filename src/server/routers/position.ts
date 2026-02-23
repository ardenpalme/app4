import { Prisma } from '../../../prisma/generated/prisma/client'
import prisma from "@/lib/prisma";
import {z} from 'zod'
import { publicProcedure, router } from "../trpc";
import { CreatePositionSchema, UpdatePositionSchema } from '@/schemas/position';

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
  create : publicProcedure
  .input(z.array(CreatePositionSchema))
  .mutation(async ({input}) => {
    input.map(async (ele) => {
      const data : Prisma.PositionCreateInput = {
        underlying: ele.underlying,
        status: ele.status,
        openedAt: ele.openedAt,
        capitalUsed: ele.capitalUsed,
        strategy: {
          connect : {id : ele.strategyId}
        }
      }
      return await prisma.position.create({
        data: data
      })
    }) 
  }),

  update : publicProcedure
  .input(z.array(UpdatePositionSchema))
  .mutation(async ({input}) => {
    input.map(async (ele) => {
      const data : Prisma.PositionUpdateInput = {
        underlying: ele.underlying,
        status: ele.status,
        openedAt: ele.openedAt,
        capitalUsed: ele.capitalUsed,
        strategy: {
          connect : {id : ele.strategyId}
        }
      }
      return await prisma.position.update({
        where: {id: ele.positionId},
        data: data
      })
    }) 
  })

});

