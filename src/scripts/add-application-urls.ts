import { db } from "../drizzle/db"
import { JobListingTable } from "../drizzle/schema"
import { eq } from "drizzle-orm"

async function addApplicationUrls() {
  try {
    // Récupérer quelques jobs pour les mettre à jour
    const jobs = await db.select({ id: JobListingTable.id, title: JobListingTable.title }).from(JobListingTable).limit(5)
    
    console.log("Jobs trouvés:", jobs.length)

    // Ajouter des URLs de test
    const testUrls = [
      "https://jobs.google.com/apply/123",
      "https://www.linkedin.com/jobs/apply/456",
      "https://jobs.github.com/apply/789",
      "https://careers.microsoft.com/apply/101",
      "https://careers.apple.com/apply/202",
    ]

    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i]
      const testUrl = testUrls[i % testUrls.length]
      
      await db.update(JobListingTable)
        .set({ applicationUrl: testUrl })
        .where(eq(JobListingTable.id, job.id))
      
      console.log(`Mis à jour ${job.title} avec l'URL: ${testUrl}`)
    }

    console.log("✅ URLs de candidature ajoutées avec succès!")
  } catch (error) {
    console.error("❌ Erreur:", error)
  } finally {
    process.exit(0)
  }
}

addApplicationUrls()
