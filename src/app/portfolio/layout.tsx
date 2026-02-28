import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FaGithub } from "react-icons/fa";
import { ArrowLeft } from "lucide-react";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Investment Portfolio | Arden Diakhate-Palme",
  description:
    "Investment Strategies Performance Tracking",
  openGraph: {
    title: "Investment Portfolio | Arden Diakhate-Palme",
    description:
      "Investment Strategies Performance Tracking",
    url: "https://ardenpalme.com/portfolio",
    images: [
      { url: "/portfolio-og-image.png", width: 1200, height: 630, alt: "Investment Portfolio" },
    ],
    siteName: "ADP Portfolio",
    type: "website",
  }
};

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
    <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-semibold text-foreground">
            ADP
          </Link>
          <Button variant="outline" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="size-4" />
              Back
            </Link>
          </Button>
        </div>
      </header>
      <main className="flex flex-col mx-auto max-w-5xl p-4 sm:px-6 sm:py-12 gap-y-2 sm:gap-y-8 ">
        {/* Layout UI */}
        {/* Place children where you want to render a page or nested layout */}
        {children}
      </main>
    </div>
  )
}

