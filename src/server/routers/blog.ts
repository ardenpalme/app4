import { Prisma } from '../../../prisma/generated/prisma/client'
import prisma from "@/lib/prisma";
import {z} from 'zod'
import { publicProcedure, router } from "../trpc";
import { BlogPostSchema, CreatePostInputSchema } from "@/schemas/blog";

export const BlogPostRouter = router({
  listAllPosts: publicProcedure
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

          seoTitle: true,
          seoDescription: true,

          strategy: {
            select: {
              id: true,
            },
          },
        }
      })
      const result = z.array(BlogPostSchema).safeParse(data)
      if (!result.success) {
        const pretty = z.prettifyError(result.error);
        console.error(pretty)
      }
      return result.data
    }),

  getPostBySlug : publicProcedure
    .input(z.string())
    .output(BlogPostSchema.nullable())
    .query(async ({input}) => {
      const data = await prisma.post.findUnique({
        where : {slug : input},
        select : {
          id: true,
          slug: true,
          title: true,
          summary: true,
          content: true,
          type: true,

          seoTitle: true,
          seoDescription: true,
          strategy: {
            select: {
              id: true,
            },
          },
        }
      })
      if(!data) return null
      return {
        ...data,
        strategy : {
          // required because prisma would return undef
          id: data.strategy?.id ?? null
        }
      }

    }),

  getPostById : publicProcedure
    .input(z.string().nullable())
    .output(CreatePostInputSchema.nullable())
    .query(async ({input}) => {
      if(input == null) return null;
      const data = await prisma.post.findUnique({
        where : {id : input},
        select : {
          id: true,
          slug: true,
          title: true,
          summary: true,
          content: true,
          type: true,

          seoTitle: true,
          seoDescription: true,
          strategy: {
            select: {
              id: true,
            },
          },
        }
      });
      //console.log(data)
      if(data == null) return null;
      const result = CreatePostInputSchema.safeParse(data)
      if (!result.success) {
        const pretty = z.prettifyError(result.error);
        console.error(pretty)
      }
      return result.data
    }),

  upsertPost : publicProcedure
    .input(CreatePostInputSchema)
    .mutation(async ({input}) => {
      const data: Prisma.PostCreateInput = {
        id: input.id,
        slug: input.slug,
        title: input.title,
        summary: input.summary,
        content: input.content,
        type: input.strategy?.id ? "STRATEGY" : "GENERIC",
        seoTitle: input.seoTitle,
        seoDescription: input.seoDescription,
      };

      // if we're associating a, strategy connect it
      if(input.strategy?.id) {
        data.strategy = {
          connect: {id: input.strategy?.id}
        }
      }

      return prisma.post.upsert({
        where: {id: input.id},
        update: {},
        create: data
      })
    }),

    /*
    swapStrategies: publicProcedure
  .input(z.object({
    postA_id: z.string(),
    stratB_id: z.string(),
  }))
  .mutation(async ({ input }) => {
    return await prisma.$transaction(async (tx) => {
      // 1. Check if Post A already has a strategy associated
      const postA_strat = await tx.strategy.findUnique({
        where: { PostId: input.postA_id },
        select: { id: true },
      });

      // 2. If Post A already has a strategy, dissociate it (disconnect the relation)
      if (postA_strat?.id) {
        await tx.strategy.update({
          where: { id: postA_strat.id },
          data: {
            post: {
              disconnect: true,
            },
          },
        });
      }

      // 3. Ensure that stratB_id exists and check if it is already assigned to another post
      const stratB = await tx.strategy.findUnique({
        where: { id: input.stratB_id },
        select: { id: true, PostId: true },
      });

      // If stratB is already associated with another Post, dissociate it
      if (stratB && stratB.PostId !== null) {
        // Dissociate stratB from its current post
        await tx.strategy.update({
          where: { id: stratB.id },
          data: {
            post: {
              disconnect: true,
            },
          },
        });
      }

      // 4. Now safely associate stratB_id with Post A
      await tx.strategy.update({
        where: { id: input.stratB_id },
        data: {
          post: {
            connect: { id: input.postA_id }, // Connect stratB to Post A
          },
        },
      });
    });
  }),
  */

});

