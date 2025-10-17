import { NextResponse } from "next/server"
import { getPopularLocationsForFilters } from "@/features/jobListings/services/locationService"

/**
 * GET /api/locations/popular
 * Retourne les locations les plus populaires pour les filtres
 */
export async function GET() {
  try {
    const locations = await getPopularLocationsForFilters(100) // Top 100 locations
    
    return NextResponse.json(locations)
  } catch (error) {
    console.error("Erreur lors de la récupération des locations:", error)
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération des locations" },
      { status: 500 }
    )
  }
}
