import {
  ExperienceLevel,
  JobListingStatus,
  JobListingType,
  LocationRequirement,
  AiWorkArrangement,
} from "@/drizzle/schema"

// Fonction supprimée car WageInterval n'existe plus dans le nouveau schéma
// Les salaires sont maintenant gérés avec aiSalaryMinValue et aiSalaryMaxValue

export function formatLocationRequirement(
  locationRequirement: LocationRequirement
) {
  switch (locationRequirement) {
    case "Remote":
      return "Remote"
    case "On-site":
      return "On-site"
    case "Hybrid":
      return "Hybrid"
    default:
      throw new Error(
        `Unknown location requirement: ${locationRequirement satisfies never}`
      )
  }
}

export function formatExperienceLevel(experienceLevel: ExperienceLevel) {
  switch (experienceLevel) {
    case "Entry":
      return "Entry Level"
    case "Mid":
      return "Mid Level"
    case "Senior":
      return "Senior"
    case "Executive":
      return "Executive"
    default:
      throw new Error(
        `Unknown experience level: ${experienceLevel satisfies never}`
      )
  }
}

export function formatJobType(type: JobListingType) {
  switch (type) {
    case "FULL_TIME":
      return "Full Time"
    case "PART_TIME":
      return "Part Time"
    case "CONTRACT":
      return "Contract"
    case "INTERNSHIP":
      return "Internship"
    default:
      throw new Error(`Unknown job type: ${type satisfies never}`)
  }
}

export function formatJobListingStatus(status: JobListingStatus) {
  switch (status) {
    case "published":
      return "Active"
    case "draft":
      return "Draft"
    case "delisted":
      return "Delisted"
    default:
      throw new Error(`Unknown status: ${status satisfies never}`)
  }
}

// Nouvelle fonction pour formater les salaires AI
export function formatAiSalary(minValue?: number | null, maxValue?: number | null, currency?: string | null) {
  if (!minValue && !maxValue) return "Salary not specified"
  
  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    minimumFractionDigits: 0,
  })

  if (minValue && maxValue && minValue !== maxValue) {
    return `${currencyFormatter.format(minValue)} - ${currencyFormatter.format(maxValue)}`
  }
  
  const value = minValue || maxValue
  return value ? currencyFormatter.format(value) : "Salary not specified"
}

export function formatJobListingLocation({
  stateAbbreviation,
  city,
}: {
  stateAbbreviation: string | null
  city: string | null
}) {
  if (stateAbbreviation == null && city == null) return "None"

  const locationParts = []
  if (city != null) locationParts.push(city)
  if (stateAbbreviation != null) {
    locationParts.push(stateAbbreviation.toUpperCase())
  }

  return locationParts.join(", ")
}
