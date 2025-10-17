import { LocationService } from "@/features/jobListings/services/locationService"

/**
 * Script de test pour vérifier que le service LocationService fonctionne
 * avec les données existantes dans Supabase
 */
async function testLocationService() {
  console.log("🧪 Test du LocationService...")

  try {
    // Test 1: Récupérer toutes les locations
    console.log("\n1️⃣ Test: getAllLocations()")
    const allLocations = await LocationService.getAllLocations()
    console.log(`✅ ${allLocations.length} locations trouvées:`)
    allLocations.forEach(loc => {
      console.log(`  - ${loc.city}, ${loc.country} (${loc.jobCount || 0} jobs)`)
    })

    // Test 2: Récupérer les top locations
    console.log("\n2️⃣ Test: getTopLocationsByJobCount(5)")
    const topLocations = await LocationService.getTopLocationsByJobCount(5)
    console.log(`✅ Top ${topLocations.length} locations:`)
    topLocations.forEach((loc, index) => {
      console.log(`  ${index + 1}. ${loc.city}, ${loc.country}: ${loc.jobCount || 0} jobs`)
    })

    // Test 3: Recherche de locations
    console.log("\n3️⃣ Test: searchLocations('Paris')")
    const searchResults = await LocationService.searchLocations("Paris")
    console.log(`✅ ${searchResults.length} locations trouvées pour 'Paris':`)
    searchResults.forEach(loc => {
      console.log(`  - ${loc.city}, ${loc.country} (${loc.jobCount || 0} jobs)`)
    })

    // Test 4: Statistiques
    console.log("\n4️⃣ Test: getLocationStats()")
    const stats = await LocationService.getLocationStats()
    console.log(`✅ Statistiques:`)
    console.log(`  - Total locations: ${stats.totalLocations}`)
    console.log(`  - Total jobs: ${stats.totalJobs}`)
    console.log(`  - Top location: ${stats.topLocation?.city}, ${stats.topLocation?.country} (${stats.topLocation?.jobCount} jobs)`)

    console.log("\n🎉 Tous les tests passés avec succès !")

  } catch (error) {
    console.error("❌ Erreur durant les tests:", error)
    throw error
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  testLocationService()
    .then(() => {
      console.log("✅ Tests terminés")
      process.exit(0)
    })
    .catch((error) => {
      console.error("❌ Erreur:", error)
      process.exit(1)
    })
}

export { testLocationService }
