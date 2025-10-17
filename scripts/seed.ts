import { db } from "../src/drizzle/db"
import {
  UserTable,
  OrganizationTable,
  JobListingTable,
  UserResumeTable,
  UserNotificationSettingsTable,
  JobListingApplicationTable,
} from "../src/drizzle/schema"

async function seed() {
  console.log("🌱 Starting database seeding...")

  try {
    // Créer des utilisateurs factices
    const users = await db
      .insert(UserTable)
      .values([
        {
          id: "user_2abc123def456ghi",
          name: "Alice Dupont",
          email: "alice.dupont@email.com",
          imageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
        },
        {
          id: "user_3def456ghi789jkl",
          name: "Bob Martin",
          email: "bob.martin@email.com",
          imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        },
        {
          id: "user_4ghi789jkl012mno",
          name: "Claire Bernard",
          email: "claire.bernard@email.com",
          imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        },
        {
          id: "user_5jkl012mno345pqr",
          name: "David Rousseau",
          email: "david.rousseau@email.com",
          imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        },
      ])
      .returning()

    console.log(`✅ Created ${users.length} users`)

    // Créer des organisations factices
    const organizations = await db
      .insert(OrganizationTable)
      .values([
        {
          id: "org_tech_startup",
          name: "TechFlow Solutions",
          imageUrl: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150&h=150&fit=crop",
        },
        {
          id: "org_web_agency",
          name: "Digital Craft Agency",
          imageUrl: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=150&h=150&fit=crop",
        },
        {
          id: "org_fintech",
          name: "FinanceNext",
          imageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=150&h=150&fit=crop",
        },
        {
          id: "org_ecommerce",
          name: "ShopTech Inc",
          imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=150&h=150&fit=crop",
        },
        {
          id: "org_healthcare",
          name: "MedTech Innovations",
          imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=150&h=150&fit=crop",
        },
      ])
      .returning()

    console.log(`✅ Created ${organizations.length} organizations`)

    // Créer des offres d'emploi factices
    const jobListings = await db
      .insert(JobListingTable)
      .values([
        // Job 1
        {
          id: "job_1",
          organizationId: organizations[0].id,
          organizationName: organizations[0].name,
          title: "Développeur Frontend React/Next.js",
          url: "https://example.com/job/1",
          descriptionHtml: `<h1>Développeur Frontend React/Next.js</h1>
<h2>À propos du poste</h2>
<p>Nous recherchons un développeur frontend passionné pour rejoindre notre équipe dynamique. Vous travaillerez sur des projets innovants utilisant les dernières technologies React et Next.js.</p>
<h2>Responsabilités</h2>
<ul>
<li>Développer des interfaces utilisateur modernes et réactives</li>
<li>Collaborer avec l'équipe UX/UI pour implémenter des designs pixel-perfect</li>
<li>Optimiser les performances des applications web</li>
<li>Maintenir et améliorer le code existant</li>
<li>Participer aux code reviews et mentoring</li>
</ul>
<h2>Compétences requises</h2>
<ul>
<li>3+ années d'expérience avec React</li>
<li>Maîtrise de TypeScript</li>
<li>Expérience avec Next.js, TailwindCSS</li>
<li>Connaissance des bonnes pratiques SEO</li>
<li>Git, CI/CD</li>
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
          organizationId: organizations[1].id,
          title: "Développeur Full-Stack Node.js/React",
          description: `# Développeur Full-Stack Node.js/React

## Mission
Rejoignez notre agence digitale pour créer des solutions web sur mesure pour nos clients prestigieux.

## Stack technique
- **Frontend:** React, Next.js, TailwindCSS
- **Backend:** Node.js, Express, PostgreSQL
- **DevOps:** Docker, AWS, CI/CD

## Profil recherché
- Autonome et force de proposition
- Expérience en agence appréciée
- Anglais courant pour les clients internationaux

## Avantages
- 🏠 Télétravail 3j/semaine
- 📚 Budget formation 2000€/an
- 🍕 Team building réguliers
- 💰 Prime sur objectifs`,
          wage: 45000,
          wageInterval: "yearly",
          stateAbbreviation: "NY",
          city: "New York",
          locationRequirement: "hybrid",
          experienceLevel: "mid-level",
          type: "full-time",
          status: "published",
          isFeatured: false,
          postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Il y a 1 jour
        },
        {
          organizationId: organizations[2].id,
          title: "Senior Backend Developer - FinTech",
          description: `# Senior Backend Developer - FinTech

## À propos de FinanceNext
Startup FinTech en forte croissance, nous révolutionnons les services financiers avec des solutions innovantes.

## Votre mission
- Architecting scalable microservices
- Building secure payment systems
- Leading technical decisions
- Mentoring junior developers

## Technologies
- **Languages:** TypeScript, Go, Python
- **Databases:** PostgreSQL, Redis, MongoDB
- **Cloud:** AWS, Kubernetes, Terraform
- **Security:** OAuth2, JWT, encryption

## Exigences
- 5+ years backend development
- Experience with financial systems
- Strong knowledge of security best practices
- Leadership experience

## Package
- Competitive salary + equity
- Full remote work
- Top-tier equipment
- Health & dental insurance`,
          wage: 95000,
          wageInterval: "yearly",
          stateAbbreviation: null,
          city: null,
          locationRequirement: "remote",
          experienceLevel: "senior",
          type: "full-time",
          status: "published",
          isFeatured: true,
          postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Il y a 3 jours
        },
        {
          organizationId: organizations[3].id,
          title: "Développeur React Junior - E-commerce",
          description: `# Développeur React Junior - E-commerce

## Opportunité junior
Parfait pour débuter ta carrière dans le développement web ! Nous cherchons un développeur junior motivé pour rejoindre notre équipe e-commerce.

## Tu apprendras
- Développement d'interfaces e-commerce
- Intégration d'APIs REST/GraphQL
- Tests automatisés (Jest, Cypress)
- Méthodologies Agile/Scrum

## Prérequis
- Formation informatique ou équivalent
- Bases solides en JavaScript/React
- Première expérience (stage, projets perso)
- Curiosité et envie d'apprendre

## Nous offrons
- Mentorat personnalisé
- Formation technique continue
- Projets variés et stimulants
- Ambiance startup décontractée
- Évolution rapide possible

## Bonus
- Expérience e-commerce
- Connaissance TypeScript
- Projets open-source`,
          wage: 35000,
          wageInterval: "yearly",
          stateAbbreviation: "TX",
          city: "Austin",
          locationRequirement: "in-office",
          experienceLevel: "junior",
          type: "full-time",
          status: "published",
          isFeatured: false,
          postedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // Il y a 4 jours
        },
        {
          organizationId: organizations[4].id,
          title: "DevOps Engineer - Kubernetes & AWS",
          description: `# DevOps Engineer - Kubernetes & AWS

## Mission
Rejoignez notre équipe DevOps pour gérer l'infrastructure cloud de nos applications médicales critiques.

## Responsabilités
- Manage Kubernetes clusters (EKS)
- Implement CI/CD pipelines
- Monitor and optimize system performance
- Ensure security and compliance (HIPAA)
- Incident response and troubleshooting

## Stack technique
- **Cloud:** AWS (EC2, RDS, S3, Lambda)
- **Container:** Docker, Kubernetes, Helm
- **CI/CD:** GitHub Actions, ArgoCD
- **Monitoring:** Prometheus, Grafana, ELK
- **IaC:** Terraform, CloudFormation

## Profil
- 3+ années d'expérience DevOps
- Certification AWS appréciée
- Expérience secteur santé un plus
- On-call rotation acceptée

## Avantages
- Impact social fort (santé)
- Équipe technique senior
- Budget conférences/certifications
- Stock options`,
          wage: 75000,
          wageInterval: "yearly",
          stateAbbreviation: "WA",
          city: "Seattle",
          locationRequirement: "hybrid",
          experienceLevel: "senior",
          type: "full-time",
          status: "published",
          isFeatured: false,
          postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Il y a 5 jours
        },
        {
          organizationId: organizations[0].id,
          title: "Stage Développeur Web - 6 mois",
          description: `# Stage Développeur Web - 6 mois

## Opportunité de stage
Stage de fin d'études dans une startup innovante ! Rejoins notre équipe pour 6 mois d'apprentissage intensif.

## Ce que tu feras
- Développement de features web (React/Node.js)
- Participation aux daily standups
- Code reviews avec les seniors
- Projet personnel encadré
- Présentation finale à l'équipe

## Profil recherché
- Étudiant(e) école d'ingé/université
- Bases en développement web
- Motivation et curiosité
- Esprit d'équipe

## Environnement
- Startup dynamique (50 personnes)
- Locaux modernes à San Francisco
- Mentorat par développeurs expérimentés
- Possibilité d'embauche à l'issue

## Technologies découvertes
- React, Next.js, TypeScript
- Node.js, PostgreSQL, Docker
- Git, GitHub, Agile
- AWS, CI/CD

*Gratification: 1200€/mois + tickets restaurant*`,
          wage: 1200,
          wageInterval: "yearly",
          stateAbbreviation: "CA",
          city: "San Francisco",
          locationRequirement: "in-office",
          experienceLevel: "junior",
          type: "internship",
          status: "published",
          isFeatured: false,
          postedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Il y a 7 jours
        },
        {
          organizationId: organizations[1].id,
          title: "Développeur Mobile React Native",
          description: `# Développeur Mobile React Native

## Mission
Développer des applications mobiles cross-platform pour nos clients dans différents secteurs (retail, finance, santé).

## Responsabilités
- Développement d'apps iOS/Android avec React Native
- Intégration d'APIs REST et GraphQL
- Optimisation des performances mobile
- Publication sur App Store et Google Play
- Maintenance et debug des applications

## Compétences techniques
- React Native (2+ années)
- JavaScript/TypeScript
- Navigation (React Navigation)
- State management (Redux/Zustand)
- Native modules (si besoin)
- Push notifications, deep linking

## Expérience souhaitée
- Apps publiées sur les stores
- Connaissance écosystème mobile
- Tests unitaires et e2e
- Design patterns mobile

## Notre offre
- Projets clients variés et stimulants
- Équipe mobile experte (5 devs)
- Matériel Apple et Android fourni
- Formation continue aux nouvelles technos
- Horaires flexibles`,
          wage: 50000,
          wageInterval: "yearly",
          stateAbbreviation: "FL",
          city: "Miami",
          locationRequirement: "hybrid",
          experienceLevel: "mid-level",
          type: "full-time",
          status: "published",
          isFeatured: false,
          postedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // Il y a 8 jours
        },
        {
          organizationId: organizations[3].id,
          title: "Data Engineer - Python/AWS",
          description: `# Data Engineer - Python/AWS

## Contexte
Notre plateforme e-commerce traite des millions d'événements par jour. Nous cherchons un Data Engineer pour optimiser nos pipelines de données.

## Missions principales
- Design et implémentation de pipelines ETL
- Optimisation des performances des requêtes
- Mise en place de data lakes et warehouses
- Monitoring et alerting des flux de données
- Collaboration avec les équipes Data Science

## Stack Data
- **Languages:** Python, SQL, Scala
- **Big Data:** Apache Spark, Kafka, Airflow
- **Cloud:** AWS (Redshift, S3, Glue, EMR)
- **Databases:** PostgreSQL, DynamoDB, Elasticsearch
- **BI Tools:** Tableau, Looker

## Profil idéal
- 3+ ans d'expérience en Data Engineering
- Maîtrise de Python et SQL
- Expérience avec des volumes importants de données
- Connaissance des architectures distribuées
- Rigueur et attention aux détails

## Pourquoi nous rejoindre?
- Impact direct sur le business (recommandations, analytics)
- Données riches et variées (comportement users, transactions)
- Équipe Data de 15+ personnes
- Technologies de pointe
- Remote-friendly`,
          wage: 70000,
          wageInterval: "yearly",
          stateAbbreviation: null,
          city: null,
          locationRequirement: "remote",
          experienceLevel: "mid-level",
          type: "full-time",
          status: "published",
          isFeatured: true,
          postedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // Il y a 10 jours
        },
      ])
      .returning()

    console.log(`✅ Created ${jobListings.length} job listings`)

    // Créer des paramètres de notification pour les utilisateurs
    const notificationSettings = await db
      .insert(UserNotificationSettingsTable)
      .values([
        {
          userId: users[0].id,
          newJobEmailNotifications: true,
          aiPrompt: "Recherche des postes React, Next.js, frontend, développement web moderne",
        },
        {
          userId: users[1].id,
          newJobEmailNotifications: true,
          aiPrompt: "Intéressé par les postes backend Node.js, API, microservices",
        },
        {
          userId: users[2].id,
          newJobEmailNotifications: false,
        },
        {
          userId: users[3].id,
          newJobEmailNotifications: true,
          aiPrompt: "DevOps, cloud AWS, Kubernetes, infrastructure",
        },
      ])
      .returning()

    console.log(`✅ Created ${notificationSettings.length} notification settings`)

    // Créer quelques CVs factices
    const resumes = await db
      .insert(UserResumeTable)
      .values([
        {
          userId: users[0].id,
          resumeFileUrl: "https://example.com/resumes/alice_dupont.pdf",
          resumeFileKey: "resumes/alice_dupont_cv.pdf",
          aiSummary: "Développeuse frontend expérimentée avec 4 ans d'expérience en React, Next.js et TypeScript. Spécialisée dans les interfaces utilisateur modernes, l'optimisation des performances et l'accessibilité. Expérience en startup et grande entreprise.",
        },
        {
          userId: users[1].id,
          resumeFileUrl: "https://example.com/resumes/bob_martin.pdf",
          resumeFileKey: "resumes/bob_martin_cv.pdf",
          aiSummary: "Développeur full-stack avec expertise en Node.js, Express, PostgreSQL et React. 5 ans d'expérience dans le développement d'APIs REST, microservices et applications web. Expérience en architecture et mentoring d'équipe.",
        },
        {
          userId: users[2].id,
          resumeFileUrl: "https://example.com/resumes/claire_bernard.pdf",
          resumeFileKey: "resumes/claire_bernard_cv.pdf",
          aiSummary: "Ingénieure DevOps avec 6 ans d'expérience en infrastructure cloud AWS, Kubernetes et CI/CD. Expertise en monitoring, sécurité et automatisation. Expérience dans des environnements à haute disponibilité.",
        },
      ])
      .returning()

    console.log(`✅ Created ${resumes.length} resumes`)

    // Créer quelques candidatures factices
    const applications = await db
      .insert(JobListingApplicationTable)
      .values([
        {
          jobListingId: jobListings[0].id, // React Frontend job
          userId: users[0].id, // Alice (Frontend)
          coverLetter: "Bonjour,\n\nJe suis très intéressée par ce poste de développeur Frontend React/Next.js. Mon expérience de 4 ans en développement React et ma passion pour les interfaces utilisateur modernes correspondent parfaitement à vos besoins.\n\nJ'ai récemment travaillé sur la refonte complète d'une application e-commerce utilisant Next.js et TailwindCSS, avec des résultats significatifs sur les performances et l'UX.\n\nJe serais ravie de discuter de cette opportunité avec vous.\n\nCordialement,\nAlice Dupont",
          stage: "applied",
          rating: 4,
        },
        {
          jobListingId: jobListings[1].id, // Full-Stack job
          userId: users[1].id, // Bob (Full-Stack)
          coverLetter: "Bonjour,\n\nVotre annonce pour le poste de développeur Full-Stack Node.js/React a retenu toute mon attention. Avec 5 ans d'expérience dans ce domaine et une spécialisation en développement d'APIs et microservices, je pense pouvoir apporter une réelle valeur ajoutée à votre équipe.\n\nMon expérience en agence me permet de m'adapter rapidement aux différents projets clients et de respecter les deadlines serrées.\n\nJ'aimerais échanger avec vous sur cette opportunité.\n\nBien à vous,\nBob Martin",
          stage: "interested",
          rating: 5,
        },
        {
          jobListingId: jobListings[2].id, // Senior Backend FinTech
          userId: users[1].id, // Bob (Full-Stack vers Backend)
          coverLetter: "Bonjour,\n\nJe candidate pour le poste de Senior Backend Developer chez FinanceNext. Bien que je n'aie pas d'expérience directe en FinTech, mon expertise en développement backend sécurisé et mon intérêt pour les systèmes financiers me motivent fortement pour cette transition.\n\nJe suis particulièrement attiré par les défis techniques et de sécurité du secteur financier.\n\nMerci pour votre considération.\n\nCordialement,\nBob Martin",
          stage: "applied",
          rating: 3,
        },
        {
          jobListingId: jobListings[4].id, // DevOps Engineer
          userId: users[2].id, // Claire (DevOps)
          coverLetter: "Bonjour,\n\nJe souhaite postuler pour le poste de DevOps Engineer chez MedTech Innovations. Mon expérience de 6 ans en infrastructure cloud AWS et Kubernetes, combinée à ma sensibilité aux enjeux de sécurité dans le secteur médical, font de moi une candidate idéale.\n\nJ'ai déjà travaillé sur des systèmes critiques nécessitant une haute disponibilité et une conformité stricte aux réglementations.\n\nJ'espère avoir l'opportunité d'échanger avec vous.\n\nCordialement,\nClaire Bernard",
          stage: "interviewed",
          rating: 5,
        },
      ])
      .returning()

    console.log(`✅ Created ${applications.length} job applications`)

    console.log("\n🎉 Database seeding completed successfully!")
    console.log("\n📊 Summary:")
    console.log(`   👥 Users: ${users.length}`)
    console.log(`   🏢 Organizations: ${organizations.length}`)
    console.log(`   💼 Job Listings: ${jobListings.length}`)
    console.log(`   📄 Resumes: ${resumes.length}`)
    console.log(`   📝 Applications: ${applications.length}`)
    console.log(`   🔔 Notification Settings: ${notificationSettings.length}`)
  } catch (error) {
    console.error("❌ Error seeding database:", error)
    throw error
  }
}

// Exécuter le script
if (require.main === module) {
  seed()
    .then(() => {
      console.log("✅ Seeding completed")
      process.exit(0)
    })
    .catch((error) => {
      console.error("❌ Seeding failed:", error)
      process.exit(1)
    })
}

export { seed }
