import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

// Interface pour typer les événements
interface WebhookEvent {
  event: string
  timestamp: string
  data: any
  source?: string
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 Jobs webhook POST request received')
    
    // Récupérer les headers
    const headersList = await headers()
    const contentType = headersList.get('content-type')
    const signature = headersList.get('x-webhook-signature')
    const eventType = headersList.get('x-event-type')
    
    console.log('📋 Jobs Webhook Headers:', {
      contentType,
      signature: signature ? '***' : 'None',
      eventType
    })
    
    // Vérifier le content-type
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      )
    }
    
    // Récupérer le body
    const webhookEvent: WebhookEvent = await request.json()
    
    console.log('📦 Jobs Webhook Event:', webhookEvent)
    
    // Valider la structure de l'événement
    if (!webhookEvent.event || !webhookEvent.data) {
      return NextResponse.json(
        { error: 'Invalid webhook format. Required: event, data' },
        { status: 400 }
      )
    }
    
    // Traitement des différents types d'événements de job
    switch (webhookEvent.event) {
      case 'job.created':
        console.log('💼 New job created:', webhookEvent.data)
        await handleJobCreated(webhookEvent.data)
        break
        
      case 'job.updated':
        console.log('📝 Job updated:', webhookEvent.data)
        await handleJobUpdated(webhookEvent.data)
        break
        
      case 'job.deleted':
        console.log('🗑️ Job deleted:', webhookEvent.data)
        await handleJobDeleted(webhookEvent.data)
        break
        
      case 'application.received':
        console.log('📨 Application received:', webhookEvent.data)
        await handleApplicationReceived(webhookEvent.data)
        break
        
      case 'application.status_changed':
        console.log('🔄 Application status changed:', webhookEvent.data)
        await handleApplicationStatusChanged(webhookEvent.data)
        break
        
      default:
        console.log('❓ Unknown job event type:', webhookEvent.event)
        return NextResponse.json(
          { error: `Unsupported event type: ${webhookEvent.event}` },
          { status: 400 }
        )
    }
    
    // Réponse de succès
    return NextResponse.json({
      success: true,
      message: `Event ${webhookEvent.event} processed successfully`,
      eventId: `evt_${Date.now()}`,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Error processing jobs webhook:', error)
    
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

// Fonctions de traitement des événements
async function handleJobCreated(data: any) {
  console.log('🎯 Processing job creation:', data.jobId)
  // Ici vous pouvez:
  // - Envoyer des notifications
  // - Mettre à jour la base de données
  // - Déclencher des processus AI
  // - Envoyer des emails
}

async function handleJobUpdated(data: any) {
  console.log('🎯 Processing job update:', data.jobId)
  // Ici vous pouvez:
  // - Reindexer pour la recherche
  // - Notifier les candidats abonnés
  // - Mettre à jour les caches
}

async function handleJobDeleted(data: any) {
  console.log('🎯 Processing job deletion:', data.jobId)
  // Ici vous pouvez:
  // - Nettoyer les données associées
  // - Notifier les parties prenantes
  // - Archiver les données
}

async function handleApplicationReceived(data: any) {
  console.log('🎯 Processing new application:', data.applicationId)
  // Ici vous pouvez:
  // - Analyser le CV avec l'AI
  // - Envoyer une notification à l'employeur
  // - Déclencher un workflow d'évaluation
}

async function handleApplicationStatusChanged(data: any) {
  console.log('🎯 Processing application status change:', data.applicationId, data.newStatus)
  // Ici vous pouvez:
  // - Notifier le candidat
  // - Mettre à jour les métriques
  // - Déclencher la suite du processus
}

export async function GET() {
  return NextResponse.json({
    message: 'Jobs webhook endpoint is active',
    supportedEvents: [
      'job.created',
      'job.updated', 
      'job.deleted',
      'application.received',
      'application.status_changed'
    ],
    timestamp: new Date().toISOString()
  })
}
