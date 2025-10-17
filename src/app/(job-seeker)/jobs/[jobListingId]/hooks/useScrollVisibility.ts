'use client'

import { useState, useEffect } from 'react'

export function useScrollVisibility(threshold = 100) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > threshold) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)
    
    // Vérifier la position initiale
    toggleVisibility()

    return () => {
      window.removeEventListener('scroll', toggleVisibility)
    }
  }, [threshold])

  return isVisible
}
