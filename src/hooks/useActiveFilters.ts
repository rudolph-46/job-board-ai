"use client"

import { useSearchParams } from "next/navigation"
import { useMemo } from "react"

/**
 * Hook pour compter le nombre de filtres actifs
 */
export function useActiveFiltersCount() {
  const searchParams = useSearchParams()
  
  const activeFiltersCount = useMemo(() => {
    let count = 0
    
    // Compter chaque paramètre de filtre actif
    const filterParams = [
      'title',
      'locationId', 
      'experienceLevel',
      'type',
      'locationRequirement'
    ]
    
    filterParams.forEach(param => {
      const value = searchParams.get(param)
      if (value && value !== 'any' && value.trim() !== '') {
        count++
      }
    })
    
    return count
  }, [searchParams])
  
  return activeFiltersCount
}

/**
 * Hook pour obtenir un résumé des filtres actifs
 */
export function useActiveFilters() {
  const searchParams = useSearchParams()
  
  const activeFilters = useMemo(() => {
    const filters: Record<string, string> = {}
    
    const filterParams = {
      title: 'Recherche',
      locationId: 'Ville',
      experienceLevel: 'Expérience',
      type: 'Type de contrat',
      locationRequirement: 'Mode de travail'
    }
    
    Object.entries(filterParams).forEach(([param, label]) => {
      const value = searchParams.get(param)
      if (value && value !== 'any' && value.trim() !== '') {
        filters[label] = value
      }
    })
    
    return filters
  }, [searchParams])
  
  return activeFilters
}
