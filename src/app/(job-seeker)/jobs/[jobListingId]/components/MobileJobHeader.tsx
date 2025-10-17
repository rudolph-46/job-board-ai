'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { BuildingIcon, MapPinIcon, ClockIcon, UsersIcon } from "lucide-react"
import { JobListingBadges } from "@/features/jobListings/components/JobListingBadges"

interface MobileJobHeaderProps {
  jobListing: {
    title: string
    organizationName: string
    organizationLogo?: string | null
    city?: string | null
    region?: string | null
    linkedinOrgSize?: string | null
    aiSalaryMinValue?: number | null
    aiSalaryMaxValue?: number | null
    aiSalaryCurrency?: string | null
    aiEmploymentType?: string | null
    aiExperienceLevel?: string | null
    aiWorkArrangement?: string | null
    isFeatured?: boolean | null
  }
  nameInitials: string
  daysAgo: number | null
}

export function MobileJobHeader({ jobListing, nameInitials, daysAgo }: MobileJobHeaderProps) {
  return (
    <div className="bg-card rounded-lg border p-4 mb-4 md:hidden">
      {/* En-tête compact mobile */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar className="size-12 flex-shrink-0">
          <AvatarImage
            src={jobListing.organizationLogo ?? undefined}
            alt={jobListing.organizationName}
          />
          <AvatarFallback className="uppercase bg-primary text-primary-foreground text-sm">
            {nameInitials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-foreground leading-tight mb-1 line-clamp-2">
            {jobListing.title}
          </h1>
          <div className="flex items-center gap-1 mb-2">
            <BuildingIcon className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground truncate">
              {jobListing.organizationName}
            </span>
          </div>
        </div>
      </div>

      {/* Informations secondaires */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-1">
          <MapPinIcon className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {[jobListing.city, jobListing.region].filter(Boolean).join(", ")}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          {jobListing.linkedinOrgSize && (
            <div className="flex items-center gap-1">
              <UsersIcon className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{jobListing.linkedinOrgSize} employees</span>
            </div>
          )}
          
          {daysAgo !== null && (
            <div className="flex items-center gap-1">
              <ClockIcon className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {daysAgo === 0 ? "Today" : `${daysAgo} day${daysAgo === 1 ? "" : "s"} ago`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Badges */}
      <div className="mb-3">
        <JobListingBadges jobListing={jobListing} />
      </div>

      {/* Salaire */}
      {jobListing.aiSalaryMinValue && jobListing.aiSalaryMaxValue && (
        <div className="text-base font-semibold text-green-600">
          {jobListing.aiSalaryCurrency && `${jobListing.aiSalaryCurrency} `}
          {jobListing.aiSalaryMinValue.toLocaleString()} - {jobListing.aiSalaryMaxValue.toLocaleString()}
        </div>
      )}
    </div>
  )
}
