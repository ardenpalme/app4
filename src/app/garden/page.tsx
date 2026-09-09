// app/garden/page.tsx — server component
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import GardenClient from "./garden_client"

export const dynamic = "force-dynamic"

export default async function GardenPage() {
  const cookieStore = await cookies()
  if (cookieStore.get("garden_auth")?.value !== "1") {
    redirect("/login_garden")
  }
  return <GardenClient />
}
