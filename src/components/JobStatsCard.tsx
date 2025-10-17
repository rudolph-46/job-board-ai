"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Briefcase, Clock, MapPin } from "lucide-react"

interface JobStatsCardProps {
  totalJobs: number
  lastUpdated?: Date
  className?: string
}

export function JobStatsCard({ totalJobs, lastUpdated, className }: JobStatsCardProps) {
  const formatLastUpdated = (date: Date) => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return "À l'instant"
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours}h`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `Il y a ${diffInDays}j`
    }
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Briefcase className="h-4 w-4" />
          Statistiques
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Offres disponibles</span>
          <Badge variant="secondary" className="font-semibold">
            {totalJobs.toLocaleString('fr-FR')}
          </Badge>
        </div>
        
        {lastUpdated && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Mise à jour
            </span>
            <Badge variant="outline" className="text-xs">
              {formatLastUpdated(lastUpdated)}
            </Badge>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            Villes
          </span>
          <Badge variant="outline" className="text-xs">
            7 villes
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
