import { db } from "@/drizzle/db"
import { JobListingTable } from "@/drizzle/schema"
import { eq, and } from "drizzle-orm"
import { notFound } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeftIcon, MapPinIcon, ClockIcon, BuildingIcon, UsersIcon, ExternalLinkIcon } from "lucide-react"
import { JobListingBadges } from "@/features/jobListings/components/JobListingBadges"
import { HtmlRenderer } from "@/components/html/HtmlRenderer"
import { MarkdownRenderer } from "@/components/markdown/MarkdownRenderer"
import { differenceInDays } from "date-fns"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import { getJobListingIdTag } from "@/features/jobListings/db/cache/jobListings"
import { getOrganizationIdTag } from "@/features/organizations/db/cache/organizations"

type Props = {
  params: Promise<{ jobListingId: string }>
}

export default async function JobDetailPage({ params }: Props) {
  const { jobListingId } = await params

  // Récupérer les détails du job avec le nouveau schéma
  const jobListing = await db.query.JobListingTable.findFirst({
    where: and(
      eq(JobListingTable.id, jobListingId),
      eq(JobListingTable.status, "published")
    ),
    with: {
      organization: {
        columns: {
          id: true,
          name: true,
          imageUrl: true,
        },
      },
    },
  })

  if (!jobListing) {
    notFound()
  }

  // Note: Cache tags seraient ajoutés dans une fonction "use cache" si nécessaire

  const nameInitials = jobListing.organizationName
    .split(" ")
    .splice(0, 4)
    .map(word => word[0])
    .join("")

  const daysAgo = jobListing.datePosted ? differenceInDays(new Date(), jobListing.datePosted) : null

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Navigation de retour */}
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Job Listings
        </Link>
      </div>

      {/* En-tête du job */}
      <div className="bg-card rounded-lg border p-6 mb-6">
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="size-16">
            <AvatarImage
              src={jobListing.organizationLogo ?? undefined}
              alt={jobListing.organizationName}
            />
            <AvatarFallback className="uppercase bg-primary text-primary-foreground text-lg">
              {nameInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2 text-foreground">{jobListing.title}</h1>
            <div className="flex items-center gap-4 text-muted-foreground mb-4 flex-wrap">
              <div className="flex items-center gap-1">
                <BuildingIcon className="h-4 w-4" />
                <span className="text-lg">{jobListing.organizationName}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPinIcon className="h-4 w-4" />
                <span>
                  {[jobListing.city, jobListing.region].filter(Boolean).join(", ")}
                </span>
              </div>
              {jobListing.linkedinOrgSize && (
                <div className="flex items-center gap-1">
                  <UsersIcon className="h-4 w-4" />
                  <span>{jobListing.linkedinOrgSize} employees</span>
                </div>
              )}
              {daysAgo !== null && (
                <div className="flex items-center gap-1">
                  <ClockIcon className="h-4 w-4" />
                  <span>
                    {daysAgo === 0 ? "Today" : `${daysAgo} day${daysAgo === 1 ? "" : "s"} ago`}
                  </span>
                </div>
              )}
            </div>
            <div className="mb-4">
              <JobListingBadges jobListing={jobListing} />
            </div>
            {jobListing.aiSalaryMinValue && jobListing.aiSalaryMaxValue && (
              <div className="text-2xl font-semibold text-green-600">
                {jobListing.aiSalaryCurrency && `${jobListing.aiSalaryCurrency} `}
                {jobListing.aiSalaryMinValue.toLocaleString()} - {jobListing.aiSalaryMaxValue.toLocaleString()}
              </div>
            )}
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="border-t pt-4 flex gap-4">
          {jobListing.url ? (
            <a
              href={jobListing.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button size="lg" className="w-full">
                <ExternalLinkIcon className="h-4 w-4 mr-2" />
                Apply Now (External Link)
              </Button>
            </a>
          ) : (
            <p className="text-muted-foreground flex-1">Application link not available for this position</p>
          )}
          <a
            href={`/?title=${encodeURIComponent(jobListing.organizationName)}`}
          >
            <Button variant="outline" size="lg">
              <BuildingIcon className="h-4 w-4 mr-2" />
              See all jobs in this company
            </Button>
          </a>
        </div>
      </div>

      {/* Sections d'information AI */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        {/* AI Skills */}
        {jobListing.aiKeySkills && Array.isArray(jobListing.aiKeySkills) && jobListing.aiKeySkills.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>✨ Required Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {jobListing.aiKeySkills.map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Core Responsibilities */}
        {jobListing.aiCoreResponsibilities && (
          <Card>
            <CardHeader>
              <CardTitle>✨ Core Responsibilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <MarkdownRenderer source={jobListing.aiCoreResponsibilities} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Requirements Summary */}
        {jobListing.aiRequirementsSummary && (
          <Card>
            <CardHeader>
              <CardTitle>✨ Requirements Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <MarkdownRenderer source={jobListing.aiRequirementsSummary} />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Job Description complète */}
      {jobListing.descriptionHtml && (
        <div>
          <HtmlRenderer html={jobListing.descriptionHtml} />
        </div>
      )}




    </div>
  )
}
