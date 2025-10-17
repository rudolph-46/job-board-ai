import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Activer uniquement useCache pour les directives "use cache"
    useCache: true,
  },
  // Configuration du serveur
  serverRuntimeConfig: {},
  publicRuntimeConfig: {},
  // Désactiver ESLint en mode build pour éviter les erreurs de linting
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Désactiver TypeScript type checking en mode build pour accélérer
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
