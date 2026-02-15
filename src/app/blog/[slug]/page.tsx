import { DisplayPost } from "@/lib/types";
import { BlogPostSchema, OptionsTradeDataSchema, TradeDirectionEnum, TradeStatusEnum } from "@/schemas/blog"
import {createCaller} from "@/server/index"
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";

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
  console.log(slug)
  const trpc_caller = createCaller({});
  const blog_post : BlogPostSchema = await trpc_caller.blog.getBlogPostBySlug(slug);

  let trade_data = null;
  if(blog_post?.type == 'TRADE') {
    trade_data = await trpc_caller.blog.getTradeDataById(blog_post.id)
  }
  console.log(blog_post)

  // supposes that all trade_data is of type OptionsTradeDataSchema
  return (
    <div>
      <div className="mb-8">
        <div className="mb-4 flex flex-wrap items-center gap-2">
        {trade_data &&<Badge variant={trade_data.status === "OPEN" ? "default" : trade_data.status === "CLOSED" ? "secondary" : "outline"}>
            {trade_data.status}
          </Badge>}
          {trade_data && <Badge variant="outline">
            {trade_data.direction} {blog_post.type}
          </Badge>}
          <span className="text-sm text-muted-foreground">{blog_post.date.toString()}</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground text-balance">{blog_post.title}</h1>
      </div>

      {trade_data && <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Trade Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Underlying</TableHead>
                <TableHead>Direction</TableHead>
                <TableHead>Strike</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead className="text-right">Contracts</TableHead>
                <TableHead className="text-right">Premium</TableHead>
                {trade_data.pnl !== undefined && <TableHead className="text-right">P&L</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">{trade_data.underlying}</TableCell>
                <TableCell>
                  {trade_data.direction} {trade_data.type}
                </TableCell>
                <TableCell>{formatCurrency(trade_data.strike)}</TableCell>
                <TableCell>{trade_data.expiry.toString()}</TableCell>
                <TableCell className="text-right">{trade_data.contracts[0]}</TableCell>
                <TableCell className="text-right">{formatCurrency(trade_data.premium)}</TableCell>
                {trade_data.pnl !== undefined && (
                  <TableCell className={`text-right font-medium ${trade_data.pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {formatCurrency(trade_data.pnl)}
                  </TableCell>
                )}
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>}

      <div className="space-y-8">
        <section>
          <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
            {blog_post.content}
          </ReactMarkdown >
        </section>
      </div>
    </div>
  )

}

