import { Badge } from "@/components/ui/badge"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BlogPostSchema } from "@/schemas/blog"
import {createCaller} from "@/server/index"
import Link from "next/link"
import { format } from "@formkit/tempo"
import { Button } from "@/components/ui/button";
import { FaGithub } from "react-icons/fa";
import { DisplayPost } from "@/lib/types"

export default async function BlogPage() {
  const trpc_caller = createCaller({});
  let all_posts_raw : BlogPostSchema[] = await trpc_caller.blog.listAllPosts();
  //console.log(all_posts_raw)

  const all_posts = (await Promise.all(all_posts_raw.map(async (post: BlogPostSchema) => {
    if (post.strategy) {
      const strategy_raw = await trpc_caller.strategy.getById(post.strategy.id)
      if (strategy_raw) {
        return {
          id: post.id,
          title: post.title,
          slug: post.slug,
          summary: post.summary,
          content: post.content,
          type: post.type,
          date: post.date,
          seoTitle: post.seoTitle,
          seoDescription: post.seoDescription,
          strategy: {
            id: strategy_raw.id,
            name: strategy_raw.name,
            description: strategy_raw.description,
            category: strategy_raw.category,
            timeframe: strategy_raw.timeframe,
            riskProfile: strategy_raw.riskProfile,
            status: strategy_raw.status,
          }
        }
      }
    } else {
      return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        summary: post.summary,
        content: post.content,
        type: post.type,
        date: post.date,
        seoTitle: post.seoTitle,
        seoDescription: post.seoDescription,
      }
    }
  }))).filter(Boolean) as DisplayPost[];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-semibold text-foreground">
            ADP
          </Link>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/blog">Blog</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/portfolio">Portfolio</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a href="https://github.com/ardenpalme" target="_blank" rel="noopener noreferrer">
                <FaGithub className="size-5" />
              </a>
            </Button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="grid gap-4">
          {all_posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <Card className="transition-colors hover:border-primary/40">
                <CardHeader>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                     {post.strategy && 
                      <div className="flex items-center gap-4">
                        <Badge>{post.strategy.status}</Badge>
                        <Badge variant="secondary">{post.strategy.category}</Badge>
                        <Badge variant="secondary">{post.strategy.timeframe}</Badge>
                        <Badge variant="secondary">{post.strategy.riskProfile} RISK</Badge>
                      </div>
                     }
                      <span className="text-sm text-muted-foreground">{format(post.date, "short")}</span>
                    </div>
                  <CardTitle className="text-base">{post.title}</CardTitle>
                  <CardDescription>
                    {post.summary.slice(0, 50)}...
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
          </div>
        </main>
      </div>
  )
}
