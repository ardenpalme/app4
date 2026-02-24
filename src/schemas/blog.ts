import {z} from 'zod'

export const PostTypeEnum = z.enum(["STRATEGY", "GENERIC"])
export type PostTypeEnum = z.infer<typeof PostTypeEnum >

export const CreatePostInputSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  summary: z.string(),
  content: z.string(),
  type: PostTypeEnum,
  seoTitle: z.string(),
  seoDescription: z.string(),
  strategy: z.object({
    id: z.string().nullable(),
  }).nullable()
});
export type CreatePostInputSchema = z.infer<typeof CreatePostInputSchema>

export const BlogPostSchema = CreatePostInputSchema.extend({
  date: z.coerce.date(),  // set by postgres server on creation
})
export type BlogPostSchema = z.infer<typeof BlogPostSchema>
