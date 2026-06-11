// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
      appUrl: process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000',
      assetsUrl: process.env.NUXT_PUBLIC_ASSETS_URL || '',
    }
  }
})
