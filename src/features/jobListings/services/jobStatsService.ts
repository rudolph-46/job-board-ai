import { db } from "@/drizzle/db"
import { JobListingTable } from "@/drizzle/schema"
import { desc, eq, sql } from "drizzle-orm"

/**
 * Service pour récupérer les statistiques des job listings
 */
export class JobStatsService {
  
  /**
   * Récupère le nombre total de jobs publiés
   */
  static async getTotalJobCount(): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(JobListingTable)
      .where(eq(JobListingTable.status, "published"))

    return result[0]?.count || 0
  }

  /**
   * Récupère la date de la dernière mise à jour des jobs
   */
  static async getLastUpdatedDate(): Promise<Date | null> {
    const result = await db
      .select({ lastUpdated: JobListingTable.updatedAt })
      .from(JobListingTable)
      .where(eq(JobListingTable.status, "published"))
      .orderBy(desc(JobListingTable.updatedAt))
      .limit(1)

    return result[0]?.lastUpdated || null
  }

  /**
   * Récupère les statistiques complètes des jobs
   */
  static async getJobStats() {
    const [totalCount, lastUpdated] = await Promise.all([
      this.getTotalJobCount(),
      this.getLastUpdatedDate(),
    ])

    return {
      totalJobs: totalCount,
      lastUpdated,
    }
  }

  /**
   * Récupère les statistiques par statut
   */
  static async getJobStatsByStatus() {
    const result = await db
      .select({
        status: JobListingTable.status,
        count: sql<number>`count(*)`
      })
      .from(JobListingTable)
      .groupBy(JobListingTable.status)

    const stats = {
      published: 0,
      draft: 0,
      delisted: 0,
      total: 0,
    }

    result.forEach(({ status, count }) => {
      stats[status as keyof typeof stats] = count
      stats.total += count
    })

    return stats
  }
}

/**
 * Fonction helper pour récupérer les stats des jobs (avec cache)
 */
export async function getJobListingStats() {
  "use cache"
  // On peut ajouter un tag de cache pour invalider quand nécessaire
  return await JobStatsService.getJobStats()
}
