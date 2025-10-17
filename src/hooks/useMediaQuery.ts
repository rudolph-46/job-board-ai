"use client"

import { useEffect, useState } from "react"

/**
 * Hook pour détecter si on est sur mobile (< 768px)
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Check initial value
    checkIsMobile()

    // Listen for resize events
    window.addEventListener('resize', checkIsMobile)

    return () => {
      window.removeEventListener('resize', checkIsMobile)
    }
  }, [])

  return isMobile
}

/**
 * Hook générique pour media queries
 */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    
    const updateMatches = () => {
      setMatches(media.matches)
    }

    updateMatches()
    media.addEventListener('change', updateMatches)

    return () => {
      media.removeEventListener('change', updateMatches)
    }
  }, [query])

  return matches
}
