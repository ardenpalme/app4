import {z} from 'zod'

export const PostTypeEnum = z.enum(["STRATEGY", "GENERIC"])
export type PostTypeEnum = z.infer<typeof PostTypeEnum >

export const BlogPostSchema = z.object({
  id: z.int(),
  slug: z.string(),
  title: z.string(),
  date: z.date(),  // set by postgres server on creation
  summary: z.string(),
  content: z.string(),
  type: PostTypeEnum,

  seoTitle: z.string(),
  seoDescription: z.string(),
  strategy: z.object({
    id: z.number().optional()
  }).nullable()
})
export type BlogPostSchema = z.infer<typeof BlogPostSchema>

/* ADDITIONAL SCHEMAS (HELPERS) */
export const CreatePostInputSchema = z.object({
  id: z.number().nullable(),
  slug: z.string(),
  title: z.string(),
  summary: z.string(),
  content: z.string(),
  type: PostTypeEnum,

  seoTitle: z.string(),
  seoDescription: z.string(),
  strategy: z.object({
    id: z.number().nullable()
  })
});
export type CreatePostInputSchema = z.infer<typeof CreatePostInputSchema>
