import {
  integer,
  pgEnum,
  pgTable,
  text,
  varchar,
  boolean,
  timestamp,
  index,
  jsonb,
} from "drizzle-orm/pg-core"
import { createdAt, id, updatedAt } from "../schemaHelpers"
import { OrganizationTable } from "./organization"
import { relations } from "drizzle-orm"
import { JobListingApplicationTable } from "./jobListingApplication"
import { LocationTable } from "./location"

// Enums simplifiés basés sur les données AI
export const aiWorkArrangements = ["On-site", "Remote", "Hybrid"] as const
export type AiWorkArrangement = (typeof aiWorkArrangements)[number]
export const aiWorkArrangementEnum = pgEnum(
  "job_listings_ai_work_arrangement",
  aiWorkArrangements
)

export const aiEmploymentTypes = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"] as const
export type AiEmploymentType = (typeof aiEmploymentTypes)[number]
export const aiEmploymentTypeEnum = pgEnum(
  "job_listings_ai_employment_type",
  aiEmploymentTypes
)

export const jobListingStatuses = ["draft", "published", "delisted"] as const
export type JobListingStatus = (typeof jobListingStatuses)[number]
export const jobListingStatusEnum = pgEnum(
  "job_listings_status",
  jobListingStatuses
)

// Nouveaux enums pour la compatibilité avec les anciens composants
export const experienceLevels = ["Entry", "Mid", "Senior", "Executive"] as const
export type ExperienceLevel = (typeof experienceLevels)[number]

export const jobListingTypes = ["FULL_TIME", "PART_TIME", "CONTRACT", "CONTRACTOR", "INTERNSHIP", "INTERN"] as const
export type JobListingType = (typeof jobListingTypes)[number]

export const locationRequirements = ["On-site", "Remote", "Hybrid"] as const
export type LocationRequirement = (typeof locationRequirements)[number]

export const JobListingTable = pgTable(
  "job_listings",
  {
    id: varchar().primaryKey(), // Utiliser varchar au lieu de uuid pour les IDs externes
    // Informations essentielles de l'entreprise
    organizationId: varchar()
      .references(() => OrganizationTable.id, { onDelete: "cascade" })
      .notNull(),
    organizationName: varchar().notNull(), // Nom de l'entreprise
    organizationLogo: varchar(), // URL du logo
    organizationUrl: varchar(), // Site web de l'entreprise
    
    // Informations essentielles du poste
    title: varchar().notNull(),
    url: varchar().notNull(), // URL du job (pour postuler)
    descriptionHtml: text(), // Description complète au format HTML
    
    // Localisation (informations essentielles)
    city: varchar(),
    region: varchar(),
    country: varchar(),
    location: varchar(), // Location complète dérivée
    locationId: varchar().references(() => LocationTable.id), // Nouvelle relation vers locations
    
    // Informations IA (toutes les données AI importantes)
    aiSalaryMinValue: integer(),
    aiSalaryMaxValue: integer(),
    aiSalaryCurrency: varchar(),
    aiExperienceLevel: varchar(), // "2-5", "5-10", etc.
    aiWorkArrangement: aiWorkArrangementEnum(),
    aiWorkArrangementOfficeDays: integer(),
    aiRemoteLocation: varchar(),
    aiKeySkills: jsonb().$type<string[]>(), // Array de compétences
    aiCoreResponsibilities: text(),
    aiRequirementsSummary: text(),
    aiWorkingHours: integer(),
    aiEmploymentType: jsonb().$type<AiEmploymentType[]>(), // Array de types d'emploi
    aiJobLanguage: varchar(),
    aiVisaSponsorship: boolean().default(false),
    aiBenefits: text(),
    
    // Informations LinkedIn de l'organisation (données enrichies)
    linkedinOrgEmployees: integer(),
    linkedinOrgSize: varchar(),
    linkedinOrgSlogan: varchar(),
    linkedinOrgIndustry: varchar(),
    linkedinOrgFoundedDate: varchar(),
    linkedinOrgHeadquarters: varchar(),
    linkedinOrgSpecialties: jsonb().$type<string[]>(),
    linkedinOrgDescription: text(),
    
    // Meta informations
    status: jobListingStatusEnum().notNull().default("published"),
    isFeatured: boolean().notNull().default(false),
    datePosted: timestamp({ withTimezone: true }),
    createdAt,
    updatedAt,
  },
  table => [
    index().on(table.city),
    index().on(table.country),
    index().on(table.locationId),
    index().on(table.aiWorkArrangement),
    index().on(table.organizationName),
  ]
)

export const jobListingReferences = relations(
  JobListingTable,
  ({ one, many }) => ({
    organization: one(OrganizationTable, {
      fields: [JobListingTable.organizationId],
      references: [OrganizationTable.id],
    }),
    location: one(LocationTable, {
      fields: [JobListingTable.locationId],
      references: [LocationTable.id],
    }),
    applications: many(JobListingApplicationTable),
  })
)
