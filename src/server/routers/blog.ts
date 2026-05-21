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
          link: true,
        }
      })
      if(data == undefined) return []
      const result = z.array(BlogPostSchema).safeParse(data)
      if (!result.success) {
        const pretty = z.prettifyError(result.error);
        console.error("listAllPosts",pretty)
        return []
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
          date: true,
          seoTitle: true,
          seoDescription: true,
          link: true,
        }
      })
      if(!data) return null
      const result = BlogPostSchema.safeParse(data)
      if (!result.success) {
        const pretty = z.prettifyError(result.error);
        console.error("get by slug",pretty)
        return null
      }
      return result.data
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
          link: true,
        }
      });
      if(data == null) return null;
      const result = CreatePostInputSchema.safeParse(data)
      if (!result.success) {
        const pretty = z.prettifyError(result.error);
        console.error("getPostById",pretty)
        return null
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
        type: input.type,
        seoTitle: input.seoTitle,
        seoDescription: input.seoDescription,
        link: input.link,
      };

      return prisma.post.upsert({
        where: {id: input.id},
        update: {...data},
        create: {...data}
      })
    }),

  delete : publicProcedure
  .input(z.string())
  .mutation(async ({ input }) => {
    return await prisma.post.delete({
      where: {id: input}
    })
  }),

});

