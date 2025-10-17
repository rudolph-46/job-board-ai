import { db } from "@/drizzle/db"
import { JobListingTable } from "@/drizzle/schema/jobListing"
import { OrganizationTable } from "@/drizzle/schema/organization"
import { UserTable } from "@/drizzle/schema/user"

async function seedSimple() {
  console.log("🌱 Starting simple database seeding...")

  try {
    // Créer quelques job listings simples
    const jobListings = await db
      .insert(JobListingTable)
      .values([
        {
          id: "job_1",
          organizationId: "org_tech_startup",
          organizationName: "TechStart Innovations",
          title: "Développeur Frontend React/Next.js",
          url: "https://example.com/job/1",
          descriptionHtml: `<h1>Développeur Frontend React/Next.js</h1>
<p>Nous recherchons un développeur frontend passionné pour rejoindre notre équipe dynamique.</p>
<h2>Compétences requises</h2>
<ul>
<li>React & Next.js</li>
<li>TypeScript</li>
<li>TailwindCSS</li>
</ul>`,
          city: "San Francisco",
          country: "USA",
          location: "San Francisco, CA, USA",
          aiSalaryMinValue: 50000,
          aiSalaryMaxValue: 70000,
          aiSalaryCurrency: "USD",
          aiExperienceLevel: "3-5 ans",
          aiWorkArrangement: "Hybrid",
          aiKeySkills: ["React", "Next.js", "TypeScript", "TailwindCSS"],
          aiEmploymentType: ["FULL_TIME"],
          status: "published",
          isFeatured: true,
        },
        {
          id: "job_2", 
          organizationId: "org_web_agency",
          organizationName: "WebCraft Agency",
          title: "Développeur Full-Stack Node.js/React",
          url: "https://example.com/job/2",
          descriptionHtml: `<h1>Développeur Full-Stack Node.js/React</h1>
<p>Rejoignez notre agence digitale pour créer des solutions web sur mesure.</p>
<h2>Stack technique</h2>
<ul>
<li>Frontend: React, Next.js</li>
<li>Backend: Node.js, Express</li>
<li>Database: PostgreSQL</li>
</ul>`,
          city: "New York",
          country: "USA", 
          location: "New York, NY, USA",
          aiSalaryMinValue: 40000,
          aiSalaryMaxValue: 50000,
          aiSalaryCurrency: "USD",
          aiExperienceLevel: "2-4 ans",
          aiWorkArrangement: "Hybrid",
          aiKeySkills: ["Node.js", "React", "PostgreSQL", "Express"],
          aiEmploymentType: ["FULL_TIME"],
          status: "published",
          isFeatured: false,
        },
        {
          id: "job_3",
          organizationId: "org_fintech",
          organizationName: "FinanceNext",
          title: "Senior Backend Developer - FinTech",
          url: "https://example.com/job/3",
          descriptionHtml: `<h1>Senior Backend Developer - FinTech</h1>
<p>Startup FinTech en forte croissance, nous révolutionnons les services financiers.</p>
<h2>Technologies</h2>
<ul>
<li>TypeScript, Go, Python</li>
<li>PostgreSQL, Redis</li>
<li>AWS, Kubernetes</li>
</ul>`,
          city: "Remote",
          country: "USA",
          location: "Remote, USA",
          aiSalaryMinValue: 80000,
          aiSalaryMaxValue: 100000,
          aiSalaryCurrency: "USD",
          aiExperienceLevel: "5+ ans", 
          aiWorkArrangement: "Remote",
          aiKeySkills: ["TypeScript", "Go", "Python", "PostgreSQL", "AWS"],
          aiEmploymentType: ["FULL_TIME"],
          status: "published",
          isFeatured: true,
        }
      ])
      .returning()

    console.log(`✅ Created ${jobListings.length} job listings`)
    console.log("🎉 Simple seeding completed successfully!")

  } catch (error) {
    console.error("❌ Error seeding database:", error)
    throw error
  }
}

seedSimple()
  .then(() => {
    console.log("✅ Seeding finished")
    process.exit(0)
  })
  .catch((error) => {
    console.error("❌ Seeding failed:", error)
    process.exit(1)
  })
