import Provider from "../_trpc/provider"

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-3xl px-6 py-12">
        {/* Layout UI */}
        {/* Place children where you want to render a page or nested layout */}
        <Provider>{children}</Provider>
      </main>
    </div>
  )
}
