import { ElevenJobsNavbar } from "@/components/ElevenJobsNavbar"
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
    <>
      <ElevenJobsNavbar />
      <main className="container mx-auto max-w-6xl px-4 py-6">
        {children}
      </main>
    </>
  )
}
