import { db } from "@/drizzle/db"
import { LocationTable, generateLocationId } from "@/drizzle/schema"
import { desc, eq, ilike, or, sql } from "drizzle-orm"

// Type temporaire pour LocationSelect jusqu'à ce que le schéma soit sync
export type LocationSelect = {
  id: string
  city: string
  country: string
  region?: string | null
  timezone?: string | null
  latitude?: string | null  // numeric devient string avec Drizzle
  longitude?: string | null // numeric devient string avec Drizzle
  jobCount?: number | null
  createdAt?: Date | null
  updatedAt?: Date | null
}

/**
 * Service pour gérer les locations
 */
export class LocationService {
  
  /**
   * Récupère toutes les locations triées par nombre de jobs
   */
  static async getAllLocations(): Promise<LocationSelect[]> {
    return await db
      .select()
      .from(LocationTable)
      .orderBy(desc(LocationTable.jobCount))
  }

  /**
   * Récupère les top N locations avec le plus de jobs
   */
  static async getTopLocationsByJobCount(limit = 10): Promise<LocationSelect[]> {
    return await db
      .select()
      .from(LocationTable)
      .orderBy(desc(LocationTable.jobCount))
      .limit(limit)
  }

  /**
   * Recherche des locations par nom de ville ou pays
   */
  static async searchLocations(query: string, limit = 20): Promise<LocationSelect[]> {
    const searchTerm = `%${query.trim()}%`
    
    return await db
      .select()
      .from(LocationTable)
      .where(
        or(
          ilike(LocationTable.city, searchTerm),
          ilike(LocationTable.country, searchTerm)
        )
      )
      .orderBy(desc(LocationTable.jobCount))
      .limit(limit)
  }

  /**
   * Crée ou récupère une location existante
   */
  static async findOrCreateLocation(city: string, country: string): Promise<LocationSelect> {
    if (!city?.trim() || !country?.trim()) {
      throw new Error("City and country are required")
    }

    const cleanCity = city.trim()
    const cleanCountry = country.trim()
    const locationId = generateLocationId(cleanCountry, cleanCity)

    // Chercher la location existante
    const existing = await db
      .select()
      .from(LocationTable)
      .where(eq(LocationTable.id, locationId))
      .limit(1)

    if (existing.length > 0) {
      return existing[0]
    }

    // Créer une nouvelle location
    const [newLocation] = await db
      .insert(LocationTable)
      .values({
        id: locationId,
        city: cleanCity,
        country: cleanCountry,
        jobCount: 0,
      })
      .returning()

    return newLocation
  }

  /**
   * Met à jour le nombre de jobs pour une location
   */
  static async updateJobCount(locationId: string): Promise<void> {
    const { JobListingTable } = await import("@/drizzle/schema")
    
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(JobListingTable)
      .where(eq(JobListingTable.locationId, locationId))

    await db
      .update(LocationTable)
      .set({ jobCount: count })
      .where(eq(LocationTable.id, locationId))
  }

  /**
   * Met à jour tous les job counts
   */
  static async updateAllJobCounts(): Promise<void> {
    const locations = await db.select().from(LocationTable)
    
    for (const location of locations) {
      await this.updateJobCount(location.id)
    }
  }

  /**
   * Récupère les statistiques des locations
   */
  static async getLocationStats() {
    const [totalLocations] = await db
      .select({ count: sql<number>`count(*)` })
      .from(LocationTable)

    const [totalJobs] = await db
      .select({ totalJobs: sql<number>`sum(${LocationTable.jobCount})` })
      .from(LocationTable)

    const topLocation = await db
      .select()
      .from(LocationTable)
      .orderBy(desc(LocationTable.jobCount))
      .limit(1)

    return {
      totalLocations: totalLocations.count,
      totalJobs: totalJobs.totalJobs || 0,
      topLocation: topLocation[0] || null,
    }
  }

  /**
   * Récupère une location par ID
   */
  static async getLocationById(locationId: string): Promise<LocationSelect | null> {
    const result = await db
      .select()
      .from(LocationTable)
      .where(eq(LocationTable.id, locationId))
      .limit(1)

    return result[0] || null
  }

  /**
   * Supprime une location (attention: cela va casser les relations)
   */
  static async deleteLocation(locationId: string): Promise<boolean> {
    const result = await db
      .delete(LocationTable)
      .where(eq(LocationTable.id, locationId))

    return (result.rowCount ?? 0) > 0
  }
}

/**
 * Fonction helper pour récupérer les locations populaires pour les filtres
 */
export async function getPopularLocationsForFilters(limit = 50): Promise<LocationSelect[]> {
  return LocationService.getTopLocationsByJobCount(limit)
}
