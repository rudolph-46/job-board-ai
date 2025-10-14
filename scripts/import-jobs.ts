#!/usr/bin/env tsx

import { db } from "@/drizzle/db"
import { JobListingTable } from "@/drizzle/schema/jobListing"
import { OrganizationTable } from "@/drizzle/schema/organization"
import jobsData from "@/data/jobs.json"
import { eq } from "drizzle-orm"

interface JobData {
  id: string
  title: string
  organization: string
  organization_url: string | null
  organization_logo: string | null
  url: string
  description_html?: string | null
  cities_derived?: string[]
  regions_derived?: string[]
  countries_derived?: string[]
  locations_derived?: string[]
  ai_salary_minvalue?: number | null
  ai_salary_maxvalue?: number | null
  ai_salary_currency?: string | null
  ai_experience_level?: string | null
  ai_work_arrangement?: string | null
  ai_work_arrangement_office_days?: number | null
  ai_remote_location?: string | null
  ai_key_skills?: string[]
  ai_core_responsibilities?: string | null
  ai_requirements_summary?: string | null
  ai_working_hours?: number | null
  ai_employment_type?: string[]
  ai_job_language?: string | null
  ai_visa_sponsorship?: boolean | null
  ai_benefits?: string | null
  linkedin_org_employees?: number | null
  linkedin_org_size?: string | null
  linkedin_org_slogan?: string | null
  linkedin_org_industry?: string | null
  linkedin_org_foundeddate?: string | null
  linkedin_org_headquarters?: string | null
  linkedin_org_specialties?: string[]
  linkedin_org_description?: string | null
  date_posted?: string
}

async function importJobs() {
  console.log(`🚀 Import de ${jobsData.length} jobs...`)

  // Créer une organisation par défaut pour les jobs externes
  const [defaultOrg] = await db
    .insert(OrganizationTable)
    .values({
      id: "external-jobs-org",
      name: "Jobs Externes",
    })
    .onConflictDoNothing()
    .returning()

  let importedCount = 0
  let errorCount = 0

  for (const jobData of jobsData as JobData[]) {
    try {
      // Mapper le type de work arrangement
      const mapWorkArrangement = (arrangement: string | null | undefined): "On-site" | "Remote" | "Hybrid" | null => {
        if (!arrangement) return null
        switch (arrangement.toLowerCase()) {
          case "on-site":
          case "onsite":
            return "On-site"
          case "remote":
            return "Remote"
          case "hybrid":
            return "Hybrid"
          default:
            return "On-site"
        }
      }

      // Mapper les types d'emploi
      const mapEmploymentTypes = (types: string[] | undefined): ("FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP")[] => {
        if (!types || !Array.isArray(types)) return ["FULL_TIME"]
        return types.map(type => {
          switch (type.toUpperCase()) {
            case "FULL_TIME":
            case "FULLTIME":
              return "FULL_TIME" as const
            case "PART_TIME":
            case "PARTTIME":
              return "PART_TIME" as const
            case "CONTRACT":
              return "CONTRACT" as const
            case "INTERNSHIP":
              return "INTERNSHIP" as const
            default:
              return "FULL_TIME" as const
          }
        })
      }

      const jobListing = {
        id: jobData.id,
        organizationId: defaultOrg?.id || "external-jobs-org",
        organizationName: jobData.organization || "Entreprise inconnue",
        organizationLogo: jobData.organization_logo,
        organizationUrl: jobData.organization_url,
        title: jobData.title,
        url: jobData.url,
        descriptionHtml: jobData.description_html || null,
        
        // Localisation
        city: jobData.cities_derived?.[0] || null,
        region: jobData.regions_derived?.[0] || null,
        country: jobData.countries_derived?.[0] || null,
        location: jobData.locations_derived?.[0] || null,
        
        // Informations IA
        aiSalaryMinValue: jobData.ai_salary_minvalue || null,
        aiSalaryMaxValue: jobData.ai_salary_maxvalue || null,
        aiSalaryCurrency: jobData.ai_salary_currency || null,
        aiExperienceLevel: jobData.ai_experience_level || null,
        aiWorkArrangement: mapWorkArrangement(jobData.ai_work_arrangement),
        aiWorkArrangementOfficeDays: jobData.ai_work_arrangement_office_days || null,
        aiRemoteLocation: jobData.ai_remote_location || null,
        aiKeySkills: jobData.ai_key_skills || [],
        aiCoreResponsibilities: jobData.ai_core_responsibilities || null,
        aiRequirementsSummary: jobData.ai_requirements_summary || null,
        aiWorkingHours: jobData.ai_working_hours || null,
        aiEmploymentType: mapEmploymentTypes(jobData.ai_employment_type),
        aiJobLanguage: jobData.ai_job_language || null,
        aiVisaSponsorship: jobData.ai_visa_sponsorship || false,
        aiBenefits: jobData.ai_benefits || null,
        
        // Informations LinkedIn
        linkedinOrgEmployees: jobData.linkedin_org_employees || null,
        linkedinOrgSize: jobData.linkedin_org_size || null,
        linkedinOrgSlogan: jobData.linkedin_org_slogan || null,
        linkedinOrgIndustry: jobData.linkedin_org_industry || null,
        linkedinOrgFoundedDate: jobData.linkedin_org_foundeddate || null,
        linkedinOrgHeadquarters: jobData.linkedin_org_headquarters || null,
        linkedinOrgSpecialties: jobData.linkedin_org_specialties || [],
        linkedinOrgDescription: jobData.linkedin_org_description || null,
        
        // Meta
        datePosted: jobData.date_posted ? new Date(jobData.date_posted) : new Date(),
        status: "published" as const,
        isFeatured: false,
      }

      await db
        .insert(JobListingTable)
        .values(jobListing)
        .onConflictDoNothing()

      importedCount++
      
      if (importedCount % 50 === 0) {
        console.log(`✅ ${importedCount} jobs importés...`)
      }
    } catch (error) {
      errorCount++
      console.error(`❌ Erreur lors de l'import du job ${jobData.id}:`, error)
    }
  }

  console.log(`\n🎉 Import terminé !`)
  console.log(`✅ ${importedCount} jobs importés avec succès`)
  console.log(`❌ ${errorCount} erreurs`)
}

// Exécuter l'import
importJobs()
  .then(() => {
    console.log("✨ Import terminé avec succès !")
    process.exit(0)
  })
  .catch((error) => {
    console.error("💥 Erreur lors de l'import :", error)
    process.exit(1)
  })
