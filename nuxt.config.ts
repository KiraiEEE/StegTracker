export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/skeuo-modern.css'],
  app: {
    head: {
      title: 'Electricity Crisis (ElecRisis-26) Outages Tracker',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
      ]
    }
  }
})
