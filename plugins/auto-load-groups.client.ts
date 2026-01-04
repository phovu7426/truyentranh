/**
 * Plugin tự động load groups TRƯỚC KHI các API khác được gọi
 * Flow mới (đơn giản): GET /api/user/groups → Auto-select group → Các API khác
 * Chạy sớm nhất có thể để đảm bảo có group_id trước khi các component mount
 */
export default defineNuxtPlugin({
  name: 'auto-load-groups',
  enforce: 'pre', // Chạy trước các plugin khác
  async setup(nuxtApp) {
    // Chỉ chạy trên client
    if (import.meta.server) return

    // Chờ app mounted và auth đã được check
    nuxtApp.hooks.hook('app:mounted', async () => {
      // Đợi auth plugin chạy xong
      await new Promise(resolve => setTimeout(resolve, 200))
      
      try {
        // Chỉ chạy nếu user đã đăng nhập
        const { useAuthStore } = await import('@/stores/auth')
        const authStore = useAuthStore()
        if (!authStore.isAuthenticated) {
          console.log('[AutoLoadGroups] User chưa đăng nhập, bỏ qua')
          return
        }

        // Kiểm tra xem đã có groups trong localStorage chưa
        const storedGroupId = localStorage.getItem('selected_group_id')
        if (storedGroupId) {
          console.log('[AutoLoadGroups] Đã có group_id trong localStorage:', storedGroupId)
          return
        }

        console.log('[AutoLoadGroups] Bắt đầu flow mới: GET /api/user/groups → Auto-select')

        // Flow mới: Chỉ cần gọi GET /api/user/groups
        const { initializeUserGroups } = await import('@/composables/group/useGroupUtils')
        const groups = await initializeUserGroups()

        if (groups.length > 0) {
          const selectedGroupId = localStorage.getItem('selected_group_id')
          console.log('[AutoLoadGroups] ✅ Đã load', groups.length, 'groups')
          console.log('[AutoLoadGroups] ✅ Group ID đã chọn:', selectedGroupId)
          console.log('[AutoLoadGroups] ✅ Từ bây giờ, các API khác có thể sử dụng X-Group-Id header')
        } else {
          console.warn('[AutoLoadGroups] ⚠️ Không có groups nào được trả về')
        }
      } catch (err) {
        console.error('[AutoLoadGroups] ❌ Lỗi khi load groups:', err)
        // Không throw error để không block app
      }
    })
  }
})

