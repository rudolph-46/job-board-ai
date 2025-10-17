import { Avatar, AvatarImage } from "@/components/ui/avatar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  experienceLevels,
  JobListingTable,
  jobListingTypes,
  locationRequirements,
  OrganizationTable,
} from "@/drizzle/schema"
import { convertSearchParamsToString } from "@/lib/convertSearchParamsToString"
import { cn } from "@/lib/utils"
import { AvatarFallback } from "@radix-ui/react-avatar"
import { getJobListings, SearchParamsType } from "@/features/jobListings/services/jobListingService"
import Link from "next/link"
import { Suspense } from "react"
import { differenceInDays } from "date-fns"
import { connection } from "next/server"
import { Badge } from "@/components/ui/badge"
import { JobListingBadges } from "@/features/jobListings/components/JobListingBadges"
import { z } from "zod"
import { Pagination } from "@/components/Pagination"

type Props = {
  searchParams: Promise<Record<string, string | string[]>>
  params?: Promise<{ jobListingId: string }>
}

const searchParamsSchema = z.object({
  title: z.string().optional().catch(undefined),
  city: z.string().optional().catch(undefined),
  locationId: z.string().optional().catch(undefined), // Nouveau: filtre par locationId
  state: z.string().optional().catch(undefined),
  experience: z.enum(experienceLevels).optional().catch(undefined),
  locationRequirement: z.enum(locationRequirements).optional().catch(undefined),
  type: z.enum(jobListingTypes).optional().catch(undefined),
  page: z.string().transform(v => Math.max(1, parseInt(v) || 1)).optional().catch(1),
  jobIds: z
    .union([z.string(), z.array(z.string())])
    .transform(v => {
      if (Array.isArray(v)) {
        return v.map(id => id.replace(/['"]/g, "").trim()).filter(Boolean)
      }
      if (typeof v === "string") {
        // Nettoyer la chaîne et diviser si nécessaire
        const cleaned = v.replace(/['"]/g, "").trim()
        return cleaned.includes(',') 
          ? cleaned.split(',').map(id => id.trim()).filter(Boolean)
          : cleaned ? [cleaned] : []
      }
      return []
    })
    .optional()
    .catch([]),
})

// Utiliser le type du service au lieu de redéfinir
type SearchParams = SearchParamsType

export function JobListingItems(props: Props) {
  return (
    <Suspense>
      <SuspendedComponent {...props} />
    </Suspense>
  )
}

async function SuspendedComponent({ searchParams, params }: Props) {
  const jobListingId = params ? (await params).jobListingId : undefined
  const rawSearchParams = await searchParams
  console.log('📋 Raw searchParams received:', rawSearchParams)
  
  const { success, data } = searchParamsSchema.safeParse(rawSearchParams)
  console.log('📋 Schema parse result:', { success, data })
  const search = success ? data : {}

  // Configuration de la pagination
  const itemsPerPage = 10
  const currentPage = search.page || 1
  
  console.log('📋 Final search object passed to getJobListings:', search)
  const result = await getJobListings(search, jobListingId, currentPage, itemsPerPage)
  const { jobListings = [], totalCount = 0 } = result || {}
  
  if (jobListings.length === 0) {
    return (
      <div className="text-muted-foreground p-4">No job listings found</div>
    )
  }

  const totalPages = Math.ceil(totalCount / itemsPerPage)
  
  // Préparer les paramètres de recherche pour la pagination (sans le page)
  const searchForUrl = Object.fromEntries(
    Object.entries(search).filter(([key, value]) => key !== 'page' && value != null)
      .map(([key, value]) => [key, Array.isArray(value) ? value : String(value)])
  )
  const baseUrl = `/?${convertSearchParamsToString(searchForUrl)}`

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {jobListings.map((jobListing: any) => (
          <Link
            className="block"
            key={jobListing.id}
            href={`/jobs/${jobListing.id}`}
          >
            <JobListingListItem
              jobListing={jobListing}
              organization={jobListing.organization}
            />
          </Link>
        ))}
      </div>
      
      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        baseUrl={baseUrl}
      />
    </div>
  )
}

function JobListingListItem({
  jobListing,
  organization,
}: {
    jobListing: Pick<
    typeof JobListingTable.$inferSelect,
    | "title"
    | "region"
    | "city"
    | "aiSalaryMinValue"
    | "aiSalaryMaxValue"
    | "aiSalaryCurrency"
    | "aiExperienceLevel"
    | "aiEmploymentType"
    | "datePosted"
    | "aiWorkArrangement"
    | "isFeatured"
    | "id"
    | "url"
    | "organizationName"
    | "aiKeySkills"
    | "descriptionHtml"
  >
  organization: Pick<typeof OrganizationTable.$inferSelect, "name" | "imageUrl">
}) {
  const nameInitials = organization?.name
    .split(" ")
    .splice(0, 4)
    .map(word => word[0])
    .join("")

  return (
    <Card
      className={cn(
        "@container",
        jobListing.isFeatured && "border-featured bg-featured/20"
      )}
    >
      <CardHeader>
        <div className="flex gap-4">
          <Avatar className="size-14 @max-sm:hidden">
            <AvatarImage
              src={organization.imageUrl ?? undefined}
              alt={organization.name}
            />
            <AvatarFallback className="uppercase bg-primary text-primary-foreground">
              {nameInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <CardTitle className="text-xl">{jobListing.title}</CardTitle>
            <CardDescription className="text-base">
              {jobListing.organizationName}
              {(jobListing.city || jobListing.region) && (
                <span> - {[jobListing.city, jobListing.region].filter(Boolean).join(", ")}</span>
              )}
            </CardDescription>
            {jobListing.datePosted != null && (
              <div className="text-sm font-medium text-primary @min-md:hidden">
                <Suspense fallback={jobListing.datePosted.toLocaleDateString()}>
                  <DaysSincePosting postedAt={jobListing.datePosted} />
                </Suspense>
              </div>
            )}
          </div>
          {jobListing.datePosted != null && (
            <div className="text-sm font-medium text-primary ml-auto @max-md:hidden">
              <Suspense fallback={jobListing.datePosted.toLocaleDateString()}>
                <DaysSincePosting postedAt={jobListing.datePosted} />
              </Suspense>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <JobListingBadges
          jobListing={jobListing}
          className={jobListing.isFeatured ? "border-primary/35" : undefined}
        />
        
        {/* Affichage des 3-5 premiers AI skills */}
        {jobListing.aiKeySkills && Array.isArray(jobListing.aiKeySkills) && jobListing.aiKeySkills.length > 0 && (
          <>
            {jobListing.aiKeySkills.slice(0, 5).map((skill, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {jobListing.aiKeySkills.length > 5 && (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                +{jobListing.aiKeySkills.length - 5} more
              </Badge>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

async function DaysSincePosting({ postedAt }: { postedAt: Date }) {
  await connection()
  const daysSincePosted = differenceInDays(postedAt, Date.now())

  if (daysSincePosted === 0) {
    return <Badge>New</Badge>
  }

  return new Intl.RelativeTimeFormat(undefined, {
    style: "narrow",
    numeric: "always",
  }).format(daysSincePosted, "days")
}

// Fonction getJobListings déplacée vers le service jobListingService.ts
