import { useGlobalSystemConfig } from '~/composables/system-config'

export default defineNuxtRouteMiddleware(async (to) => {
  // Chỉ chạy trên client side
  if (import.meta.client) {
    try {
      const { systemInfo, loading, error } = useGlobalSystemConfig()
      
      // Nếu đang loading, đợi một chút
      if (loading.value) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      // Nếu có lỗi khi load system config, không block navigation
    } catch (err) {
      // Không throw error để không block navigation
    }
  }
})

