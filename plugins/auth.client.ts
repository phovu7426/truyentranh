// plugins/auth.client.ts
export default defineNuxtPlugin((nuxtApp) => {
  // Client-only plugin (due to .client.ts suffix)
  // Chờ cho tới khi app đã mount xong mới gọi store
  nuxtApp.hooks.hook('app:mounted', async () => {
    try {
      const authStore = useAuthStore()
      await authStore.checkAuth()
    } catch (error) {
      // Ignore auth errors during initialization
    }
  })
})
