import { JobListingItems } from "./_shared/JobListingItems"
import { JobStatsHeader } from "@/components/JobStatsHeader"
import { MobileFiltersWrapper } from "@/components/MobileFiltersWrapper"
import { getJobListingStats } from "@/features/jobListings/services/jobStatsService"

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[]>>
}) {
  // Récupérer les statistiques des jobs
  const { totalJobs, lastUpdated } = await getJobListingStats()

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* En-tête avec salutation et statistiques */}
      <JobStatsHeader 
        totalJobs={totalJobs} 
        lastUpdated={lastUpdated || undefined} 
      />
      
      {/* Wrapper qui gère les filtres desktop/mobile */}
      <MobileFiltersWrapper totalJobs={totalJobs}>
        <JobListingItems searchParams={searchParams} />
      </MobileFiltersWrapper>
    </div>
  )
}
