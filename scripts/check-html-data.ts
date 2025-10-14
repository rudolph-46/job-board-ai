import { db } from "@/drizzle/db"
import { JobListingTable } from "@/drizzle/schema/jobListing"

async function checkHtmlData() {
  console.log("🔍 Checking HTML data...")
  
  const job = await db.select({
    id: JobListingTable.id,
    title: JobListingTable.title,
    descriptionHtml: JobListingTable.descriptionHtml,
  }).from(JobListingTable)
  .limit(1)
  
  if (job[0]) {
    console.log(`\n📋 Job: ${job[0].title}`)
    console.log(`🆔 ID: ${job[0].id}`)
    console.log(`\n📝 HTML Description (first 500 chars):`)
    console.log(job[0].descriptionHtml?.substring(0, 500) + "...")
    console.log(`\n🔤 Type: ${typeof job[0].descriptionHtml}`)
  }
}

checkHtmlData().catch(console.error)
