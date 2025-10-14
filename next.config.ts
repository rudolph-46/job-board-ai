import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Activer uniquement useCache pour les directives "use cache"
    useCache: true,
  },
}

export default nextConfig
