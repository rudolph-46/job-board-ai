import { ElevenJobsNavbar } from "@/components/ElevenJobsNavbar"
import { Footer } from "@/components/Footer"
import { getCurrentOrganization } from "@/services/clerk/lib/getCurrentAuth"
import { redirect } from "next/navigation"
import { ReactNode, Suspense } from "react"

export default function EmployerLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <LayoutSuspense>{children}</LayoutSuspense>
    </Suspense>
  )
}

async function LayoutSuspense({ children }: { children: ReactNode }) {
  const { orgId } = await getCurrentOrganization()
  if (orgId == null) return redirect("/organizations/select")

  return (
    <div className="min-h-screen flex flex-col">
      <ElevenJobsNavbar />
      <main className="flex-1 container mx-auto max-w-6xl px-4 py-6">
        {children}
      </main>
      <Footer />
    </div>
  )
}
