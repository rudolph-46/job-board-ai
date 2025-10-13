import { headers } from "next/headers"
import { getCurrentUser } from "@/services/clerk/lib/getCurrentAuth"
import { env } from "@/data/env/server"

export default async function DiagnosticPage() {
  const headersList = await headers()
  const userAgent = headersList.get("user-agent")
  
  let userInfo = null
  try {
    const { userId } = await getCurrentUser()
    userInfo = { userId, isAuthenticated: !!userId }
  } catch (error) {
    userInfo = { error: error instanceof Error ? error.message : "Erreur inconnue" }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Diagnostic UploadThing</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="p-4 border rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Configuration Server</h2>
          <div className="space-y-2 text-sm">
            <p><strong>SERVER_URL:</strong> {env.SERVER_URL}</p>
            <p><strong>UploadThing Token:</strong> {env.UPLOADTHING_TOKEN ? "✅ Configuré" : "❌ Manquant"}</p>
            <p><strong>Node ENV:</strong> {process.env.NODE_ENV}</p>
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Authentification</h2>
          <div className="space-y-2 text-sm">
            {userInfo.error ? (
              <p className="text-red-600">❌ Erreur: {userInfo.error}</p>
            ) : (
              <>
                <p><strong>User ID:</strong> {userInfo.userId || "Non connecté"}</p>
                <p><strong>Authentifié:</strong> {userInfo.isAuthenticated ? "✅ Oui" : "❌ Non"}</p>
              </>
            )}
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Navigation</h2>
          <div className="space-y-2 text-sm">
            <p><strong>User Agent:</strong> {userAgent?.substring(0, 50)}...</p>
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Tests disponibles</h2>
          <div className="space-y-2">
            <a href="/test-upload" className="block text-blue-600 hover:underline">
              → Page de test upload
            </a>
            <a href="/api/uploadthing" className="block text-blue-600 hover:underline">
              → API UploadThing (JSON)
            </a>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 border rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Instructions de test</h2>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Vérifiez que vous êtes connecté (si "Authentifié" = Non, allez sur /sign-in)</li>
          <li>Accédez à la page de test upload: <code>/test-upload</code></li>
          <li>Essayez d&apos;upload avec le testUploader (sans auth) d&apos;abord</li>
          <li>Si ça marche, essayez le resumeUploader (avec auth)</li>
          <li>Vérifiez la console du navigateur pour les logs détaillés</li>
        </ol>
      </div>
    </div>
  )
}
