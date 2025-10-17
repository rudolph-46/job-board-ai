"use client"

import { JobListingFilterForm } from "@/features/jobListings/components/JobListingFilterForm"
import { FloatingFilterButton } from "@/components/FloatingFilterButton"
import { MobileFilterPanel } from "@/components/MobileFilterPanel"
import { useIsMobile } from "@/hooks/useMediaQuery"
import { useActiveFiltersCount } from "@/hooks/useActiveFilters"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface MobileFiltersWrapperProps {
  totalJobs: number
  children: React.ReactNode
}

export function MobileFiltersWrapper({ totalJobs, children }: MobileFiltersWrapperProps) {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const isMobile = useIsMobile()
  const activeFiltersCount = useActiveFiltersCount()

  // Empêcher le scroll du body quand le panneau mobile est ouvert
  useEffect(() => {
    if (isMobileFilterOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileFilterOpen])

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar des filtres - Masquée sur mobile */}
        <div className={cn(
          "lg:col-span-1",
          isMobile ? "hidden" : "block"
        )}>
          <div className="sticky top-20">
            <div className="bg-card rounded-lg border p-6">
              <h2 className="font-semibold mb-4">Filtrer les offres</h2>
              <JobListingFilterForm />
            </div>
          </div>
        </div>
        
        {/* Contenu principal */}
        <div className={cn(
          isMobile ? "col-span-1" : "lg:col-span-3"
        )}>
          {children}
        </div>
      </div>

      {/* Floating Action Button - Visible uniquement sur mobile */}
      {isMobile && (
        <>
          <FloatingFilterButton
            onClick={() => setIsMobileFilterOpen(true)}
            activeFiltersCount={activeFiltersCount}
          />
          
          <MobileFilterPanel
            isOpen={isMobileFilterOpen}
            onOpenChange={setIsMobileFilterOpen}
            activeFiltersCount={activeFiltersCount}
            totalJobs={totalJobs}
          />
        </>
      )}
    </>
  )
}
