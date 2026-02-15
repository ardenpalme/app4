import prisma from "@/lib/prisma";
import {z} from 'zod'
import { publicProcedure, router } from "../trpc";
import { BlogPostSchema, OptionsTradeDataSchema, OptionsTradePostSchema } from "@/schemas/blog";

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

  getTradeDataById : publicProcedure
    .input(z.number())
    .output(OptionsTradeDataSchema.nullable())
    .query(async ({input}) => {
      const data = await prisma.optionsTradePost.findUnique({
        where : {id : input},
        select : {
          id: true,
          underlying: true,
          type: true,
          direction: true,
          strike: true,
          expiry: true,
          contracts: true,
          premium: true,
          status: true,
          pnl: true,
        }
      })
      return data
    }),
});

