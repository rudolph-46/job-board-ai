import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { db } from '@/drizzle/db'
import { JobListingTable } from '@/drizzle/schema/jobListing'
import { OrganizationTable } from '@/drizzle/schema/organization'
import { eq } from 'drizzle-orm'

// Interface pour typer les événements Apify
interface ApifyWebhookEvent {
  userId: string
  createdAt: string
  eventType: 'ACTOR.RUN.SUCCEEDED' | 'ACTOR.RUN.FAILED' | 'ACTOR.RUN.ABORTED' | string
  eventData: {
    actorId: string
    actorRunId: string
  }
  resource: {
    id: string
    actId: string
    userId: string
    startedAt: string
    finishedAt: string
    status: 'SUCCEEDED' | 'FAILED' | 'ABORTED' | string
    stats: {
      durationMillis: number
      computeUnits: number
      runTimeSecs: number
      memAvgBytes: number
      memMaxBytes: number
      cpuAvgUsage: number
      netRxBytes: number
      netTxBytes: number
    }
    defaultDatasetId: string
    defaultKeyValueStoreId: string
    defaultRequestQueueId: string
    links: {
      publicRunUrl: string
      consoleRunUrl: string
      apiRunUrl: string
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🕷️ Apify webhook POST request received')
    
    // Récupérer les headers
    const headersList = await headers()
    const contentType = headersList.get('content-type')
    const userAgent = headersList.get('user-agent')
    
    console.log('📋 Apify Webhook Headers:', {
      contentType,
      userAgent
    })
    
    // Vérifier le content-type
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      )
    }
    
    // Récupérer le body
    const apifyEvent: ApifyWebhookEvent = await request.json()
    
    console.log('📦 Apify Event:', {
      eventType: apifyEvent.eventType,
      actorRunId: apifyEvent.eventData.actorRunId,
      status: apifyEvent.resource.status,
      duration: apifyEvent.resource.stats.durationMillis + 'ms'
    })
    
    // Valider la structure de l'événement Apify
    if (!apifyEvent.eventType || !apifyEvent.eventData || !apifyEvent.resource) {
      return NextResponse.json(
        { error: 'Invalid Apify webhook format' },
        { status: 400 }
      )
    }
    
    // Vérifier si c'est votre propre run (optionnel)
    const APIFY_USER_ID = process.env.APIFY_USER_ID // Votre ID utilisateur Apify
    
    if (APIFY_USER_ID && apifyEvent.userId !== APIFY_USER_ID) {
      console.log('⚠️ Ignoring webhook from different user:', {
        webhookUserId: apifyEvent.userId,
        expectedUserId: APIFY_USER_ID
      })
      return NextResponse.json({ 
        message: 'Webhook ignored - different user',
        userId: apifyEvent.userId,
        expectedUserId: APIFY_USER_ID
      })
    }

    // Traitement des différents types d'événements Apify
    switch (apifyEvent.eventType) {
      case 'ACTOR.RUN.SUCCEEDED':
        await handleActorRunSucceeded(apifyEvent)
        break
        
      case 'ACTOR.RUN.FAILED':
        await handleActorRunFailed(apifyEvent)
        break
        
      case 'ACTOR.RUN.ABORTED':
        await handleActorRunAborted(apifyEvent)
        break
        
      default:
        console.log('❓ Unknown Apify event type:', apifyEvent.eventType)
        return NextResponse.json(
          { error: `Unsupported Apify event type: ${apifyEvent.eventType}` },
          { status: 400 }
        )
    }
    
    // Réponse de succès
    return NextResponse.json({
      success: true,
      message: `Apify event ${apifyEvent.eventType} processed successfully`,
      actorRunId: apifyEvent.eventData.actorRunId,
      datasetId: apifyEvent.resource.defaultDatasetId,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Error processing Apify webhook:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process Apify webhook',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}

// Fonction principale pour traiter un actor qui a réussi
async function handleActorRunSucceeded(event: ApifyWebhookEvent & { _testData?: any[] }) {
  console.log('🎉 Processing successful Apify actor run')
  
  const { resource } = event
  const { defaultDatasetId, id: actorRunId } = resource
  
  console.log('📊 Success details:', {
    actorRunId,
    datasetId: defaultDatasetId,
    duration: resource.stats?.durationMillis,
    computeUnits: resource.stats?.computeUnits,
    memUsage: resource.stats?.memAvgBytes ? Math.round(resource.stats.memAvgBytes / 1024 / 1024) + 'MB' : 'N/A',
    cpuUsage: resource.stats?.cpuAvgUsage ? Math.round(resource.stats.cpuAvgUsage) + '%' : 'N/A',
    hasTestData: !!event._testData
  })
  
  try {
    // Étape 1: Récupérer les données du dataset (ou utiliser les données de test)
    const datasetItems = await fetchApifyDataset(defaultDatasetId, event._testData)
    console.log(`📦 Retrieved ${datasetItems?.length || 0} items from dataset`)
    
    // Étape 2: Traiter les données selon leur type
    if (datasetItems && datasetItems.length > 0) {
      await processScrapedData(datasetItems, resource)
    } else {
      console.log('📭 No items to process')
    }
    
    // Étape 3: Envoyer des notifications si nécessaire
    await sendSuccessNotification(resource)
    
  } catch (error) {
    console.error('❌ Error processing successful actor run:', error)
  }
}

async function handleActorRunFailed(event: ApifyWebhookEvent) {
  console.log('💥 Processing failed Apify actor run')
  
  const { resource } = event
  
  console.log('❌ Failure details:', {
    actorRunId: resource.id,
    status: resource.status,
    duration: resource.stats.durationMillis,
    errorUrl: resource.links.consoleRunUrl
  })
  
  // Traitement des échecs:
  // - Logger l'erreur
  // - Envoyer une alerte
  // - Déclencher un retry si approprié
  await sendFailureAlert(resource)
}

async function handleActorRunAborted(event: ApifyWebhookEvent) {
  console.log('⏹️ Processing aborted Apify actor run')
  
  const { resource } = event
  
  console.log('⚠️ Abort details:', {
    actorRunId: resource.id,
    status: resource.status,
    duration: resource.stats.durationMillis
  })
  
  // Traitement des abandons
  await logAbortedRun(resource)
}

// Fonction pour récupérer les données du dataset Apify
async function fetchApifyDataset(datasetId: string, testData?: any[]): Promise<any[]> {
  try {
    // Si des données de test sont fournies, les utiliser directement
    if (testData && Array.isArray(testData)) {
      console.log('🧪 Using provided test data instead of API call')
      return testData
    }
    
    console.log('📥 Fetching dataset:', datasetId)
    
    const response = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?format=json`, {
      headers: {
        'Authorization': `Bearer ${process.env.APIFY_TOKEN}`,
        'User-Agent': 'job-board-webhook/1.0'
      }
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        console.warn('⚠️ Dataset not found or not accessible:', datasetId)
        return []
      } else if (response.status === 403 || response.status === 401) {
        console.warn('🚫 Access denied to dataset (different user):', datasetId)
        return []
      }
      throw new Error(`Apify API error: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    return Array.isArray(data) ? data : []
    
  } catch (error) {
    console.error('❌ Error fetching Apify dataset:', error)
    return []
  }
}

// Fonction pour traiter les données scrapées
async function processScrapedData(items: any[], resource: any) {
  console.log(`🔄 Processing ${items.length} scraped items`)
  
  let successCount = 0
  let errorCount = 0
  
  for (const item of items) {
    try {
      // Détecter et traiter les jobs scrapés
      if (isJobListing(item)) {
        console.log('💼 Processing job:', item.jobTitle || item.title || item.name)
        const success = await saveJobToDatabase(item, resource)
        if (success) {
          successCount++
        } else {
          errorCount++
        }
      }
      // Détecter d'autres types de données si nécessaire
      else if (item.name && item.profileUrl) {
        console.log('👤 Skipping profile data:', item.name)
      }
      else if (item.companyName || item.company) {
        console.log('🏢 Skipping company data:', item.companyName || item.company)
      }
      else {
        console.log('❓ Unknown item type, keys:', Object.keys(item).slice(0, 5))
      }
      
    } catch (error) {
      console.error('❌ Error processing item:', error)
      errorCount++
    }
  }
  
  console.log(`✅ Processing complete: ${successCount} saved, ${errorCount} errors`)
}

async function sendSuccessNotification(resource: any) {
  console.log('📧 Sending success notification')
  // Ici vous pourriez envoyer un email, Slack message, etc.
}

async function sendFailureAlert(resource: any) {
  console.log('🚨 Sending failure alert')
  // Ici vous pourriez envoyer une alerte
}

async function logAbortedRun(resource: any) {
  console.log('📝 Logging aborted run')
  // Ici vous pourriez logger dans votre système de monitoring
}

// Fonction pour détecter si un item est une offre d'emploi
function isJobListing(item: any): boolean {
  // Vérifier la présence de champs typiques d'une offre d'emploi
  const jobFields = [
    'jobTitle', 'title', 'position', 'positionTitle',
    'company', 'companyName', 'employer',
    'description', 'jobDescription', 'descriptionHtml',
    'location', 'jobLocation', 'city',
    'salary', 'wage', 'compensation',
    'jobUrl', 'url', 'link', 'applyUrl'
  ]
  
  // Un item est considéré comme un job s'il a au moins 3 champs de job
  const foundFields = jobFields.filter(field => 
    item[field] && typeof item[field] === 'string' && item[field].trim().length > 0
  )
  
  return foundFields.length >= 3
}

// Fonction pour sauvegarder un job dans la base de données
async function saveJobToDatabase(item: any, resource: any): Promise<boolean> {
  try {
    console.log('💾 Saving job to database:', item.jobTitle || item.title)
    
    // Extraire et nettoyer les données du job
    const jobData = extractJobData(item, resource)
    
    if (!jobData.title || !jobData.organizationName) {
      console.warn('⚠️ Missing required fields, skipping job')
      return false
    }
    
    // Vérifier si l'organisation existe, sinon la créer
    const organizationId = await ensureOrganizationExists(jobData.organizationName, item)
    
    // Créer le job listing
    const jobListing = {
      id: generateJobId(item, resource),
      organizationId: organizationId,
      organizationName: jobData.organizationName,
      organizationLogo: jobData.organizationLogo,
      organizationUrl: jobData.organizationUrl,
      title: jobData.title,
      url: jobData.url,
      descriptionHtml: jobData.descriptionHtml,
      city: jobData.city,
      region: jobData.region,
      country: jobData.country,
      location: jobData.location,
      aiSalaryMinValue: jobData.salaryMin,
      aiSalaryMaxValue: jobData.salaryMax,
      aiSalaryCurrency: jobData.salaryCurrency,
      aiExperienceLevel: jobData.experienceLevel,
      aiWorkArrangement: jobData.workArrangement as any,
      aiKeySkills: jobData.skills,
      aiEmploymentType: jobData.employmentType,
      status: 'published' as any,
      isFeatured: false,
    }
    
    // Insérer dans la base de données
    await db.insert(JobListingTable).values(jobListing)
    
    console.log('✅ Job saved successfully:', jobListing.title)
    return true
    
  } catch (error) {
    console.error('❌ Error saving job to database:', error)
    return false
  }
}

// Fonction pour extraire les données d'un job depuis l'item Apify
function extractJobData(item: any, resource: any) {
  // Titre du poste
  const title = item.jobTitle || item.title || item.position || item.positionTitle || 'Poste sans titre'
  
  // Entreprise
  const organizationName = item.company || item.companyName || item.employer || 'Entreprise inconnue'
  
  // Description
  let descriptionHtml = item.description || item.jobDescription || item.descriptionHtml || ''
  if (descriptionHtml && !descriptionHtml.includes('<')) {
    // Convertir le texte brut en HTML simple
    descriptionHtml = `<p>${descriptionHtml.replace(/\n/g, '</p><p>')}</p>`
  }
  
  // Localisation
  const city = item.city || item.jobCity || extractCityFromLocation(item.location || item.jobLocation)
  const country = item.country || item.jobCountry || 'France'
  const location = item.location || item.jobLocation || `${city}, ${country}`
  
  // Salaire
  const salaryInfo = extractSalaryInfo(item)
  
  // Compétences
  const skills = extractSkills(item)
  
  // URL
  const url = item.jobUrl || item.url || item.link || item.applyUrl || `https://example.com/job/${Date.now()}`
  
  return {
    title: title.substring(0, 255), // Limite de la DB
    organizationName: organizationName.substring(0, 255),
    organizationLogo: item.companyLogo || item.logo || null,
    organizationUrl: item.companyUrl || item.companyWebsite || null,
    url,
    descriptionHtml,
    city,
    region: item.region || item.state || null,
    country,
    location,
    salaryMin: salaryInfo.min,
    salaryMax: salaryInfo.max,
    salaryCurrency: salaryInfo.currency,
    experienceLevel: item.experienceLevel || item.experience || null,
    workArrangement: extractWorkArrangement(item),
    skills,
    employmentType: extractEmploymentType(item),
  }
}

// Fonction pour s'assurer qu'une organisation existe
async function ensureOrganizationExists(organizationName: string, item: any): Promise<string> {
  try {
    // Générer un ID unique pour l'organisation
    const orgId = `org_${organizationName.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 20)}_${Date.now()}`
    
    // Vérifier si l'organisation existe déjà
    const existingOrg = await db.select().from(OrganizationTable).where(eq(OrganizationTable.name, organizationName)).limit(1)
    
    if (existingOrg.length > 0) {
      return existingOrg[0].id
    }
    
    // Créer une nouvelle organisation
    const newOrg = {
      id: orgId,
      name: organizationName,
      imageUrl: item.companyLogo || item.logo || `https://via.placeholder.com/150?text=${encodeURIComponent(organizationName.substring(0, 2))}`
    }
    
    await db.insert(OrganizationTable).values(newOrg)
    console.log('🏢 Created new organization:', organizationName)
    
    return orgId
    
  } catch (error) {
    console.error('❌ Error ensuring organization exists:', error)
    // Retourner un ID par défaut en cas d'erreur
    return 'org_default'
  }
}

// Fonctions utilitaires pour extraire les données
function generateJobId(item: any, resource: any): string {
  const baseId = item.id || item.jobId || resource.id || Date.now()
  return `job_apify_${baseId}`
}

function extractCityFromLocation(location: string): string {
  if (!location) return ''
  // Extraire la première partie avant la virgule (généralement la ville)
  return location.split(',')[0].trim()
}

function extractSalaryInfo(item: any) {
  const salaryText = item.salary || item.wage || item.compensation || item.salaryRange || ''
  
  // Essayer d'extraire des nombres du texte de salaire
  const numbers = salaryText.match(/\d+[\d\s,.]*/g)
  
  if (numbers && numbers.length >= 1) {
    const cleanNumbers = numbers.map((n: string) => parseInt(n.replace(/[^\d]/g, '')))
    return {
      min: Math.min(...cleanNumbers),
      max: Math.max(...cleanNumbers),
      currency: salaryText.includes('€') ? 'EUR' : salaryText.includes('$') ? 'USD' : 'EUR'
    }
  }
  
  return { min: null, max: null, currency: 'EUR' }
}

function extractSkills(item: any): string[] {
  const skillsText = item.skills || item.requirements || item.technologies || item.qualifications || ''
  
  if (!skillsText) return []
  
  // Liste de compétences communes à rechercher
  const commonSkills = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'PHP', 'CSS', 'HTML',
    'Vue.js', 'Angular', 'Laravel', 'Symfony', 'Docker', 'Kubernetes', 'AWS', 'Azure',
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Git', 'Jenkins', 'CI/CD'
  ]
  
  return commonSkills.filter(skill => 
    skillsText.toLowerCase().includes(skill.toLowerCase())
  )
}

function extractWorkArrangement(item: any): 'Remote' | 'On-site' | 'Hybrid' | null {
  const workText = (item.workArrangement || item.remote || item.location || '').toLowerCase()
  
  if (workText.includes('remote') || workText.includes('télétravail')) return 'Remote'
  if (workText.includes('hybrid') || workText.includes('hybride')) return 'Hybrid'
  if (workText.includes('on-site') || workText.includes('bureau') || workText.includes('présentiel')) return 'On-site'
  
  return null
}

function extractEmploymentType(item: any): ("FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP")[] {
  const typeText = (item.employmentType || item.contractType || item.type || '').toLowerCase()
  
  if (typeText.includes('cdi') || typeText.includes('full-time') || typeText.includes('temps plein')) return ['FULL_TIME']
  if (typeText.includes('cdd') || typeText.includes('part-time') || typeText.includes('temps partiel')) return ['PART_TIME']
  if (typeText.includes('stage') || typeText.includes('intern')) return ['INTERNSHIP']
  if (typeText.includes('freelance') || typeText.includes('contract') || typeText.includes('consultant')) return ['CONTRACT']
  
  return ['FULL_TIME'] // Par défaut
}

export async function GET() {
  return NextResponse.json({
    message: 'Apify webhook endpoint is active',
    supportedEvents: [
      'ACTOR.RUN.SUCCEEDED',
      'ACTOR.RUN.FAILED',
      'ACTOR.RUN.ABORTED'
    ],
    features: [
      'Automatic job data extraction',
      'Database integration',
      'Organization management',
      'Smart data parsing'
    ],
    timestamp: new Date().toISOString()
  })
}
