// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL,
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api'
    }
  },
  modules: ['@nuxtjs/tailwindcss'],
  nitro: {
    routeRules: {
      '/api/**': {
        cors: true,
        headers: {
          'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
          'Access-Control-Allow-Origin': '*', // For development
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Headers': '*',
        }
      }
    }
  }
})