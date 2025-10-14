import { db } from "@/drizzle/db"
import { JobListingTable } from "@/drizzle/schema/jobListing"

async function checkOrganizationUrls() {
  console.log("🔍 Checking organization URLs...")
  
  const jobs = await db.select({
    id: JobListingTable.id,
    title: JobListingTable.title,
    organizationName: JobListingTable.organizationName,
    organizationUrl: JobListingTable.organizationUrl,
  }).from(JobListingTable).limit(10)
  
  console.log(`\n📊 Found ${jobs.length} jobs:`)
  jobs.forEach(job => {
    console.log(`\n📋 ${job.title} - ${job.organizationName}`)
    console.log(`   URL: ${job.organizationUrl || '❌ NO URL'}`)
  })
  
  const jobsWithUrl = jobs.filter(job => job.organizationUrl)
  const jobsWithoutUrl = jobs.filter(job => !job.organizationUrl)
  
  console.log(`\n✅ Jobs with organization URL: ${jobsWithUrl.length}`)
  console.log(`❌ Jobs without organization URL: ${jobsWithoutUrl.length}`)
}

checkOrganizationUrls().catch(console.error)
