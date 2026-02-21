import { Prisma } from '../../../prisma/generated/prisma/client'
import prisma from "@/lib/prisma";
import {z} from 'zod'
import { publicProcedure, router } from "../trpc";
import { CreatePositionSchemaInput, PositionSchema } from '@/schemas/position';
import { CreateTradeSchema, TradeSchema } from '@/schemas/trade';

const trades_all_sel = {
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
}

const position_trades_all_sel  = {
  select: {
    id: true,
    underlying: true,
    openedAt : true,
    closedAt : true,
    capitalUsed : true,
    realizedPnL : true,
    unrealizedPnL : true,
    returnPct : true,
    thesis: true,
    notes: true,
    strategyId: true,

    trades: {
      ...trades_all_sel
    }
  }
}

export const PositionRouter = router({
  listAll : publicProcedure
  .output(z.array(PositionSchema))    
  .query(async () => {
    return await prisma.position.findMany({
      ...position_trades_all_sel
    });
  }),

  updateTrades: publicProcedure
  .input(z.object({
    id: z.number(),
    trades: z.array(CreateTradeSchema),
  }))
  .mutation(async ({input}) => {
    const trades = input.trades as Prisma.TradeCreateInput[]
    return await prisma.position.update({
      where: {id: input.id},
      data: {
        trades: {
          // delete all existing positions for this strategy
          deleteMany: {},
          // replace positions with passed array
          create: trades.map((pos) => ({ 
            ...pos
          })),
        }
      }
    })
  }),

  getById : publicProcedure
  .input(z.number().nullable())
  .output(PositionSchema.nullable())
  .query(async ({input}) => {
    if(input === null) return null
    return await prisma.trade.findMany({
      where: {id: input},
      ...position_trades_all_sel
    });
  }),

});

