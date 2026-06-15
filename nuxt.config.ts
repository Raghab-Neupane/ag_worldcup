// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false, // Disable Server-Side Rendering globally to resolve Cloudflare-to-Cloudflare fetch routing blocks
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
      appUrl: process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000',
      assetsUrl: process.env.NUXT_PUBLIC_ASSETS_URL || '',
      participants: process.env.NUXT_PUBLIC_PARTICIPANTS_URL || '',
      winnersEndpoint: process.env.NUXT_PUBLIC_WINNERS_ENDPOINT || 'http://api-adm.ambition.guru/worldcup-prediction/winners',
      calcServiceUrl: process.env.NUXT_PUBLIC_CALC_SERVICE_URL || '',
    }
  }
})
