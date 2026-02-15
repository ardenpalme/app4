import { BlogPostSchema, OptionsStrategySchema } from "@/schemas/blog"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { format } from "@formkit/tempo"
import Link from "next/link";
import { BackButton } from "@/app/_components/back_button";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value)
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const trpc_caller = createCaller({});
  const post : BlogPostSchema | null= await trpc_caller.blog.getBlogPostBySlug(slug);

  let trade_data : OptionsStrategySchema | null = null;
  if(post && post.type == 'OPTIONS_STRATEGY') {
    trade_data = await trpc_caller.blog.getOptionsStrategyById(post.id)
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
        <div className="mb-8">
          <div className="mb-4 flex flex-wrap items-center gap-2">
          {trade_data && (<>
            <Badge variant={trade_data?.status === "OPEN" ? "default" : trade_data?.status === "CLOSED" ? "secondary" : "outline"}>
              {trade_data?.status}
            </Badge>
            <Badge variant="outline">
              {trade_data?.name}
            </Badge>
            </>)}

            <span className="text-sm text-muted-foreground">{trade_data && format(trade_data.date,"short","en")}</span>

            {trade_data && trade_data.pnl !== null && (
              <span
                className={`text-sm ${
                  trade_data.pnl >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {trade_data.pnl >= 0 ? "+" : ""}
                {trade_data.pnl.toFixed(2)}%
              </span>
            )}

          </div>
          <h1 className="text-2xl font-bold text-foreground text-balance">{post?.title}</h1>
        </div>

      {trade_data && <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Trade Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Direction</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Strike</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead className="text-right">Contracts</TableHead>
                <TableHead className="text-right">Premium</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {trade_data.legs.map((leg) => (
              <TableRow key={leg.id} className="hover:bg-transparent"> 
                <TableCell className="py-1.5">
                  <Badge variant={leg.direction === "BUY" ? "default" : "secondary"} className="text-xs">
                    {leg.direction}
                  </Badge>
                </TableCell>
                <TableCell className="py-1.5 text-sm">{leg.type}</TableCell>
                <TableCell className="py-1.5 text-sm">{formatCurrency(leg.strike)}</TableCell>
                <TableCell className="py-1.5 text-sm text-muted-foreground">{format(leg.expiry,"short","en")}</TableCell>
                <TableCell className="py-1.5 text-sm text-right">{leg.contracts.length}</TableCell>
                <TableCell className="py-1.5 text-sm text-right">{formatCurrency(leg.premium)}</TableCell>
              </TableRow>
            ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>}

      <div className="space-y-8">
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

