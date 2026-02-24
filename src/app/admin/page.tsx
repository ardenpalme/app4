import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PostCreator } from "../_components/post_creator";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { StrategyCreator } from "../_components/strategy_creator";

export default async function AdminPage() {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get("auth") as { name: string; value: string } | undefined;
  if (authCookie?.value !== "1") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
    <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-semibold text-foreground">
            ADP
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-12 flex flex-col gap-y-8">
        <Tabs defaultValue="posts">
          <TabsList variant="line" className="pb-3">
            <TabsTrigger value="posts" className="cursor-pointer">Blog</TabsTrigger>
            <TabsTrigger value="strat" className="cursor-pointer">Strategy</TabsTrigger>
          </TabsList>
          <TabsContent value="posts" >
            <PostCreator/>
          </TabsContent>
          <TabsContent value="strat" >
            <StrategyCreator/>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

