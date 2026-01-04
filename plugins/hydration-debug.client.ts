// Plugin để bật log chi tiết cho hydration warnings
export default defineNuxtPlugin((nuxtApp) => {
  if (process.dev) {
    // Bật hydration warnings chi tiết trong development
    nuxtApp.vueApp.config.warnHandler = (msg, instance, trace) => {
      // Log tất cả hydration warnings
      if (msg.includes('Hydration') || msg.includes('hydration') || msg.includes('mismatch')) {
        console.group('🔴 Hydration Warning')
        console.error('Message:', msg)
        console.error('Component:', instance?.$?.type?.__name || instance?.$?.type?.name || 'Unknown')
        console.error('Trace:', trace)
        console.groupEnd()
      } else {
        // Log warnings khác bình thường
        console.warn(msg, trace)
      }
    }

    // Log khi hydration hoàn thành
    // nuxtApp.hooks.hook('app:mounted', () => {
    //   console.log('✅ App mounted - Hydration completed')
    // })

    // Log errors
    nuxtApp.vueApp.config.errorHandler = (err, instance, info) => {
      if (err.message?.includes('Hydration') || err.message?.includes('hydration')) {
        console.group('🔴 Hydration Error')
        console.error('Error:', err)
        console.error('Component:', instance?.$?.type?.__name || instance?.$?.type?.name || 'Unknown')
        console.error('Info:', info)
        console.groupEnd()
      } else {
        console.error('Error:', err, info)
      }
    }
  }
})
