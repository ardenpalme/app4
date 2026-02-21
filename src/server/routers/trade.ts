import { Prisma } from '../../../prisma/generated/prisma/client'
import prisma from "@/lib/prisma";
import {z} from 'zod'
import { publicProcedure, router } from "../trpc";
import { CreateTradeSchema, TradeSchema } from '@/schemas/trade';

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
  .input(TradeSchema)
  .query(async ({input}) => {
    const {id: tradeId, positionId, ..._input}  = input
    if (tradeId) {
      const data = _input as Prisma.TradeUpdateInput
      //trade # tradeId must already be associated to a position
      return prisma.trade.update({
        where: { id: tradeId },
        data,
      });
    }

    //new trades need a parent position
    const data = _input as Prisma.TradeCreateInput
    return prisma.trade.create({
      data,
    });
    
  }),
});
