import ReplaySDK from '@vinisadev/replay-sdk'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  
  if (process.client) {
    console.log('Initializing session replay plugin')
    console.log('API Base:', config.public.apiBase)
    
    try {
      const sdk = new ReplaySDK({
        websiteId: 'demo-site',
        apiEndpoint: config.public.apiBase || 'http://localhost:3000',
        debug: true // Enable debug logging
      })

      // Add to window for debugging
      if (typeof window !== 'undefined') {
        (window as any).__sessionReplay = sdk
      }

      console.log('Session replay SDK initialized successfully')
    } catch (error) {
      console.error('Failed to initialize session replay SDK:', error)
    }
  }
})
