import { ref, computed, type Ref, type ComputedRef } from 'vue'
import { useApiClient } from '@/composables/api/useApiClient'
import { adminEndpoints } from '@/api/endpoints'
import { useToast } from '@/composables/ui/useToast'
import { initializeUserGroups, getUserGroups, getSelectedGroup, type Group } from './useGroupUtils'

// Re-export Group type từ utils
export type { Group } from './useGroupUtils'

export interface SwitchGroupResponse {
  group: Group
  context: {
    id: number
    type: string
    name: string
  }
  message: string
}

export interface UseGroupResult {
  groups: Ref<Group[]>
  currentGroup: ComputedRef<Group | null>
  loading: Ref<boolean>
  error: Ref<string | null>
  fetchMyGroups: () => Promise<void>
  switchGroup: (groupId: number) => Promise<Group | null>
  setGroupId: (groupId: number | null) => void
  getGroupId: () => number | null
}

export function useGroup(): UseGroupResult {
  const { apiClient } = useApiClient()
  const { showSuccess, showError } = useToast()

  const groups = ref<Group[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Chỉ dùng localStorage để lưu group_id
  const getStoredGroupId = (): number | null => {
    if (process.client) {
      const storedGroupId = localStorage.getItem('selected_group_id')
      if (storedGroupId) {
        const groupIdNum = parseInt(storedGroupId, 10)
        if (!isNaN(groupIdNum)) {
          return groupIdNum
        }
      }
    }
    return null
  }

  // Current group computed
  const currentGroup = computed<Group | null>(() => {
    const groupId = getStoredGroupId()
    if (!groupId) return null
    return groups.value.find(g => g.id === groupId) || null
  })

  // Fetch my groups
  // API: GET /api/user/groups - Lấy tất cả groups user có thể truy cập
  // Sử dụng utility function initializeUserGroups() để đơn giản hóa
  const fetchMyGroups = async (): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      // Sử dụng utility function mới
      const fetchedGroups = await initializeUserGroups()
      groups.value = fetchedGroups
    } catch (err: any) {
      error.value = err.message || 'Không thể tải danh sách groups'
      groups.value = []
      
      // Fallback: Load từ localStorage nếu có
      if (process.client) {
        const cachedGroups = getUserGroups()
        if (cachedGroups.length > 0) {
          groups.value = cachedGroups
        }
      }
    } finally {
      loading.value = false
    }
  }

  // Switch group
  // Gọi API POST /api/user/contexts/switch để switch group
  // Chỉ lưu vào localStorage và cookie sau khi API thành công
  const switchGroup = async (groupId: number): Promise<Group | null> => {
    loading.value = true
    error.value = null

    try {
      // Tìm group trong danh sách
      const group = groups.value.find(g => g.id === groupId)
      
      if (!group) {
        error.value = 'Group không tồn tại'
        showError('Group không tồn tại')
        return null
      }
      
      // Chỉ lưu vào localStorage
      if (process.client) {
        localStorage.setItem('selected_group_id', String(groupId))
      }
      
      showSuccess('Đã chuyển group thành công')
      
      return group
    } catch (err: any) {
      error.value = err.message || 'Không thể chuyển group'
      showError('Không thể chuyển group')
      return null
    } finally {
      loading.value = false
    }
  }

  // Set group ID (without API call)
  const setGroupId = (groupId: number | null): void => {
    if (process.client && groupId) {
      localStorage.setItem('selected_group_id', String(groupId))
    } else if (process.client) {
      localStorage.removeItem('selected_group_id')
    }
  }

  // Get group ID
  const getGroupId = (): number | null => {
    return getStoredGroupId()
  }

  return {
    groups,
    currentGroup,
    loading,
    error,
    fetchMyGroups,
    switchGroup,
    setGroupId,
    getGroupId
  }
}

