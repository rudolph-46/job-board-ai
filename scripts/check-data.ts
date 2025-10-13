import { db } from "../src/drizzle/db"
import { JobListingTable } from "../src/drizzle/schema"

async function checkData() {
  console.log("🔍 Vérification des données dans la base...")
  
  try {
    const jobs = await db
      .select({
        id: JobListingTable.id,
        title: JobListingTable.title,
        status: JobListingTable.status,
        organizationId: JobListingTable.organizationId,
      })
      .from(JobListingTable)
      .limit(10)

    console.log(`✅ Trouvé ${jobs.length} offres d'emploi :`)
    
    jobs.forEach((job, index) => {
      console.log(`${index + 1}. ${job.title} (${job.status}) - ID: ${job.id}`)
    })
    
    const publishedJobs = await db
      .select()
      .from(JobListingTable)
      .where(eq(JobListingTable.status, "published"))
    
    console.log(`\n📊 ${publishedJobs.length} offres publiées au total`)
    
  } catch (error) {
    console.error("❌ Erreur lors de la vérification :", error)
  }
}

// Import manquant
import { eq } from "drizzle-orm"

checkData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Erreur :", error)
    process.exit(1)
  })
