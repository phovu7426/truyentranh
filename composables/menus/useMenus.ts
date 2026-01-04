import { ref, computed } from 'vue'
import { useGlobalApiClient } from '@/composables/api'
import { adminEndpoints } from '@/api/endpoints'
import type { 
  MenuTreeItem,
  UserMenuParams
} from '@/types/menu'

export function useMenus() {
  const { apiClient } = useGlobalApiClient()
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Get menu tree (admin) - dùng để lấy parent menus trong form
  const getMenuTree = async (): Promise<MenuTreeItem[]> => {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.get<MenuTreeItem[]>(adminEndpoints.menus.tree)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Không thể lấy menu tree'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get user menus (filtered by permissions) - dùng trong navigation
  const getUserMenus = async (params?: UserMenuParams): Promise<MenuTreeItem[]> => {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.get<{ success: boolean; data: MenuTreeItem[] }>(adminEndpoints.userMenus.list, { params })
      // API trả về { success: true, data: [...] }
      if (response.data?.success && Array.isArray(response.data.data)) {
        return response.data.data
      }
      // Fallback nếu structure khác
      return Array.isArray(response.data) ? response.data : []
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Không thể lấy menu người dùng'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    getMenuTree,
    getUserMenus
  }
}
