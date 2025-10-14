import { JobListingItems } from "./_shared/JobListingItems"
import { JobListingFilterForm } from "@/features/jobListings/components/JobListingFilterForm"

export default function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[]>>
}) {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Find Your Dream Job</h1>
        <p className="text-muted-foreground">
          Discover thousands of job opportunities with AI-powered search
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar des filtres */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <div className="bg-card rounded-lg border p-6">
              <h2 className="font-semibold mb-4">Filter Jobs</h2>
              <JobListingFilterForm />
            </div>
          </div>
        </div>
        
        {/* Contenu principal */}
        <div className="lg:col-span-3">
          <JobListingItems searchParams={searchParams} />
        </div>
      </div>
    </div>
  )
}
