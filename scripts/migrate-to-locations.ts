import { db } from "@/drizzle/db"
import { JobListingTable, LocationTable, generateLocationId } from "@/drizzle/schema"
import { and, eq, sql } from "drizzle-orm"

/**
 * Script pour migrer vers le système de locations
 * 1. Crée les locations uniques à partir des jobs existants
 * 2. Met à jour les jobs avec leur locationId
 * 3. Met à jour les job_count de chaque location
 */
async function migrateToLocationSystem() {
  console.log("🚀 Début de la migration vers le système de locations...")

  try {
    // 1. Récupérer tous les couples city/country uniques des jobs
    console.log("📊 Récupération des locations uniques...")
    
    const uniqueLocations = await db
      .selectDistinct({
        city: JobListingTable.city,
        country: JobListingTable.country,
      })
      .from(JobListingTable)
      .where(
        and(
          sql`${JobListingTable.city} IS NOT NULL`,
          sql`${JobListingTable.country} IS NOT NULL`,
          sql`trim(${JobListingTable.city}) != ''`,
          sql`trim(${JobListingTable.country}) != ''`
        )
      )

    console.log(`✅ ${uniqueLocations.length} locations uniques trouvées`)

    // 2. Créer les entrées dans la table locations
    console.log("🏗️  Création des entrées locations...")
    
    let createdCount = 0
    let skippedCount = 0
    
    for (const location of uniqueLocations) {
      if (!location.city || !location.country) continue

      const locationId = generateLocationId(location.country, location.city)
      
      try {
        // Vérifier si la location existe déjà
        const existingLocation = await db
          .select()
          .from(LocationTable)
          .where(eq(LocationTable.id, locationId))
          .limit(1)

        if (existingLocation.length === 0) {
          // Créer la nouvelle location
          await db.insert(LocationTable).values({
            id: locationId,
            city: location.city.trim(),
            country: location.country.trim(),
            jobCount: 0,
          })
          createdCount++
          console.log(`  ✓ Créé: ${locationId} (${location.city}, ${location.country})`)
        } else {
          skippedCount++
        }
      } catch (error) {
        console.error(`  ❌ Erreur pour ${locationId}:`, error)
      }
    }

    console.log(`✅ ${createdCount} locations créées, ${skippedCount} ignorées (déjà existantes)`)

    // 3. Mettre à jour les jobs avec leur locationId
    console.log("🔗 Mise à jour des jobs avec locationId...")
    
    let updatedJobsCount = 0
    
    for (const location of uniqueLocations) {
      if (!location.city || !location.country) continue

      const locationId = generateLocationId(location.country, location.city)
      
      try {
        const result = await db
          .update(JobListingTable)
          .set({ locationId })
          .where(
            and(
              eq(JobListingTable.city, location.city),
              eq(JobListingTable.country, location.country),
              sql`${JobListingTable.locationId} IS NULL`
            )
          )

        console.log(`  ✓ Mis à jour jobs pour ${locationId}`)
        updatedJobsCount++
      } catch (error) {
        console.error(`  ❌ Erreur mise à jour jobs pour ${locationId}:`, error)
      }
    }

    console.log(`✅ ${updatedJobsCount} groupes de jobs mis à jour`)

    // 4. Mettre à jour les job_count de chaque location
    console.log("🔢 Calcul des job_count...")
    
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

    console.log("🎉 Migration terminée avec succès !")

    // 5. Afficher les statistiques finales
    const [totalJobs] = await db
      .select({ count: sql<number>`count(*)` })
      .from(JobListingTable)
      .where(sql`${JobListingTable.locationId} IS NOT NULL`)

    const [totalLocations] = await db
      .select({ count: sql<number>`count(*)` })
      .from(LocationTable)

    console.log("\n📈 Statistiques finales:")
    console.log(`  - ${totalLocations.count} locations créées`)
    console.log(`  - ${totalJobs.count} jobs avec locationId`)

    // Top 10 des villes
    console.log("\n🏆 Top 10 des villes avec le plus de jobs:")
    const topLocations = await db
      .select()
      .from(LocationTable)
      .orderBy(sql`${LocationTable.jobCount} DESC`)
      .limit(10)

    topLocations.forEach((loc, index) => {
      console.log(`  ${index + 1}. ${loc.city}, ${loc.country}: ${loc.jobCount} jobs`)
    })

  } catch (error) {
    console.error("❌ Erreur durant la migration:", error)
    throw error
  }
}

// Fonction pour réverser la migration (utile pour les tests)
export async function reverseMigration() {
  console.log("🔄 Réversion de la migration...")
  
  try {
    // Supprimer tous les locationId des jobs
    await db
      .update(JobListingTable)
      .set({ locationId: null })
      .where(sql`${JobListingTable.locationId} IS NOT NULL`)

    // Supprimer toutes les locations
    await db.delete(LocationTable)

    console.log("✅ Migration réversée avec succès")
  } catch (error) {
    console.error("❌ Erreur durant la réversion:", error)
    throw error
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  migrateToLocationSystem()
    .then(() => {
      console.log("✅ Script terminé")
      process.exit(0)
    })
    .catch((error) => {
      console.error("❌ Erreur:", error)
      process.exit(1)
    })
}

export { migrateToLocationSystem }
