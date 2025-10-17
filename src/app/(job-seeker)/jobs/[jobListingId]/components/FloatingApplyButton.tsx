'use client'

import { Button } from "@/components/ui/button"
import { ExternalLinkIcon } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

interface FloatingApplyButtonProps {
  applicationUrl?: string | null
  companyName: string
}

export function FloatingApplyButton({ 
  applicationUrl, 
  companyName 
}: FloatingApplyButtonProps) {
  const isMobile = useIsMobile()
  
  // Ne pas afficher le bouton flottant si on n'est pas sur mobile ou s'il n'y a pas d'URL
  if (!isMobile || !applicationUrl) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden animate-in slide-in-from-bottom-4 duration-300">
      <a
        href={applicationUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <Button 
          size="lg" 
          className="w-full shadow-lg hover:shadow-xl transition-all duration-200 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 text-lg hover:scale-[1.02] active:scale-[0.98]"
        >
          <ExternalLinkIcon className="h-5 w-5 mr-2" />
          Apply Now
        </Button>
      </a>
    </div>
  )
}
