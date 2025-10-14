#!/usr/bin/env tsx

// Script simple pour ajouter les descriptions HTML aux jobs existants
import { readFileSync } from "fs"
import { join } from "path"
import { createRequire } from "module"
const require = createRequire(import.meta.url)
const pg = require("pg")

// Configuration directe de la DB (sans variables d'environnement)
const client = new pg.Client({
  host: "localhost",
  port: 5432,
  user: "postgres", // ajustez selon votre config
  password: "password", // ajustez selon votre config
  database: "job-board", // ajustez selon votre config
})

interface JobData {
  id: string
  description_html?: string | null
}

async function updateDescriptions() {
  console.log("🔄 Mise à jour des descriptions HTML...")
  
  try {
    await client.connect()
    
    // Lire le fichier jobs.json
    const jobsData: JobData[] = JSON.parse(
      readFileSync(join(process.cwd(), "src/data/jobs.json"), "utf-8")
    )
    
    console.log(`📄 Trouvé ${jobsData.length} jobs à traiter`)
    
    let updated = 0
    let errors = 0
    
    // Traiter seulement les 10 premiers pour les tests
    const jobsToProcess = jobsData.slice(0, 10)
    
    for (const job of jobsToProcess) {
      try {
        if (job.description_html) {
          await client.query(
            "UPDATE job_listings SET description_html = $1 WHERE id = $2",
            [job.description_html, job.id]
          )
          updated++
          console.log(`✅ Mise à jour job ${job.id}`)
        }
      } catch (error) {
        console.error(`❌ Erreur pour job ${job.id}:`, error)
        errors++
      }
    }
    
    console.log(`\n🎉 Mise à jour terminée !`)
    console.log(`✅ ${updated} jobs mis à jour`)
    console.log(`❌ ${errors} erreurs`)
    
  } catch (error) {
    console.error("💥 Erreur générale:", error)
  } finally {
    await client.end()
  }
}

updateDescriptions()
