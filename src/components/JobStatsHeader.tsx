"use client"

import { useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"

interface JobStatsHeaderProps {
  totalJobs: number
  lastUpdated?: Date
}

export function JobStatsHeader({ totalJobs, lastUpdated }: JobStatsHeaderProps) {
  const { user, isLoaded } = useUser()
  const [greeting, setGreeting] = useState("")

  useEffect(() => {
    const hour = new Date().getHours()
    
    if (hour >= 5 && hour < 12) {
      setGreeting("Bonjour")
    } else if (hour >= 12 && hour < 18) {
      setGreeting("Salut")
    } else {
      setGreeting("Bonsoir")
    }
  }, [])

  const formatLastUpdated = (date: Date) => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return "il y a quelques minutes"
    } else if (diffInHours < 24) {
      return `il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      if (diffInDays === 1) {
        return "hier"
      } else if (diffInDays < 7) {
        return `il y a ${diffInDays} jours`
      } else {
        return date.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      }
    }
  }

  return (
    <div className="mb-8">
      <div className="mb-4">
        {!isLoaded ? (
          // Loading state
          <div className="space-y-2">
            <div className="h-8 bg-muted rounded-md animate-pulse w-3/4" />
            <div className="h-4 bg-muted rounded-md animate-pulse w-1/2" />
          </div>
        ) : user ? (
          // User is logged in
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              {greeting} {user.firstName || user.fullName?.split(' ')[0] || user.emailAddresses?.[0]?.emailAddress?.split('@')[0] || 'Utilisateur'} 👋
            </h1>
            <p className="text-muted-foreground">
              Découvrez de nouvelles opportunités qui vous correspondent
            </p>
          </div>
        ) : (
          // User is not logged in
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Trouvez votre emploi de rêve
            </h1>
            <p className="text-muted-foreground">
              Découvrez des milliers d'opportunités d'emploi avec notre recherche IA
            </p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-lg text-muted-foreground">
          <span className="font-semibold text-primary">
            {totalJobs.toLocaleString('fr-FR')} offres d'emploi
          </span>{" "}
          disponibles
        </p>
        
        {lastUpdated && (
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Dernière mise à jour : {formatLastUpdated(lastUpdated)}
          </p>
        )}
      </div>
    </div>
  )
}
