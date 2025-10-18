import { db } from "@/drizzle/db"
import { JobListingTable, LocationTable } from "@/drizzle/schema"
import { sql } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("🔍 Diagnostic du système de locations...")

    // 1. Vérifier combien de jobs ont un locationId
    const [jobsWithLocationId] = await db
      .select({ count: sql<number>`count(*)` })
      .from(JobListingTable)
      .where(sql`${JobListingTable.locationId} IS NOT NULL`)

    const [totalJobs] = await db
      .select({ count: sql<number>`count(*)` })
      .from(JobListingTable)

    // 2. Vérifier combien de locations existent
    const [totalLocations] = await db
      .select({ count: sql<number>`count(*)` })
      .from(LocationTable)

    // 3. Chercher des jobs à Paris
    const parisJobs = await db
      .select({
        id: JobListingTable.id,
        title: JobListingTable.title,
        city: JobListingTable.city,
        country: JobListingTable.country,
        locationId: JobListingTable.locationId,
      })
      .from(JobListingTable)
      .where(sql`LOWER(${JobListingTable.city}) LIKE '%paris%'`)
      .limit(5)

    // 4. Chercher la location Paris
    const parisLocation = await db
      .select()
      .from(LocationTable)
      .where(sql`LOWER(${LocationTable.city}) LIKE '%paris%'`)
      .limit(3)

    // 5. Vérifier si l'ID utilisé dans l'URL existe
    const urlLocationId = "loc_france_paris"
    const specificLocation = await db
      .select()
      .from(LocationTable)
      .where(sql`${LocationTable.id} = ${urlLocationId}`)

    const diagnosticResult = {
      jobsWithLocationId: jobsWithLocationId.count,
      totalJobs: totalJobs.count,
      totalLocations: totalLocations.count,
      parisJobs: parisJobs,
      parisLocations: parisLocation,
      specificLocationExists: specificLocation.length > 0,
      specificLocation: specificLocation[0] || null
    }

    return NextResponse.json(diagnosticResult)

  } catch (error) {
    console.error("❌ Erreur durant le diagnostic:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
