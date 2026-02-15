import { Badge } from "@/components/ui/badge"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DisplayPost } from "@/lib/types"
import { BlogPostSchema, OptionsTradeDataSchema } from "@/schemas/blog"
import {createCaller} from "@/server/index"
import Link from "next/link"

export default async function BlogPage() {
  const trpc_caller = createCaller({});
  const all_posts_raw : BlogPostSchema[]  = await trpc_caller.blog.listAllPosts();
  console.log(all_posts_raw)
  const all_posts: DisplayPost[] = await Promise.all(all_posts_raw.map(async (post : BlogPostSchema) => {
    let trade_data : OptionsTradeDataSchema | null = null;

    if(post.type === 'TRADE') {
      trade_data = await trpc_caller.blog.getTradeDataById(post.id);
    }

    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      summary: post.summary,
      content: post.content,
      date: post.date,
      data: trade_data
    }
  }))

  all_posts.sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="grid gap-4">
      {all_posts.map((post) => (
        <Link key={post.id} href={`/blog/${post.slug}`}>
          <Card className="transition-colors hover:border-primary/40">
            <CardHeader>
              {post.data && <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge
                    variant={
                      post.data.status === "OPEN"
                        ? "default"
                        : post.data.status === "CLOSED"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {post.data.status}
                  </Badge>
                  <Badge variant="outline">
                    {post.data.direction} {post.data.type}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{post.date.toISOString()}</span>
                </div>
              }
              {!post.data && 
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="text-sm text-muted-foreground"> {post.date.toISOString()} </span>
                </div>
              }
              <CardTitle className="text-base">{post.title}</CardTitle>
              <CardDescription>{post.summary}</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      ))}
      </div>
  )
}
