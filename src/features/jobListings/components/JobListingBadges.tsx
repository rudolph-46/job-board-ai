import { Badge } from "@/components/ui/badge"
import { JobListingTable } from "@/drizzle/schema"
import { cn } from "@/lib/utils"
import { ComponentProps } from "react"
import {
  formatJobType,
  formatLocationRequirement,
} from "../lib/formatters"
import {
  BanknoteIcon,
  BuildingIcon,
  GraduationCapIcon,
  HourglassIcon,
} from "lucide-react"

export function JobListingBadges({
  jobListing: {
    aiSalaryMinValue,
    aiSalaryMaxValue,
    aiSalaryCurrency,
    aiEmploymentType,
    aiExperienceLevel,
    aiWorkArrangement,
    isFeatured,
  },
  className,
}: {
  jobListing: Pick<
    typeof JobListingTable.$inferSelect,
    | "aiSalaryMinValue"
    | "aiSalaryMaxValue"
    | "aiSalaryCurrency"
    | "aiEmploymentType"
    | "aiExperienceLevel"
    | "aiWorkArrangement"
    | "isFeatured"
  >
  className?: string
}) {
  const badgeProps = {
    variant: "outline",
    className,
  } satisfies ComponentProps<typeof Badge>

  return (
    <>
      {isFeatured && (
        <Badge
          {...badgeProps}
          className={cn(
            className,
            "border-featured bg-featured/50 text-featured-foreground"
          )}
        >
          Featured
        </Badge>
      )}
      {aiSalaryMinValue != null && aiSalaryMaxValue != null && (
        <Badge {...badgeProps}>
          <BanknoteIcon />
          {aiSalaryCurrency && `${aiSalaryCurrency} `}
          {aiSalaryMinValue.toLocaleString()} - {aiSalaryMaxValue.toLocaleString()}
        </Badge>
      )}

      {aiWorkArrangement && (
        <Badge {...badgeProps}>
          <BuildingIcon />
          {formatLocationRequirement(aiWorkArrangement)}
        </Badge>
      )}
      {aiEmploymentType && Array.isArray(aiEmploymentType) && aiEmploymentType.length > 0 && (
        <Badge {...badgeProps}>
          <HourglassIcon />
          {formatJobType(aiEmploymentType[0])}
        </Badge>
      )}
      {aiExperienceLevel && (
        <Badge {...badgeProps}>
          <GraduationCapIcon />
          {aiExperienceLevel}
        </Badge>
      )}
    </>
  )
}
