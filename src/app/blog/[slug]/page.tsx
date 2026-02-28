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

import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link";
import { BackButton } from "@/app/_components/back_button";
import { StrategySchema } from "@/schemas/strategy";
import {z} from 'zod'

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {

  const { slug } = await params;
  const trpc_caller = createCaller({});
  const post : BlogPostSchema | null= await trpc_caller.blog.getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post not found | ADP",
      description: "The requested blog post does not exist.",
    };
  }

  const description = post.seoDescription

  const url = `https://ardenpalme.com/blog/${post.slug}`;

  return {
    title: `${post.title}`,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: post.title,
      description,
      url,
      siteName: "ADP",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
    },
  };
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const trpc_caller = createCaller({});
  const post : BlogPostSchema | null= await trpc_caller.blog.getPostBySlug(slug);

  let strategy : z.infer<typeof StrategySchema> | null = null;
  if(post && post.strategy != null && post.strategy.id != null) {
    strategy = await trpc_caller.strategy.getById(post.strategy?.id)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className={post?.type == "NOTEBOOK" ? "mx-auto flex items-center max-w-7xl justify-between px-6 py-4" :
          "mx-auto flex items-center max-w-3xl justify-between px-6 py-4"}>
          <Link href="/" className="font-semibold text-foreground">
            ADP
          </Link>
          <nav className="flex items-center gap-2">
            <BackButton />
          </nav>
        </div>
      </header>
      <main className={post?.type == "NOTEBOOK" ? "mx-auto max-w-7xl p-4 sm:px-6 sm:py-8" : "mx-auto max-w-3xl p-4 sm:px-6 sm:py-8"}>
        <div className="flex flex-col gap-y-2 sm:gap-y-5 ">
          <Card>
            {post?.type != 'NOTEBOOK' && (
            <CardHeader>
              <CardTitle className="">
                {post?.title}
              </CardTitle>
              <CardDescription className="flex items-center gap-x-2">
                {post?.summary} 
                {post && (<Link href={post.link} className="font-semibold text-sky-700"> [link] </Link>)}
              </CardDescription>
            </CardHeader>)}
            <CardContent>
              {post?.type != 'NOTEBOOK' && (
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
              </section>)}
              {/* TODO:  The jupyter notebook is stored locally */}
              {post?.type == 'NOTEBOOK' && (
                <iframe src={post?.link} className="w-full h-screen" sandbox="allow-scripts allow-same-origin allow-popups"/>
              )}
            </CardContent>
          </Card>
        </div>
    </main>
  </div>
  )

}
