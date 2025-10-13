import { createUploadthing, type FileRouter } from "uploadthing/next"
import { UploadThingError } from "uploadthing/server"
import { getCurrentUser } from "../clerk/lib/getCurrentAuth"
import { inngest } from "../inngest/client"
import { upsertUserResume } from "@/features/users/db/userResumes"
import { db } from "@/drizzle/db"
import { eq } from "drizzle-orm"
import { UserResumeTable, UserTable } from "@/drizzle/schema"
import { uploadthing } from "./client"
import { clerkClient } from "@clerk/nextjs/server"

const f = createUploadthing()

export const customFileRouter = {
  resumeUploader: f(
    {
      pdf: {
        maxFileSize: "8MB",
        maxFileCount: 1,
      },
    },
    { awaitServerData: true }
  )
    .middleware(async () => {
      try {
        const { userId } = await getCurrentUser()
        console.log("Middleware UploadThing - userId:", userId)
        
        if (userId == null) {
          console.error("Utilisateur non authentifié dans UploadThing")
          throw new UploadThingError("Unauthorized - Vous devez être connecté pour uploader un fichier")
        }

        return { userId }
      } catch (error) {
        console.error("Erreur middleware UploadThing:", error)
        throw new UploadThingError("Erreur d'authentification")
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        console.log("onUploadComplete appelé:", { metadata, file })
        const { userId } = metadata
        
        // Vérifier si l'utilisateur existe, sinon créer une entrée basique
        await ensureUserExists(userId)
        
        const resumeFileKey = await getUserResumeFileKey(userId)

        await upsertUserResume(userId, {
          resumeFileUrl: file.ufsUrl,
          resumeFileKey: file.key,
        })

        if (resumeFileKey != null) {
          await uploadthing.deleteFiles(resumeFileKey)
        }

        // Désactivé temporairement - Inngest pas configuré
        // await inngest.send({ name: "app/resume.uploaded", user: { id: userId } })

        return { message: "CV uploadé avec succès!" }
      } catch (error) {
        console.error("Erreur dans onUploadComplete:", error)
        throw error
      }
    }),
  
  // Version de test sans authentification
  testUploader: f({
    pdf: {
      maxFileSize: "8MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      console.log("Test uploader - pas d'authentification requise")
      return { test: true }
    })
    .onUploadComplete(async ({ file }) => {
      console.log("Test upload terminé:", file)
      return { message: "Test upload réussi!" }
    }),
} satisfies FileRouter

export type CustomFileRouter = typeof customFileRouter

async function getUserResumeFileKey(userId: string) {
  const data = await db.query.UserResumeTable.findFirst({
    where: eq(UserResumeTable.userId, userId),
    columns: {
      resumeFileKey: true,
    },
  })

  return data?.resumeFileKey
}

async function ensureUserExists(userId: string) {
  // Vérifier si l'utilisateur existe déjà
  const existingUser = await db.query.UserTable.findFirst({
    where: eq(UserTable.id, userId),
  })

  if (existingUser) {
    return existingUser
  }

  try {
    // Récupérer les informations de l'utilisateur depuis Clerk
    const client = await clerkClient()
    const clerkUser = await client.users.getUser(userId)
    
    // Créer l'utilisateur dans notre DB
    const [newUser] = await db.insert(UserTable).values({
      id: userId,
      name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Utilisateur',
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      imageUrl: clerkUser.imageUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    }).returning()

    console.log("Utilisateur créé automatiquement:", newUser)
    return newUser
  } catch (error) {
    console.error("Erreur lors de la création automatique de l'utilisateur:", error)
    
    // Si impossible de récupérer les données Clerk, créer un utilisateur basique
    const [newUser] = await db.insert(UserTable).values({
      id: userId,
      name: "Utilisateur",
      email: `${userId}@temp.clerk`,
      imageUrl: "https://img.clerk.com/default_avatar.png",
    }).returning()

    console.log("Utilisateur basique créé:", newUser)
    return newUser
  }
}
