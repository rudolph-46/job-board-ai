import { db } from "../src/drizzle/db"
import { sql } from "drizzle-orm"

async function forceAddColumn() {
  try {
    console.log("🔧 Vérification de la structure de la table...")
    
    // Vérifier si la colonne existe
    const result = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'job_listings' 
      AND column_name = 'descriptionHtml'
    `)
    
    console.log("📊 Résultat de la vérification:", result.rows)
    
    if (result.rows.length === 0) {
      console.log("❌ La colonne descriptionHtml n'existe pas. Ajout...")
      
      // Forcer l'ajout de la colonne
      await db.execute(sql`
        ALTER TABLE job_listings 
        ADD COLUMN "descriptionHtml" text
      `)
      
      console.log("✅ Colonne descriptionHtml ajoutée avec succès !")
    } else {
      console.log("✅ La colonne descriptionHtml existe déjà")
    }
    
    // Vérifier toutes les colonnes de la table
    const allColumns = await db.execute(sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'job_listings'
      ORDER BY ordinal_position
    `)
    
    console.log("📋 Toutes les colonnes de job_listings:")
    allColumns.rows.forEach((row: any) => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`)
    })
    
    console.log("🎉 Vérification terminée !")
    
  } catch (error) {
    console.error("❌ Erreur:", error)
    process.exit(1)
  }
}

forceAddColumn()
