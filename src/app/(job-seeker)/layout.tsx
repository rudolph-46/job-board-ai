import { ElevenJobsNavbar } from "@/components/ElevenJobsNavbar"
import { ReactNode } from "react"

export default function JobSeekerLayout({
  children,
  sidebar,
}: {
  children: ReactNode
  sidebar: ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <ElevenJobsNavbar />
      <main>
        {children}
      </main>
    </div>
  )
}
