"use client"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ExperienceLevel,
  experienceLevels,
  JobListingType,
  jobListingTypes,
  LocationRequirement,
  locationRequirements,
  LocationSelect,
} from "@/drizzle/schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  formatExperienceLevel,
  formatJobType,
  formatLocationRequirement,
} from "../lib/formatters"

import { Button } from "@/components/ui/button"
import { LoadingSwap } from "@/components/LoadingSwap"
import { LocationSelectComponent } from "./LocationSelect"
import { useEffect, useState } from "react"
import { Search, RotateCcw } from "lucide-react"

const ANY_VALUE = "any"

const jobListingFilterSchema = z.object({
  title: z.string().optional(),
  locationId: z.string().or(z.literal(ANY_VALUE)).optional(), // Nouveau champ
  experienceLevel: z.enum(experienceLevels).or(z.literal(ANY_VALUE)).optional(),
  type: z.enum(jobListingTypes).or(z.literal(ANY_VALUE)).optional(),
  locationRequirement: z
    .enum(locationRequirements)
    .or(z.literal(ANY_VALUE))
    .optional(),
})

interface JobListingFilterFormProps {
  showSubmitButtons?: boolean // Pour afficher ou non les boutons de soumission (desktop vs mobile)
}

export function JobListingFilterForm({ showSubmitButtons = false }: JobListingFilterFormProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [locations, setLocations] = useState<LocationSelect[]>([])

  // Charger les locations populaires
  useEffect(() => {
    async function loadLocations() {
      try {
        const response = await fetch('/api/locations/popular')
        if (response.ok) {
          const data = await response.json()
          setLocations(data)
        }
      } catch (error) {
        console.error('Erreur lors du chargement des locations:', error)
      }
    }
    
    loadLocations()
  }, [])

  // Écouter l'événement de soumission externe
  useEffect(() => {
    const handleExternalSubmit = () => {
      console.log('🎯 External submit event received, triggering form submission...')
      form.handleSubmit(onSubmit)()
    }

    window.addEventListener('triggerFormSubmit', handleExternalSubmit)
    return () => {
      window.removeEventListener('triggerFormSubmit', handleExternalSubmit)
    }
  }, [])

  const form = useForm({
    resolver: zodResolver(jobListingFilterSchema),
    defaultValues: {
      title: searchParams.get("title") ?? "",
      locationId: searchParams.get("locationId") ?? ANY_VALUE,
      locationRequirement:
        (searchParams.get("locationRequirement") as LocationRequirement) ??
        ANY_VALUE,
      experienceLevel:
        (searchParams.get("experience") as ExperienceLevel) ?? ANY_VALUE,
      type: (searchParams.get("type") as JobListingType) ?? ANY_VALUE,
    },
  })

  // Écouter l'événement de soumission externe
  useEffect(() => {
    const handleExternalSubmit = () => {
      console.log('🎯 External submit event received, triggering form submission...')
      form.handleSubmit(onSubmit)()
    }

    window.addEventListener('triggerFormSubmit', handleExternalSubmit)
    return () => {
      window.removeEventListener('triggerFormSubmit', handleExternalSubmit)
    }
  }, [form])

  function onSubmit(data: z.infer<typeof jobListingFilterSchema>) {
    console.log('🔍 Form onSubmit called with data:', data)
    
    const newParams = new URLSearchParams()

    if (data.locationId && data.locationId !== ANY_VALUE) {
      newParams.set("locationId", data.locationId)
      console.log('✅ Added locationId:', data.locationId)
    }
    if (data.title) {
      newParams.set("title", data.title)
      console.log('✅ Added title:', data.title)
    }
    if (data.experienceLevel && data.experienceLevel !== ANY_VALUE) {
      newParams.set("experience", data.experienceLevel)
      console.log('✅ Added experience:', data.experienceLevel)
    }
    if (data.type && data.type !== ANY_VALUE) {
      newParams.set("type", data.type)
      console.log('✅ Added type:', data.type)
    }
    if (data.locationRequirement && data.locationRequirement !== ANY_VALUE) {
      newParams.set("locationRequirement", data.locationRequirement)
      console.log('✅ Added locationRequirement:', data.locationRequirement)
    }

    const newUrl = `${pathname}?${newParams.toString()}`
    console.log('🚀 Navigating to:', newUrl)
    
    router.push(newUrl)
    
    // Émettre un événement pour fermer le panneau mobile avec un délai
    console.log('📢 Dispatching filtersApplied event...')
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('filtersApplied'))
      console.log('✅ filtersApplied event dispatched')
    }, 100)
  }

  const handleReset = () => {
    form.reset({
      title: "",
      locationId: ANY_VALUE,
      experienceLevel: ANY_VALUE,
      type: ANY_VALUE,
      locationRequirement: ANY_VALUE,
    })
    // Rediriger vers l'URL de base pour effacer tous les filtres
    router.push(pathname)
  }

  const hasActiveFilters = () => {
    const values = form.getValues()
    return !!(
      values.title ||
      (values.locationId && values.locationId !== ANY_VALUE) ||
      (values.experienceLevel && values.experienceLevel !== ANY_VALUE) ||
      (values.type && values.type !== ANY_VALUE) ||
      (values.locationRequirement && values.locationRequirement !== ANY_VALUE)
    )
  }

  return (
    <Form {...form}>
      <form id="job-filter-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          name="title"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title or Company</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Search by job title or company name..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="locationRequirement"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location Requirement</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={ANY_VALUE}>Any</SelectItem>
                  {locationRequirements.map(lr => (
                    <SelectItem key={lr} value={lr}>
                      {formatLocationRequirement(lr)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="locationId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ville</FormLabel>
              <FormControl>
                <LocationSelectComponent
                  value={field.value}
                  onValueChange={field.onChange}
                  locations={locations}
                  placeholder="Sélectionner une ville..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="type"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Type</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={ANY_VALUE}>Any</SelectItem>
                  {jobListingTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {formatJobType(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="experienceLevel"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Experience Level</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={ANY_VALUE}>Any</SelectItem>
                  {experienceLevels.map(experience => (
                    <SelectItem key={experience} value={experience}>
                      {formatExperienceLevel(experience)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Boutons de soumission (uniquement pour desktop) */}
        {showSubmitButtons && (
          <div className="flex flex-col gap-3 pt-4 border-t">
            <Button 
              type="submit" 
              className="w-full h-10 font-medium"
              disabled={form.formState.isSubmitting}
            >
              <Search className="w-4 h-4 mr-2" />
              {form.formState.isSubmitting ? "Recherche..." : "Appliquer les filtres"}
            </Button>
            
            {hasActiveFilters() && (
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="w-full h-10 text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Réinitialiser
              </Button>
            )}
          </div>
        )}
      </form>
    </Form>
  )
}
