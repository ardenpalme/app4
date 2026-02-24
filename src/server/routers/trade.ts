import { Prisma } from '../../../prisma/generated/prisma/client'
import prisma from "@/lib/prisma";
import {z} from 'zod'
import { publicProcedure, router } from "../trpc";
import { CreateTradeSchema, TradeSchema, UpdateTradeSchema } from '@/schemas/trade';

export const trade_sel = {
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

export const TradeRouter = router({
  listAll : publicProcedure
  .output(z.array(TradeSchema))
  .query(async () => {
    return await prisma.trade.findMany({
      select: {
        id: true,
        positionId: true,
        date: true,
        direction: true,
        orderType: true,
        status: true,
        quantity: true,
        limitPrice: true,
        filledPrice: true,
        fees: true,
        slippage: true,
        notes: true,
      }
    })
  }),

  upsert : publicProcedure
  .input(z.array(UpdateTradeSchema))
  .mutation(async ({input}) => {
    input.map(async (ele) => {
      const data = {
        id: ele.tradeId,
        date : ele.date,
        direction: ele.direction,
        orderType : ele.orderType,
        status: ele.status,
        quantity: ele.quantity,
      }
      return await prisma.trade.upsert({
        where: {id: ele.tradeId},
        update: { ...data },
        create: { 
          ...data,
          position: {
            connect : {id : ele.positionId}
          }
        }
      })
    }) 
  }),

  delete : publicProcedure
  .input(z.string())
  .mutation(async ({input}) => {
    return await prisma.trade.delete({
      where: {id: input},
    })
  }),

});
