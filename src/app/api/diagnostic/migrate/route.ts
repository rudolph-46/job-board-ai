import { db } from "@/drizzle/db"
import { JobListingTable, LocationTable, generateLocationId } from "@/drizzle/schema"
import { and, eq, sql } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    console.log("🚀 Début de la migration vers le système de locations...")

    // 1. Récupérer tous les couples city/country uniques des jobs sans locationId
    console.log("📊 Récupération des jobs sans locationId...")
    
    const jobsToUpdate = await db
      .select({
        id: JobListingTable.id,
        city: JobListingTable.city,
        country: JobListingTable.country,
      })
      .from(JobListingTable)
      .where(
        and(
          sql`${JobListingTable.locationId} IS NULL`,
          sql`${JobListingTable.city} IS NOT NULL`,
          sql`${JobListingTable.country} IS NOT NULL`,
          sql`trim(${JobListingTable.city}) != ''`,
          sql`trim(${JobListingTable.country}) != ''`
        )
      )

    console.log(`✅ ${jobsToUpdate.length} jobs trouvés à migrer`)

    // 2. Mettre à jour chaque job avec son locationId
    let updatedCount = 0
    
    for (const job of jobsToUpdate) {
      if (!job.city || !job.country) continue

      const locationId = generateLocationId(job.country, job.city)
      
      try {
        await db
          .update(JobListingTable)
          .set({ locationId })
          .where(eq(JobListingTable.id, job.id))

        updatedCount++
        
        if (updatedCount % 10 === 0) {
          console.log(`  ✓ Mis à jour ${updatedCount} jobs...`)
        }
      } catch (error) {
        console.error(`  ❌ Erreur mise à jour job ${job.id}:`, error)
      }
    }

    console.log(`✅ ${updatedCount} jobs mis à jour avec locationId`)

    // 3. Mettre à jour les job_count de chaque location
    console.log("🔢 Recalcul des job_count...")
    
    const locations = await db.select().from(LocationTable)
    
    for (const location of locations) {
      try {
        const [{ count }] = await db
          .select({ count: sql<number>`count(*)` })
          .from(JobListingTable)
          .where(eq(JobListingTable.locationId, location.id))

        await db
          .update(LocationTable)
          .set({ jobCount: count })
          .where(eq(LocationTable.id, location.id))

        console.log(`  ✓ ${location.city}, ${location.country}: ${count} jobs`)
      } catch (error) {
        console.error(`  ❌ Erreur job_count pour ${location.id}:`, error)
      }
    }

    // 4. Statistiques finales
    const [totalJobsWithLocationId] = await db
      .select({ count: sql<number>`count(*)` })
      .from(JobListingTable)
      .where(sql`${JobListingTable.locationId} IS NOT NULL`)

    const [totalLocations] = await db
      .select({ count: sql<number>`count(*)` })
      .from(LocationTable)

    console.log("🎉 Migration terminée avec succès !")

    return NextResponse.json({
      success: true,
      message: "Migration terminée avec succès",
      stats: {
        jobsUpdated: updatedCount,
        totalJobsWithLocationId: totalJobsWithLocationId.count,
        totalLocations: totalLocations.count
      }
    })

  } catch (error) {
    console.error("❌ Erreur durant la migration:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
