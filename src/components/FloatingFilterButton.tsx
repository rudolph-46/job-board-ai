"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SlidersHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

interface FloatingFilterButtonProps {
  onClick: () => void
  activeFiltersCount: number
  className?: string
}

export function FloatingFilterButton({ 
  onClick, 
  activeFiltersCount, 
  className 
}: FloatingFilterButtonProps) {
  return (
    <div className={cn("fixed bottom-6 right-6 z-40", className)}>
      <Button
        onClick={onClick}
        size="lg"
        className={cn(
          "h-14 w-14 rounded-full shadow-lg hover:shadow-xl",
          "bg-primary hover:bg-primary/90",
          "transition-all duration-300 ease-in-out",
          "hover:scale-105 active:scale-95",
          "relative",
          "focus:ring-2 focus:ring-primary focus:ring-offset-2"
        )}
        aria-label={`Ouvrir les filtres${activeFiltersCount > 0 ? ` (${activeFiltersCount} actifs)` : ''}`}
      >
        <SlidersHorizontal className="h-6 w-6 text-primary-foreground" />
        
        {/* Badge pour le nombre de filtres actifs */}
        {activeFiltersCount > 0 && (
          <Badge 
            variant="secondary" 
            className={cn(
              "absolute -top-2 -right-2",
              "h-6 w-6 rounded-full p-0",
              "flex items-center justify-center",
              "bg-destructive text-destructive-foreground",
              "text-xs font-bold",
              "animate-in zoom-in-50 duration-200",
              "border-2 border-background"
            )}
          >
            {activeFiltersCount > 9 ? '9+' : activeFiltersCount}
          </Badge>
        )}
      </Button>
    </div>
  )
}
