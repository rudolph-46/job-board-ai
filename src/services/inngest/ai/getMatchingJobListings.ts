import { env } from "@/data/env/server"
import { createAgent, openai } from "@inngest/agent-kit"
import { z } from "zod"
import { getLastOutputMessage } from "./getLastOutputMessage"

// Schéma simplifié pour éviter de dépasser la limite de tokens
const simplifiedListingSchema = z.object({
  id: z.string(),
  title: z.string(),
  organizationName: z.string(),
  city: z.string().nullable(),
  country: z.string().nullable(),
  aiSalaryMinValue: z.number().nullable(),
  aiSalaryMaxValue: z.number().nullable(),
  aiExperienceLevel: z.string().nullable(),
  aiWorkArrangement: z.string().nullable(),
  aiKeySkills: z.array(z.string()).nullable(),
  aiEmploymentType: z.array(z.string()).nullable(),
})

export async function getMatchingJobListings(
  prompt: string,
  jobListings: unknown[], // Type flexible pour accepter les données complètes de la DB
  { maxNumberOfJobs }: { maxNumberOfJobs?: number } = {}
) {
  const NO_JOBS = "NO_JOBS"

  // Vérifier que jobListings n'est pas undefined ou vide
  if (!jobListings || !Array.isArray(jobListings) || jobListings.length === 0) {
    return []
  }

  // Limiter à 100 jobs maximum pour éviter de dépasser la limite de tokens
  const limitedJobListings = jobListings.slice(0, 100)

  const agent = createAgent({
    name: "Job Matching Agent",
    description: "Agent for matching users with job listings",
    system: `You are an expert at matching people with jobs based on their specific experience, and requirements. The provided user prompt will be a description that can include information about themselves as well what they are looking for in a job. ${
      maxNumberOfJobs
        ? `You are to return up to ${maxNumberOfJobs} jobs.`
        : `Return all jobs that match their requirements.`
    } Return the jobs as a comma separated list of jobIds. If you cannot find any jobs that match the user prompt, return the text "${NO_JOBS}". Here is the JSON array of available job listings: ${JSON.stringify(
      limitedJobListings.map(listing => ({
        id: listing.id,
        title: listing.title,
        organizationName: listing.organizationName,
        city: listing.city,
        country: listing.country,
        aiSalaryMinValue: listing.aiSalaryMinValue,
        aiSalaryMaxValue: listing.aiSalaryMaxValue,
        aiExperienceLevel: listing.aiExperienceLevel,
        aiWorkArrangement: listing.aiWorkArrangement,
        aiKeySkills: listing.aiKeySkills || [],
        aiEmploymentType: listing.aiEmploymentType || [],
      }))
    )}`,
    model: openai({
      model: "gpt-4o-mini", // Plus de contexte et moins cher
      apiKey: env.OPENAI_API_KEY,
    }),
  })

  const result = await agent.run(prompt)
  const lastMessage = getLastOutputMessage(result)

  if (lastMessage == null || lastMessage === NO_JOBS) return []

  return lastMessage
    .split(",")
    .map(jobId => jobId.trim().replace(/['"]/g, "")) // Supprime les guillemets
    .filter(Boolean)
}
