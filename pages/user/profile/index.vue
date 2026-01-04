<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Thông tin cá nhân</h1>
        <p class="mt-2 text-gray-600">Quản lý thông tin tài khoản của bạn</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-lg shadow-sm p-8">
        <div class="animate-pulse space-y-4">
          <div class="h-24 w-24 bg-gray-200 rounded-full mx-auto"></div>
          <div class="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
          <div class="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
      </div>

      <!-- Profile Content -->
      <div v-else-if="user" class="space-y-6">
        <!-- Profile Card -->
        <div class="bg-white rounded-lg shadow-sm overflow-hidden">
          <!-- Header with Avatar -->
          <div class="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-8">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div class="flex items-center gap-6 min-w-0">
              <div class="relative flex-shrink-0">
                <img
                  :src="user.profile?.image || '/default.svg'"
                  :alt="user.profile?.name || user.username"
                  class="h-24 w-24 rounded-full border-4 border-white shadow-lg object-cover"
                  @error="handleAvatarError"
                >
                <span 
                  v-if="user.status === 'active'"
                  class="absolute bottom-2 right-2 block h-4 w-4 rounded-full bg-green-400 border-2 border-white"
                ></span>
              </div>
              <div class="min-w-0">
                <h2 class="text-2xl font-bold text-white">{{ user.profile?.name || user.username }}</h2>
                <p class="text-blue-100">@{{ user.username }}</p>
                <div class="mt-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-blue-100">
                  <span class="flex items-center min-w-0">
                    <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                    </svg>
                    <span class="truncate">{{ user.email }}</span>
                  </span>
                  <span v-if="user.phone" class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
                    </svg>
                    {{ user.phone }}
                  </span>
                </div>
              </div>
              </div>
              <div class="flex flex-col space-y-2">
                <NuxtLink
                  to="/user/profile/edit"
                  class="inline-flex items-center justify-center px-4 py-2 border border-white text-sm font-medium rounded-md text-white hover:bg-white hover:text-blue-600 transition-colors w-full sm:w-auto"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                  </svg>
                  Chỉnh sửa
                </NuxtLink>
                <NuxtLink
                  to="/user/profile/change-password"
                  class="inline-flex items-center justify-center px-4 py-2 border border-white text-sm font-medium rounded-md text-white hover:bg-white hover:text-blue-600 transition-colors w-full sm:w-auto"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                  Đổi mật khẩu
                </NuxtLink>
              </div>
            </div>
          </div>

          <!-- Profile Details -->
          <div class="px-6 py-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Basic Info -->
              <div class="space-y-4">
                <h3 class="text-lg font-semibold text-gray-900 border-b pb-2">Thông tin cơ bản</h3>
                
                <div class="space-y-3">
                  <div>
                    <label class="text-sm font-medium text-gray-500">Họ và tên</label>
                    <p class="mt-1 text-gray-900">{{ user.profile?.name || 'Chưa cập nhật' }}</p>
                  </div>

                  <div>
                    <label class="text-sm font-medium text-gray-500">Email</label>
                    <div class="mt-1 flex items-center">
                      <p class="text-gray-900">{{ user.email }}</p>
                      <span
                        v-if="user.email_verified_at"
                        class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"
                      >
                        <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                        </svg>
                        Đã xác thực
                      </span>
                    </div>
                  </div>

                  <div>
                    <label class="text-sm font-medium text-gray-500">Số điện thoại</label>
                    <div class="mt-1 flex items-center">
                      <p class="text-gray-900">{{ user.phone || 'Chưa cập nhật' }}</p>
                      <span
                        v-if="user.phone_verified_at && user.phone"
                        class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"
                      >
                        <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                        </svg>
                        Đã xác thực
                      </span>
                    </div>
                  </div>

                  <div>
                    <label class="text-sm font-medium text-gray-500">Giới tính</label>
                    <p class="mt-1 text-gray-900">
                      {{ user.profile?.gender === 'male' ? 'Nam' : user.profile?.gender === 'female' ? 'Nữ' : user.profile?.gender === 'other' ? 'Khác' : 'Chưa cập nhật' }}
                    </p>
                  </div>

                  <div>
                    <label class="text-sm font-medium text-gray-500">Ngày sinh</label>
                    <p class="mt-1 text-gray-900">{{ formatDate(user.profile?.birthday) || 'Chưa cập nhật' }}</p>
                  </div>
                </div>
              </div>

              <!-- Additional Info -->
              <div class="space-y-4">
                <h3 class="text-lg font-semibold text-gray-900 border-b pb-2">Thông tin bổ sung</h3>
                
                <div class="space-y-3">
                  <div>
                    <label class="text-sm font-medium text-gray-500">Địa chỉ</label>
                    <p class="mt-1 text-gray-900">{{ user.profile?.address || 'Chưa cập nhật' }}</p>
                  </div>

                  <div>
                    <label class="text-sm font-medium text-gray-500">Giới thiệu</label>
                    <p class="mt-1 text-gray-900">{{ user.profile?.about || 'Chưa cập nhật' }}</p>
                  </div>

                  <div>
                    <label class="text-sm font-medium text-gray-500">Trạng thái</label>
                    <span 
                      class="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                    >
                      {{ user.status === 'active' ? 'Đang hoạt động' : 'Không hoạt động' }}
                    </span>
                  </div>

                  <div>
                    <label class="text-sm font-medium text-gray-500">Đăng nhập lần cuối</label>
                    <p class="mt-1 text-gray-900">{{ formatDateTime(user.last_login_at) || 'Chưa có' }}</p>
                  </div>

                  <div>
                    <label class="text-sm font-medium text-gray-500">Ngày tạo tài khoản</label>
                    <p class="mt-1 text-gray-900">{{ formatDateTime(user.created_at) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
        <div class="flex">
          <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
          </svg>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Không thể tải thông tin</h3>
            <p class="mt-2 text-sm text-red-700">{{ error }}</p>
            <button 
              @click="loadUser"
              class="mt-3 text-sm font-medium text-red-800 hover:text-red-600"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useApiClient } from '@/composables/api/useApiClient'
import { publicEndpoints } from '@/api/endpoints'
import { useSeo } from '@/composables/seo'

// Page meta
definePageMeta({
  layout: 'home',
  middleware: 'auth'
})

// SEO configuration
useSeo({
  title: 'Thông tin cá nhân',
  description: 'Quản lý thông tin tài khoản của bạn',
  type: 'profile',
  noindex: true
})

const { apiClient } = useApiClient()

// State
const user = ref(null)
const loading = ref(false)
const error = ref(null)

// Methods
const loadUser = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await apiClient.get(publicEndpoints.users.me)
    if (response.data.success) {
      user.value = response.data.data
    } else {
      error.value = response.data.message || 'Không thể tải thông tin'
    }
  } catch (err) {
    error.value = 'Có lỗi xảy ra khi tải thông tin'
  } finally {
    loading.value = false
  }
}

const handleAvatarError = (event) => {
  event.target.src = '/default.svg'
}

const formatDate = (dateString) => {
  if (!dateString) return null
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN')
}

const formatDateTime = (dateString) => {
  if (!dateString) return null
  const date = new Date(dateString)
  return date.toLocaleString('vi-VN')
}

onMounted(() => {
  loadUser()
})
</script>

<style scoped>
/* Add any custom styles here */
</style>