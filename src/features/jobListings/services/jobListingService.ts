"use cache"

import { db } from "@/drizzle/db"
import { and, desc, eq, ilike, or, SQL, sql } from "drizzle-orm"
import { JobListingTable, LocationRequirement } from "@/drizzle/schema"
import { unstable_cacheTag as cacheTag } from "next/cache"
import { z } from "zod"

// Tags pour le cache
function getJobListingGlobalTag() {
  return "job-listings"
}

function getOrganizationIdTag(id: string) {
  return `organization-${id}`
}

// Schéma pour les paramètres de recherche
const searchParamsSchema = z.object({
  title: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  locationId: z.string().optional(), // Nouveau champ pour locationId
  experience: z.string().optional(),
  type: z.string().optional(),
  locationRequirement: z.string().optional(),
  jobIds: z.array(z.string()).optional(),
})

export async function getJobListings(
  searchParams: z.infer<typeof searchParamsSchema>,
  jobListingId: string | undefined,
  page = 1,
  itemsPerPage = 10
) {
  console.log('🔍 getJobListings called with params:', searchParams)
  cacheTag(getJobListingGlobalTag())

  const whereConditions: (SQL | undefined)[] = []
  if (searchParams.title) {
    whereConditions.push(
      or(
        ilike(JobListingTable.title, `%${searchParams.title}%`),
        ilike(JobListingTable.organizationName, `%${searchParams.title}%`)
      )
    )
  }

  if (searchParams.locationRequirement) {
    whereConditions.push(
      eq(JobListingTable.aiWorkArrangement, searchParams.locationRequirement as LocationRequirement)
    )
  }

  if (searchParams.locationId && searchParams.locationId !== "any") {
    // Nouveau: filtre par locationId (prioritaire)
    whereConditions.push(eq(JobListingTable.locationId, searchParams.locationId))
  } else {
    // Anciens filtres city/state (fallback)
    if (searchParams.city) {
      whereConditions.push(ilike(JobListingTable.city, `%${searchParams.city}%`))
    }

    if (searchParams.state) {
      whereConditions.push(
        eq(JobListingTable.region, searchParams.state)
      )
    }
  }

  if (searchParams.experience) {
    whereConditions.push(
      eq(JobListingTable.aiExperienceLevel, searchParams.experience)
    )
  }

  if (searchParams.type) {
    // Note: aiEmploymentType is jsonb array, so we need to use jsonb contains
    whereConditions.push(
      sql`${JobListingTable.aiEmploymentType} ? ${searchParams.type}`
    )
  }

  if (searchParams.jobIds) {
    whereConditions.push(
      or(...searchParams.jobIds.map(jobId => eq(JobListingTable.id, jobId)))
    )
  }

  const whereClause = or(
    jobListingId
      ? and(
          eq(JobListingTable.status, "published"),
          eq(JobListingTable.id, jobListingId)
        )
      : undefined,
    and(eq(JobListingTable.status, "published"), ...whereConditions)
  )

  // Si on cherche un job spécifique, pas de pagination
  if (jobListingId) {
    const data = await db.query.JobListingTable.findMany({
      where: whereClause,
      with: {
        organization: {
          columns: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
      },
      orderBy: [desc(JobListingTable.isFeatured), desc(JobListingTable.datePosted)],
    })

    data.forEach(listing => {
      cacheTag(getOrganizationIdTag(listing.organization.id))
    })

    return { jobListings: data, totalCount: data.length }
  }

  // Pour la pagination, récupérer le count total et les données paginées
  const [jobListings, [{ count }]] = await Promise.all([
    db.query.JobListingTable.findMany({
      where: whereClause,
      with: {
        organization: {
          columns: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
      },
      orderBy: [desc(JobListingTable.isFeatured), desc(JobListingTable.datePosted)],
      limit: itemsPerPage,
      offset: (page - 1) * itemsPerPage,
    }),
    db
      .select({ count: sql<number>`count(*)` })
      .from(JobListingTable)
      .where(whereClause)
  ])

  jobListings.forEach(listing => {
    cacheTag(getOrganizationIdTag(listing.organization.id))
  })

  return { jobListings, totalCount: count }
}

export type SearchParamsType = z.infer<typeof searchParamsSchema>
