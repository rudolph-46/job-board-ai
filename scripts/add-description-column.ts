import { db } from "../src/drizzle/db"
import { sql } from "drizzle-orm"
import fs from 'fs'

async function addDescriptionColumn() {
  try {
    console.log("🔧 Ajout de la colonne descriptionHtml...")
    
    // Ajouter la colonne descriptionHtml si elle n'existe pas
    await db.execute(sql`
      ALTER TABLE job_listings 
      ADD COLUMN IF NOT EXISTS "descriptionHtml" text
    `)
    
    console.log("✅ Colonne descriptionHtml ajoutée avec succès")
    
    // Maintenant importer les descriptions HTML depuis le fichier JSON
    console.log("📥 Import des descriptions HTML...")
    
    const jobsData = JSON.parse(fs.readFileSync('./src/data/jobs.json', 'utf8'))
    console.log(`📊 ${jobsData.length} jobs trouvés dans le fichier JSON`)
    
    let updated = 0
    
    for (const job of jobsData) {
      if (job.description_html && job.id) {
        try {
          await db.execute(sql`
            UPDATE job_listings 
            SET "descriptionHtml" = ${job.description_html}
            WHERE id = ${job.id}
          `)
          updated++
        } catch (error) {
          console.warn(`⚠️ Erreur lors de la mise à jour du job ${job.id}:`, error)
        }
      }
    }
    
    console.log(`✅ ${updated} descriptions HTML mises à jour`)
    console.log("🎉 Migration terminée avec succès !")
    
  } catch (error) {
    console.error("❌ Erreur lors de la migration:", error)
    process.exit(1)
  }
}

addDescriptionColumn()
