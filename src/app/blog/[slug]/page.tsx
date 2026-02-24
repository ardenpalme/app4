import { BlogPostSchema, CreatePostInputSchema } from "@/schemas/blog"
import {createCaller} from "@/server/index"

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link";
import { BackButton } from "@/app/_components/back_button";
import { StrategySchema } from "@/schemas/strategy";
import {z} from 'zod'

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const trpc_caller = createCaller({});
  const post : BlogPostSchema | null= await trpc_caller.blog.getPostBySlug(slug);

  let strategy : z.infer<typeof StrategySchema> | null = null;
  if(post && post.type == 'STRATEGY' && post.strategy != null && post.strategy.id != null) {
    strategy = await trpc_caller.strategy.getById(post.strategy?.id)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-semibold text-foreground">
            ADP
          </Link>
          <nav className="flex items-center gap-2">
            <BackButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="flex flex-col gap-y-5 ">
          <Card>
            <CardHeader>
              <CardTitle className="">
                {strategy?.name}
              </CardTitle>
              <div className="flex items-center gap-4">
                <Badge>{strategy?.status}</Badge>
                <Badge variant="secondary">{strategy?.category}</Badge>
                <Badge variant="secondary">{strategy?.timeframe}</Badge>
                <Badge variant="secondary">{strategy?.riskProfile} RISK</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {strategy?.description}
            </CardContent>
          </Card>
          <h1 className="text-2xl font-bold text-foreground text-balance">{post?.title}</h1>
          <section>
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[
                rehypeRaw,
                rehypeSanitize,
                rehypeHighlight,
                rehypeSlug,
                rehypeKatex,
                rehypeAutolinkHeadings,
              ]}
            >
              {post?.content}
            </ReactMarkdown>
          </section>
        </div>
    </main>
  </div>
  )

}

