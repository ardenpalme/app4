import { Prisma } from '../../../prisma/generated/prisma/client'
import prisma from "@/lib/prisma";
import {z} from 'zod'
import { publicProcedure, router } from "../trpc";
import { PosSchema } from '@/schemas/portfolio';

export const PortfolioRouter = router({
  listAll: publicProcedure
  .output(z.array(PosSchema))
  .query(async () => {
    const data = await prisma.portfolio.findMany({
      select: {
        id: true,
        date: true,
        ticker: true,
        quantity: true,
        type: true,
      }
    });
    if(data == undefined) return []
    const result = z.array(PosSchema).safeParse(data)
    if (!result.success) {
      const pretty = z.prettifyError(result.error);
      console.error("listAll (Portfolio)",pretty)
      return []
    }
    return result.data
  }),

  upsertMany: publicProcedure
  .input(z.array(PosSchema))
  .mutation(async ({input}) => {
    for(const idx in input){
      const pf = input[idx]
      const update_data : Prisma.PortfolioUpdateInput= {
        date: pf.date,
        ticker: pf.ticker,
        quantity: pf.quantity,
        type: pf.type,
      }
      await prisma.portfolio.upsert({
        where: {id: pf.id},
        update: update_data,
        create: pf,
      })
    }
  }),

});
