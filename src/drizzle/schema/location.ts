import {
  integer,
  pgTable,
  varchar,
  index,
  timestamp,
  numeric,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { JobListingTable } from "./jobListing"
import { createdAt, updatedAt } from "../schemaHelpers"

export const LocationTable = pgTable(
  "locations",
  {
    id: varchar().primaryKey(), // Format: "loc_country_city", ex: "loc_france_paris"
    country: varchar().notNull(),
    city: varchar().notNull(),
    region: varchar(), // Ajout du champ region qui existe dans Supabase
    timezone: varchar(), // Ajout du champ timezone qui existe dans Supabase
    latitude: numeric(), // Ajout de latitude qui existe dans Supabase
    longitude: numeric(), // Ajout de longitude qui existe dans Supabase
    jobCount: integer("job_count").default(0),
    createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow(),
  },
  table => [
    index("idx_locations_country").on(table.country),
    index("idx_locations_city").on(table.city),
    // Index unique qui existe déjà dans Supabase
    index("locations_country_city_key").on(table.country, table.city),
  ]
)

export const locationRelations = relations(LocationTable, ({ many }) => ({
  jobListings: many(JobListingTable),
}))

// Type pour les données de location
export type LocationInsert = typeof LocationTable.$inferInsert
export type LocationSelect = typeof LocationTable.$inferSelect

// Fonction helper pour générer l'ID de location
export function generateLocationId(country: string, city: string): string {
  const cleanCountry = country
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")

  const cleanCity = city
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")

  return `loc_${cleanCountry}_${cleanCity}`
}

// Fonction pour formatter l'affichage d'une location
export function formatLocationDisplay(location: LocationSelect): string {
  return `${location.city}, ${location.country}`
}
