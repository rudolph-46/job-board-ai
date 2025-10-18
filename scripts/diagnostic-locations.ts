import { db } from "@/drizzle/db"
import { JobListingTable, LocationTable } from "@/drizzle/schema"
import { sql } from "drizzle-orm"

async function diagnosticLocations() {
  console.log("🔍 Diagnostic du système de locations...")

  try {
    // 1. Vérifier combien de jobs ont un locationId
    const [jobsWithLocationId] = await db
      .select({ count: sql<number>`count(*)` })
      .from(JobListingTable)
      .where(sql`${JobListingTable.locationId} IS NOT NULL`)

    const [totalJobs] = await db
      .select({ count: sql<number>`count(*)` })
      .from(JobListingTable)

    console.log(`📊 Jobs avec locationId: ${jobsWithLocationId.count}/${totalJobs.count}`)

    // 2. Vérifier combien de locations existent
    const [totalLocations] = await db
      .select({ count: sql<number>`count(*)` })
      .from(LocationTable)

    console.log(`🏛️  Total locations: ${totalLocations.count}`)

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

    console.log(`\n🗼 Jobs à Paris (échantillon):`)
    parisJobs.forEach(job => {
      console.log(`  - ${job.title} | ${job.city}, ${job.country} | locationId: ${job.locationId}`)
    })

    // 4. Chercher la location Paris
    const parisLocation = await db
      .select()
      .from(LocationTable)
      .where(sql`LOWER(${LocationTable.city}) LIKE '%paris%'`)
      .limit(3)

    console.log(`\n🎯 Locations Paris:`)
    parisLocation.forEach(loc => {
      console.log(`  - ID: ${loc.id} | ${loc.city}, ${loc.country} | Jobs: ${loc.jobCount}`)
    })

    // 5. Vérifier si l'ID utilisé dans l'URL existe
    const urlLocationId = "loc_france_paris"
    const specificLocation = await db
      .select()
      .from(LocationTable)
      .where(sql`${LocationTable.id} = ${urlLocationId}`)

    console.log(`\n🔗 Location avec ID "${urlLocationId}":`)
    if (specificLocation.length > 0) {
      console.log(`  - Trouvée: ${specificLocation[0].city}, ${specificLocation[0].country} | Jobs: ${specificLocation[0].jobCount}`)
    } else {
      console.log(`  - Non trouvée !`)
    }

  } catch (error) {
    console.error("❌ Erreur durant le diagnostic:", error)
  }
}

// Exécuter le diagnostic
diagnosticLocations()
  .then(() => {
    console.log("✅ Diagnostic terminé")
    process.exit(0)
  })
  .catch((error) => {
    console.error("❌ Erreur:", error)
    process.exit(1)
  })
