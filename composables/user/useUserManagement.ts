import { ref, type Ref } from 'vue'
import { useApiClient } from '@/composables/api/useApiClient'
import { publicEndpoints } from '@/api/endpoints'
import { useToast } from '@/composables/ui/useToast'
import { useAuthStore } from '@/stores/auth'

// ===== TYPES =====

export interface UserProfile {
  id: number
  username: string
  email: string
  phone?: string
  status: string
  email_verified_at?: string | null
  phone_verified_at?: string | null
  last_login_at?: string | null
  created_at: string
  updated_at: string
  profile?: {
    id: number
    user_id: number
    name?: string
    image?: string
    birthday?: string
    gender?: string
    address?: string
    about?: string
    created_at: string
    updated_at: string
  }
}

export interface UpdateProfileData {
  name?: string
  phone?: string
  image?: string
  birthday?: string
  gender?: string
  address?: string
  about?: string
}

export interface ChangePasswordData {
  oldPassword: string
  newPassword: string
}

export interface UserManagementResult {
  success: boolean
  message?: string
  errors?: Record<string, string[]>
  data?: any
}

// ===== COMPOSABLE =====

export function useUserManagement() {
  const { apiClient } = useApiClient()
  const { showSuccess, showError } = useToast()
  const authStore = useAuthStore()

  const loading: Ref<boolean> = ref(false)
  const user: Ref<UserProfile | null> = ref(null)

  // Lấy thông tin user hiện tại
  const getCurrentUser = async (): Promise<UserProfile | null> => {
    try {
      loading.value = true
      const response = await apiClient.get(publicEndpoints.users.me)

      if (response.data.success && response.data.data) {
        user.value = response.data.data
        return response.data.data
      } else {
        showError(response.data.message || 'Không thể lấy thông tin user')
        return null
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Không thể lấy thông tin user'
      showError(errorMessage)
      return null
    } finally {
      loading.value = false
    }
  }

  // Cập nhật thông tin user
  const updateProfile = async (data: UpdateProfileData): Promise<UserManagementResult> => {
    try {
      loading.value = true
      const response = await apiClient.patch(publicEndpoints.users.updateProfile, data)

      if (response.data.success) {
        // Cập nhật user trong store
        if (response.data.data) {
          user.value = response.data.data
          // Cập nhật auth store
          authStore.user = response.data.data
          // Refresh user info trong store
          await authStore.refreshUserInfo()
        }

        showSuccess(response.data.message || 'Cập nhật thông tin thành công')
        return {
          success: true,
          message: response.data.message || 'Cập nhật thông tin thành công',
          data: response.data.data
        }
      } else {
        const errorMessage = response.data.message || 'Cập nhật thông tin thất bại'
        showError(errorMessage)
        return {
          success: false,
          message: errorMessage,
          errors: response.data.errors
        }
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại'
      showError(errorMessage)
      return {
        success: false,
        message: errorMessage,
        errors: error.response?.data?.errors
      }
    } finally {
      loading.value = false
    }
  }

  // Đổi mật khẩu
  const changePassword = async (data: ChangePasswordData): Promise<UserManagementResult> => {
    try {
      loading.value = true
      const response = await apiClient.patch(publicEndpoints.users.changePassword, data)

      if (response.data.success) {
        showSuccess(response.data.message || 'Đổi mật khẩu thành công')
        return {
          success: true,
          message: response.data.message || 'Đổi mật khẩu thành công'
        }
      } else {
        const errorMessage = response.data.message || 'Đổi mật khẩu thất bại'
        showError(errorMessage)
        return {
          success: false,
          message: errorMessage,
          errors: response.data.errors
        }
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại'
      showError(errorMessage)
      return {
        success: false,
        message: errorMessage,
        errors: error.response?.data?.errors
      }
    } finally {
      loading.value = false
    }
  }

  // Đăng xuất
  const logout = async (): Promise<void> => {
    try {
      loading.value = true
      await apiClient.post(publicEndpoints.auth.logout)
    } catch (error) {
      // Ignore logout errors, vẫn tiếp tục xóa state
      console.error('Logout error:', error)
    } finally {
      // Xóa state trong auth store
      await authStore.logout()
      loading.value = false
    }
  }

  return {
    loading,
    user,
    getCurrentUser,
    updateProfile,
    changePassword,
    logout
  }
}

