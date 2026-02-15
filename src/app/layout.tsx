import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FaGithub } from "react-icons/fa";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Arden Diakhate-Palme | Developer',
  description: 'Personal portfolio showcasing software engineering and machine learning projects. Building intelligent systems and beautiful interfaces.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} >
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
        {children}
      </body>
    </html>
  );
}
