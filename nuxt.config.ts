// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false, // Disable Server-Side Rendering globally to resolve Cloudflare-to-Cloudflare fetch routing blocks
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE_URL || '',
      appUrl: process.env.NUXT_PUBLIC_APP_URL || '',
      assetsUrl: process.env.NUXT_PUBLIC_ASSETS_URL || '',
      winnersEndpoint: process.env.NUXT_PUBLIC_WINNERS_ENDPOINT || '',
    }
  }
})
