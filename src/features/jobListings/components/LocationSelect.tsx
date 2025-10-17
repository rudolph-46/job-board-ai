"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LocationSelect, formatLocationDisplay } from "@/drizzle/schema"
import { useState, useEffect } from "react"

interface LocationSelectProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  locations: LocationSelect[]
}

export function LocationSelectComponent({
  value,
  onValueChange,
  placeholder = "Sélectionner une ville...",
  locations,
}: LocationSelectProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredLocations, setFilteredLocations] = useState(locations)

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredLocations(locations)
      return
    }

    const filtered = locations.filter(location => 
      location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.country.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredLocations(filtered)
  }, [searchQuery, locations])

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <div className="p-2">
          <input
            type="text"
            placeholder="Rechercher une ville..."
            className="w-full px-2 py-1 text-sm border rounded"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        <SelectItem value="any">Toutes les villes</SelectItem>
        {filteredLocations.slice(0, 50).map(location => (
          <SelectItem key={location.id} value={location.id}>
            <div className="flex items-center justify-between w-full">
              <span>{formatLocationDisplay(location)}</span>
              <span className="text-xs text-muted-foreground ml-2">
                {location.jobCount} jobs
              </span>
            </div>
          </SelectItem>
        ))}
        {filteredLocations.length > 50 && (
          <div className="p-2 text-xs text-muted-foreground text-center">
            +{filteredLocations.length - 50} autres villes...
          </div>
        )}
      </SelectContent>
    </Select>
  )
}
