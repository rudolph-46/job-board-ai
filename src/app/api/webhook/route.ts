import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 Webhook POST request received')
    
    // Récupérer les headers
    const headersList = await headers()
    const contentType = headersList.get('content-type')
    const userAgent = headersList.get('user-agent')
    const authorization = headersList.get('authorization')
    
    console.log('📋 Headers:', {
      contentType,
      userAgent,
      authorization: authorization ? '***' : 'None'
    })
    
    // Récupérer le body de la requête
    let body: any = null
    if (contentType?.includes('application/json')) {
      body = await request.json()
    } else if (contentType?.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData()
      body = Object.fromEntries(formData)
    } else {
      body = await request.text()
    }
    
    console.log('📦 Body:', body)
    
    // Récupérer les query params
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams)
    console.log('🔍 Query params:', queryParams)
    
    // Log de l'URL complète
    console.log('🔗 Full URL:', request.url)
    console.log('🌐 Method:', request.method)
    
    // Ici vous pouvez ajouter votre logique de traitement
    // Par exemple:
    // - Valider le webhook
    // - Traiter les données
    // - Déclencher des actions
    
    // Traitement spécialisé pour les événements Apify
    if (body && typeof body === 'object' && body.eventType) {
      console.log(`🎯 Apify event detected: ${body.eventType}`)
      
      switch (body.eventType) {
        case 'ACTOR.RUN.SUCCEEDED':
          console.log('✅ Apify actor run succeeded!')
          await handleApifyActorSuccess(body)
          break
        case 'ACTOR.RUN.FAILED':
          console.log('❌ Apify actor run failed!')
          await handleApifyActorFailure(body)
          break
        case 'ACTOR.RUN.ABORTED':
          console.log('⏹️ Apify actor run aborted!')
          await handleApifyActorAborted(body)
          break
        default:
          console.log('❓ Unknown Apify event type:', body.eventType)
      }
    }
    // Traitement pour d'autres types d'événements
    else if (body && typeof body === 'object' && body.event) {
      console.log(`🎯 General event detected: ${body.event}`)
      
      switch (body.event) {
        case 'user.created':
          console.log('👤 New user created:', body.data)
          break
        case 'job.posted':
          console.log('💼 New job posted:', body.data)
          break
        case 'application.submitted':
          console.log('📝 New application submitted:', body.data)
          break
        default:
          console.log('❓ Unknown event type:', body.event)
      }
    }
    
    // Réponse de succès
    return NextResponse.json(
      { 
        success: true, 
        message: 'Webhook received successfully',
        timestamp: new Date().toISOString(),
        received: {
          headers: {
            contentType,
            userAgent,
            hasAuth: !!authorization
          },
          body: body,
          queryParams
        }
      }, 
      { status: 200 }
    )
    
  } catch (error) {
    console.error('❌ Error processing webhook:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process webhook',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}

// Optionnel: Gérer d'autres méthodes HTTP
export async function GET(request: NextRequest) {
  console.log('📡 Webhook GET request received')
  
  return NextResponse.json({
    message: 'Webhook endpoint is active',
    methods: ['POST'],
    timestamp: new Date().toISOString(),
    url: request.url
  })
}

export async function PUT(request: NextRequest) {
  console.log('🔄 Webhook PUT request received')
  
  try {
    const body = await request.json()
    console.log('📦 PUT Body:', body)
    
    return NextResponse.json({
      success: true,
      message: 'PUT request processed',
      body
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to process PUT request'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  console.log('🗑️ Webhook DELETE request received')
  
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  
  console.log('🆔 Delete ID:', id)
  
  return NextResponse.json({
    success: true,
    message: `DELETE request processed${id ? ` for ID: ${id}` : ''}`,
    id
  })
}

// Fonctions de traitement des événements Apify
async function handleApifyActorSuccess(webhookData: any) {
  console.log('🎉 Processing successful Apify actor run')
  
  const { resource, eventData } = webhookData
  const { actorRunId, defaultDatasetId } = resource
  
  console.log('📊 Actor run details:', {
    actorRunId,
    datasetId: defaultDatasetId,
    duration: resource.stats.durationMillis + 'ms',
    computeUnits: resource.stats.computeUnits,
    itemCount: resource.options.maxItems
  })
  
  try {
    // Ici vous pourriez récupérer les données du dataset avec l'API Apify
    console.log('📥 Dataset ID for data retrieval:', defaultDatasetId)
    
    // Exemple avec l'API Apify (vous devrez installer le client Apify)
    // const { ApifyClient } = require('apify-client')
    // const client = new ApifyClient({ token: process.env.APIFY_TOKEN })
    // const { items } = await client.dataset(defaultDatasetId).listItems()
    // console.log('📦 Retrieved items:', items.length)
    
    // Traitement des données récupérées
    // - Sauvegarder dans votre base de données
    // - Déclencher des processus d'IA 
    // - Envoyer des notifications
    // - Mettre à jour des job listings
    
    console.log('✅ Successfully processed Apify actor success event')
    
  } catch (error) {
    console.error('❌ Error processing Apify dataset:', error)
  }
}

async function handleApifyActorFailure(webhookData: any) {
  console.log('💥 Processing failed Apify actor run')
  
  const { resource } = webhookData
  
  console.log('❌ Failure details:', {
    actorRunId: resource.id,
    status: resource.status,
    exitCode: resource.exitCode,
    duration: resource.stats.durationMillis + 'ms'
  })
  
  // Ici vous pourriez :
  // - Envoyer une alerte
  // - Logger l'erreur
  // - Déclencher un retry
  // - Notifier l'équipe technique
}

async function handleApifyActorAborted(webhookData: any) {
  console.log('⏹️ Processing aborted Apify actor run')
  
  const { resource } = webhookData
  
  console.log('⚠️ Abort details:', {
    actorRunId: resource.id,
    status: resource.status,
    duration: resource.stats.durationMillis + 'ms'
  })
  
  // Ici vous pourriez :
  // - Logger l'abandon
  // - Nettoyer les ressources partielles
  // - Déclencher une nouvelle exécution si nécessaire
}
