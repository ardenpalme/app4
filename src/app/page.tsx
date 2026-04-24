import Link from "next/link"
import { Mail, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FaGithub, FaLinkedin } from "react-icons/fa"
import ProjectList from "./_components/project_list"

export const dynamic = 'force-dynamic';  // Forces server-side rendering

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-semibold text-foreground">
            ADP
          </Link>
          <nav className="flex items-center gap-2">
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
      <main className="mx-auto max-w-3xl px-6 py-16">
        <section className="mb-16 flex items-center gap-6">
          <Avatar className="size-20">
            <AvatarImage src="/avatar.jpg" alt="Arden Diakhate-Palme" className="h-full w-full object-cover"/>
            <AvatarFallback className="bg-primary text-primary-foreground text-xl">AC</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Arden Diakhate-Palme</h1>
            <p className="text-primary">Software & ML Engineer</p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" asChild>
                <a href="mailto:ardenpalme@proton.com">
                  <Mail className="size-4" />
                  Contact
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="https://www.linkedin.com/in/arden-diakhate-palme" target="_blank" rel="noopener noreferrer">
                  <FaLinkedin className="size-5" />
                  LinkedIn
                </a>
              </Button>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-6 text-lg font-semibold text-foreground">Projects</h2>
          <ProjectList />
        </section>
      </main>
    </div>
  );
}
