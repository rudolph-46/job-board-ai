import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    console.log('👤 User webhook POST request received')
    
    // Récupérer les headers
    const headersList = await headers()
    const contentType = headersList.get('content-type')
    const clerkSignature = headersList.get('svix-signature')
    
    console.log('📋 User Webhook Headers:', {
      contentType,
      hasClerkSignature: !!clerkSignature
    })
    
    // Récupérer le body
    const event = await request.json()
    
    console.log('📦 User Webhook Event:', {
      type: event.type,
      userId: event.data?.id,
      timestamp: event.timestamp
    })
    
    // Traitement des événements Clerk
    switch (event.type) {
      case 'user.created':
        console.log('🎉 New user registered:', event.data.id)
        await handleUserCreated(event.data)
        break
        
      case 'user.updated':
        console.log('📝 User profile updated:', event.data.id)
        await handleUserUpdated(event.data)
        break
        
      case 'user.deleted':
        console.log('👋 User deleted:', event.data.id)
        await handleUserDeleted(event.data)
        break
        
      case 'session.created':
        console.log('🔐 User logged in:', event.data.user_id)
        await handleUserLogin(event.data)
        break
        
      case 'session.ended':
        console.log('🚪 User logged out:', event.data.user_id)
        await handleUserLogout(event.data)
        break
        
      default:
        console.log('❓ Unknown user event:', event.type)
    }
    
    return NextResponse.json({
      success: true,
      message: `User event ${event.type} processed`,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Error processing user webhook:', error)
    
    return NextResponse.json(
      { error: 'Failed to process user webhook' },
      { status: 500 }
    )
  }
}

async function handleUserCreated(userData: any) {
  console.log('🎯 Processing new user registration')
  // Ici vous pouvez:
  // - Créer un profil utilisateur dans votre DB
  // - Envoyer un email de bienvenue
  // - Initialiser les préférences
  // - Déclencher un onboarding
}

async function handleUserUpdated(userData: any) {
  console.log('🎯 Processing user profile update')
  // Ici vous pouvez:
  // - Synchroniser avec votre DB
  // - Mettre à jour les index de recherche
  // - Notifier les changements importants
}

async function handleUserDeleted(userData: any) {
  console.log('🎯 Processing user deletion')
  // Ici vous pouvez:
  // - Nettoyer les données utilisateur
  // - Supprimer les applications
  // - Archiver les informations nécessaires
}

async function handleUserLogin(sessionData: any) {
  console.log('🎯 Processing user login')
  // Ici vous pouvez:
  // - Logger l'activité
  // - Mettre à jour le "last seen"
  // - Déclencher des notifications personnalisées
}

async function handleUserLogout(sessionData: any) {
  console.log('🎯 Processing user logout')
  // Ici vous pouvez:
  // - Logger la fin de session
  // - Nettoyer les sessions temporaires
  // - Sauvegarder l'état de l'utilisateur
}
