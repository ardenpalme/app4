import Link from "next/link"
import { Mail, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FaGithub, FaLinkedin } from "react-icons/fa"

const projects = [
  {
    title: "Multi-hop Wireless Sensor Network",
    description: "Developed a networking stack in C for an STM32 using LoRa transceivers. \
                  Implemented link-state routing and the spanning-tree protocol. \
                  Minimized node power-consumption with smart scheduling, low-power processor modes, and by modifying neighbor-discovery algorithms.",
    tags: ["C++", "STM", "Python"],
    link: "https://www.dropbox.com/scl/fi/z8h8soif596dri2a3fql6/ECE_Capstone_Final_Report.pdf?rlkey=dltg8h74d4z6lalb2zg7c8oc5&st=11bnlb3x&dl=0",
  },
  {
    title: "RISC-V CPU",
    description: "Designed and implemented a 5-stage pipelined processor in SystemVerilog to support the RISC-V RV32I ISA. \
                  Implemented a branch prediction module for conditionals and function calls/returns with a BTB. \
                  Measured processor performance with matrix multiplication benchmarks.",
    tags: ["SystemVeilog"],
    link: "https://github.com/ardenpalme/Academic-Projects/tree/master/RISCV_CPU",
  },
  {
    title: "Real-time Operating System",
    description: "Implemented on an ARM Cortex M processor in C using rate monotonic scheduling, immediate ceiling priority protocol, and memory protection.",
    tags: ["C", "Eagle CAD"],
    link: "https://github.com/ardenpalme/Academic-Projects/blob/master/ARM_RTOS/lab4.pdf",
  },
]

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
          <div className="grid gap-4">
            {projects.map((project) => (
              <Card key={project.title}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    {project.title}
                    <Button variant="ghost" size="sm" asChild>
                      <a href={project.link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="size-4" />
                      </a>
                    </Button>
                  </CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    {project.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
