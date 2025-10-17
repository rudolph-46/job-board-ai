"use client"

import { Button } from "@/components/ui/button"
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetClose 
} from "@/components/ui/sheet"
import { X, RotateCcw } from "lucide-react"
import { JobListingFilterForm } from "@/features/jobListings/components/JobListingFilterForm"
import { useEffect } from "react"

interface MobileFilterPanelProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  activeFiltersCount: number
  totalJobs: number
}

export function MobileFilterPanel({ 
  isOpen, 
  onOpenChange, 
  activeFiltersCount,
  totalJobs 
}: MobileFilterPanelProps) {
  
  // Écouter l'événement de filtres appliqués pour fermer le panneau
  useEffect(() => {
    const handleFiltersApplied = () => {
      console.log('🎯 Event filtersApplied received, closing panel...')
      onOpenChange(false)
    }

    window.addEventListener('filtersApplied', handleFiltersApplied)
    console.log('👂 Event listener added for filtersApplied')
    
    return () => {
      window.removeEventListener('filtersApplied', handleFiltersApplied)
      console.log('🧹 Event listener removed for filtersApplied')
    }
  }, [onOpenChange])
  
  const handleResetFilters = () => {
    // Redirect to base URL to clear all filters
    window.location.href = '/'
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom" 
        className="h-[80vh] flex flex-col p-0"
        onInteractOutside={() => onOpenChange(false)}
      >
        {/* Header */}
        <SheetHeader className="p-6 pb-4 border-b bg-background">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SheetTitle className="text-lg font-semibold">
                Filtres
              </SheetTitle>
              {activeFiltersCount > 0 && (
                <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
                  {activeFiltersCount} actif{activeFiltersCount > 1 ? 's' : ''}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {/* Bouton Reset */}
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reset
                </Button>
              )}
              
              {/* Bouton Fermer */}
              <SheetClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Fermer</span>
                </Button>
              </SheetClose>
            </div>
          </div>
          
          <SheetDescription className="text-left text-sm text-muted-foreground">
            Personnalisez votre recherche d'emploi
          </SheetDescription>
        </SheetHeader>

        {/* Content - Formulaire de filtres */}
        <div className="flex-1 overflow-y-auto p-6">
          <JobListingFilterForm />
        </div>

        {/* Footer avec résultats */}
        <div className="border-t bg-background p-4">
          <div className="space-y-3">
            <div className="text-center text-sm text-muted-foreground">
              {totalJobs.toLocaleString('fr-FR')} offres trouvées
            </div>
            
            <Button 
              type="button"
              className="w-full h-12 text-base font-medium"
              onClick={() => {
                console.log('🔘 Submit button clicked!')
                // Déclencher la soumission du formulaire via un événement personnalisé
                window.dispatchEvent(new CustomEvent('triggerFormSubmit'))
              }}
            >
              Appliquer et voir les résultats
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
