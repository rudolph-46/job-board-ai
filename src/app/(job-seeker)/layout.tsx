import { ElevenJobsNavbar } from "@/components/ElevenJobsNavbar"
import { Footer } from "@/components/Footer"
import { ReactNode } from "react"

export default function JobSeekerLayout({
  children,
  sidebar,
}: {
  children: ReactNode
  sidebar: ReactNode
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ElevenJobsNavbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
