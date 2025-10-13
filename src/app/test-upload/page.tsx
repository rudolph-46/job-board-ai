"use client"

import { UploadDropzone } from "@/services/uploadthing/components/UploadThing"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function TestUploadPage() {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadResults, setUploadResults] = useState<any[]>([])

  const clearResults = () => {
    setUploadResults([])
    setError(null)
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Test Upload - Diagnostic</h1>
        <Button onClick={clearResults} variant="outline">
          Effacer les résultats
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Status</h2>
            <p>Upload en cours: {isUploading ? "✅ Oui" : "❌ Non"}</p>
            <p>Fichiers uploadés: {uploadResults.length}</p>
            {error && (
              <p className="text-red-600 mt-2 p-2 bg-red-50 rounded">❌ Erreur: {error}</p>
            )}
            {uploadResults.length > 0 && (
              <p className="text-green-600 mt-2 p-2 bg-green-50 rounded">✅ Derniers uploads réussis</p>
            )}
          </div>

          <div className="p-4 border rounded-lg">
            <h2 className="text-lg font-semibold mb-4">🧪 Upload Test (Sans authentification)</h2>
            <UploadDropzone
              endpoint="testUploader"
              onUploadBegin={() => {
                console.log("Upload test commencé")
                setIsUploading(true)
                setError(null)
              }}
              onClientUploadComplete={(res) => {
                console.log("Upload test terminé:", res)
                setUploadResults(prev => [...prev, { type: 'test', result: res, timestamp: new Date() }])
                setIsUploading(false)
              }}
              onUploadError={(error) => {
                console.error("Erreur upload test:", error)
                setError(`Test: ${error.message}`)
                setIsUploading(false)
              }}
            />
          </div>
          
          <div className="p-4 border rounded-lg">
            <h2 className="text-lg font-semibold mb-4">👤 Upload Normal (Avec authentification)</h2>
            <UploadDropzone
              endpoint="resumeUploader"
              onUploadBegin={() => {
                console.log("Upload normal commencé")
                setIsUploading(true)
                setError(null)
              }}
              onClientUploadComplete={(res) => {
                console.log("Upload normal terminé:", res)
                setUploadResults(prev => [...prev, { type: 'normal', result: res, timestamp: new Date() }])
                setIsUploading(false)
              }}
              onUploadError={(error) => {
                console.error("Erreur upload normal:", error)
                setError(`Normal: ${error.message}`)
                setIsUploading(false)
              }}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <h2 className="text-lg font-semibold mb-2">📋 Configuration</h2>
            <div className="space-y-1 text-sm">
              <p><strong>Endpoints:</strong> resumeUploader, testUploader</p>
              <p><strong>Max file size:</strong> 8MB</p>
              <p><strong>File types:</strong> PDF</p>
              <p><strong>Server:</strong> http://localhost:3000</p>
              <p><strong>UploadThing Region:</strong> sea1</p>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <h2 className="text-lg font-semibold mb-2">📄 Résultats des uploads</h2>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {uploadResults.length === 0 ? (
                <p className="text-gray-500 italic">Aucun upload effectué</p>
              ) : (
                uploadResults.map((upload, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium">
                        {upload.type === 'test' ? '🧪 Test' : '👤 Normal'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {upload.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    {upload.result.map((file: any, fileIndex: number) => (
                      <div key={fileIndex} className="text-xs space-y-1">
                        <p><strong>Fichier:</strong> {file.name}</p>
                        <p><strong>Taille:</strong> {(file.size / 1024).toFixed(1)} KB</p>
                        <p><strong>Key:</strong> {file.key.substring(0, 20)}...</p>
                        <p><strong>URL:</strong> ✅ Disponible</p>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
