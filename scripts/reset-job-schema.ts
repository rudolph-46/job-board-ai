#!/usr/bin/env tsx

import { db } from "@/drizzle/db"

async function resetJobListingSchema() {
  console.log("🔧 Suppression des contraintes et des tables...")

  try {
    // Supprimer les contraintes de clé étrangère d'abord
    await db.execute(`DROP TABLE IF EXISTS "job_listing_applications" CASCADE;`)
    await db.execute(`DROP TABLE IF EXISTS "job_listings" CASCADE;`)
    
    console.log("✅ Tables supprimées avec succès")
    
    // Recreer la table job_listings avec varchar id
    await db.execute(`
      CREATE TABLE "job_listings" (
        "id" varchar PRIMARY KEY,
        "organizationId" varchar NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
        "organizationName" varchar NOT NULL,
        "organizationLogo" varchar,
        "organizationUrl" varchar,
        "title" varchar NOT NULL,
        "url" varchar NOT NULL,
        "city" varchar,
        "region" varchar,
        "country" varchar,
        "location" varchar,
        "aiSalaryMinValue" integer,
        "aiSalaryMaxValue" integer,
        "aiSalaryCurrency" varchar,
        "aiExperienceLevel" varchar,
        "aiWorkArrangement" job_listings_ai_work_arrangement,
        "aiWorkArrangementOfficeDays" integer,
        "aiRemoteLocation" varchar,
        "aiKeySkills" jsonb,
        "aiCoreResponsibilities" text,
        "aiRequirementsSummary" text,
        "aiWorkingHours" integer,
        "aiEmploymentType" jsonb,
        "aiJobLanguage" varchar,
        "aiVisaSponsorship" boolean DEFAULT false,
        "aiBenefits" text,
        "linkedinOrgEmployees" integer,
        "linkedinOrgSize" varchar,
        "linkedinOrgSlogan" varchar,
        "linkedinOrgIndustry" varchar,
        "linkedinOrgFoundedDate" varchar,
        "linkedinOrgHeadquarters" varchar,
        "linkedinOrgSpecialties" jsonb,
        "linkedinOrgDescription" text,
        "status" job_listings_status NOT NULL DEFAULT 'published',
        "isFeatured" boolean NOT NULL DEFAULT false,
        "datePosted" timestamp with time zone,
        "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
        "updatedAt" timestamp with time zone NOT NULL DEFAULT now()
      );
    `)
    
    // Créer les indexes
    await db.execute(`CREATE INDEX IF NOT EXISTS "job_listings_city_idx" ON "job_listings" ("city");`)
    await db.execute(`CREATE INDEX IF NOT EXISTS "job_listings_country_idx" ON "job_listings" ("country");`)
    await db.execute(`CREATE INDEX IF NOT EXISTS "job_listings_aiWorkArrangement_idx" ON "job_listings" ("aiWorkArrangement");`)
    await db.execute(`CREATE INDEX IF NOT EXISTS "job_listings_organizationName_idx" ON "job_listings" ("organizationName");`)
    
    // Recréer job_listing_applications avec varchar jobListingId
    await db.execute(`
      CREATE TABLE "job_listing_applications" (
        "jobListingId" varchar NOT NULL REFERENCES "job_listings"("id") ON DELETE CASCADE,
        "userId" varchar NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "coverLetter" text,
        "rating" integer,
        "stage" job_listing_applications_stage NOT NULL DEFAULT 'applied',
        "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
        "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
        PRIMARY KEY ("jobListingId", "userId")
      );
    `)
    
    console.log("✅ Tables recréées avec succès")
    
  } catch (error) {
    console.error("❌ Erreur:", error)
    throw error
  }
}

resetJobListingSchema()
  .then(() => {
    console.log("🎉 Migration terminée !")
    process.exit(0)
  })
  .catch((error) => {
    console.error("💥 Erreur lors de la migration:", error)
    process.exit(1)
  })
