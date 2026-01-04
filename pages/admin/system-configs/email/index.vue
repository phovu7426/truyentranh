<template>
  <div class="container mx-auto p-4">
    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center items-center min-h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Lỗi tải dữ liệu</h3>
          <div class="mt-2 text-sm text-red-700">{{ error }}</div>
          <div class="mt-4">
            <button @click="loadConfig" class="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200">
              Thử lại
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Main content -->
    <div v-else>
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold">Cấu hình Email</h1>
          <p class="text-gray-600 mt-1">Cấu hình SMTP để gửi email từ hệ thống</p>
        </div>
        <div class="flex space-x-2">
          <button 
            @click="saveConfig" 
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
            :disabled="saving"
          >
            {{ saving ? 'Đang lưu...' : 'Lưu cấu hình' }}
          </button>
        </div>
      </div>

      <!-- Form cấu hình email -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <form @submit.prevent="saveConfig" class="space-y-6">
          <!-- SMTP Host -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="md:col-span-1">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                SMTP Host <span class="text-red-500">*</span>
              </label>
              <p class="text-sm text-gray-500">Địa chỉ máy chủ SMTP</p>
            </div>
            <div class="md:col-span-2">
              <input
                v-model="formData.smtp_host"
                type="text"
                maxlength="255"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                :class="{ 'border-red-500': apiErrors?.smtp_host }"
                placeholder="smtp.gmail.com"
              />
              <div v-if="apiErrors?.smtp_host" class="mt-1 text-sm text-red-600">
                {{ apiErrors.smtp_host }}
              </div>
            </div>
          </div>

          <!-- SMTP Port -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="md:col-span-1">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                SMTP Port <span class="text-red-500">*</span>
              </label>
              <p class="text-sm text-gray-500">Cổng kết nối SMTP (thường là 587 hoặc 465)</p>
            </div>
            <div class="md:col-span-2">
              <input
                v-model.number="formData.smtp_port"
                type="number"
                min="1"
                max="65535"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                :class="{ 'border-red-500': apiErrors?.smtp_port }"
                placeholder="587"
              />
              <div v-if="apiErrors?.smtp_port" class="mt-1 text-sm text-red-600">
                {{ apiErrors.smtp_port }}
              </div>
            </div>
          </div>

          <!-- SMTP Secure -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="md:col-span-1">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                SSL/TLS
              </label>
              <p class="text-sm text-gray-500">Bật SSL/TLS cho kết nối SMTP</p>
            </div>
            <div class="md:col-span-2">
              <label class="flex items-center">
                <input
                  v-model="formData.smtp_secure"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span class="ml-2 text-sm text-gray-700">Sử dụng SSL/TLS</span>
              </label>
              <div v-if="apiErrors?.smtp_secure" class="mt-1 text-sm text-red-600">
                {{ apiErrors.smtp_secure }}
              </div>
            </div>
          </div>

          <!-- SMTP Username -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="md:col-span-1">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                SMTP Username <span class="text-red-500">*</span>
              </label>
              <p class="text-sm text-gray-500">Tên đăng nhập SMTP (thường là email)</p>
            </div>
            <div class="md:col-span-2">
              <input
                v-model="formData.smtp_username"
                type="text"
                maxlength="255"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                :class="{ 'border-red-500': apiErrors?.smtp_username }"
                placeholder="your-email@gmail.com"
              />
              <div v-if="apiErrors?.smtp_username" class="mt-1 text-sm text-red-600">
                {{ apiErrors.smtp_username }}
              </div>
            </div>
          </div>

          <!-- SMTP Password -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="md:col-span-1">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                SMTP Password
              </label>
              <p class="text-sm text-gray-500">Mật khẩu SMTP (để trống nếu không muốn đổi)</p>
            </div>
            <div class="md:col-span-2">
              <div class="flex items-center mb-2">
                <input
                  v-model="changePassword"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span class="ml-2 text-sm text-gray-700">Đổi mật khẩu</span>
              </div>
              <input
                v-model="formData.smtp_password"
                type="password"
                :disabled="!changePassword"
                minlength="6"
                maxlength="500"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                :class="{ 'border-red-500': apiErrors?.smtp_password }"
                placeholder="••••••••"
              />
              <div v-if="apiErrors?.smtp_password" class="mt-1 text-sm text-red-600">
                {{ apiErrors.smtp_password }}
              </div>
              <p v-if="!changePassword && hasPassword" class="mt-1 text-sm text-gray-500">
                Mật khẩu hiện tại đang được giữ nguyên
              </p>
            </div>
          </div>

          <!-- From Email -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="md:col-span-1">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Email gửi đi <span class="text-red-500">*</span>
              </label>
              <p class="text-sm text-gray-500">Email sẽ hiển thị là người gửi</p>
            </div>
            <div class="md:col-span-2">
              <input
                v-model="formData.from_email"
                type="email"
                maxlength="255"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                :class="{ 'border-red-500': apiErrors?.from_email }"
                placeholder="noreply@example.com"
              />
              <div v-if="apiErrors?.from_email" class="mt-1 text-sm text-red-600">
                {{ apiErrors.from_email }}
              </div>
            </div>
          </div>

          <!-- From Name -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="md:col-span-1">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Tên người gửi <span class="text-red-500">*</span>
              </label>
              <p class="text-sm text-gray-500">Tên hiển thị trong email</p>
            </div>
            <div class="md:col-span-2">
              <input
                v-model="formData.from_name"
                type="text"
                maxlength="255"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                :class="{ 'border-red-500': apiErrors?.from_name }"
                placeholder="My Website"
              />
              <div v-if="apiErrors?.from_name" class="mt-1 text-sm text-red-600">
                {{ apiErrors.from_name }}
              </div>
            </div>
          </div>

          <!-- Reply To Email -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="md:col-span-1">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Email Reply To
              </label>
              <p class="text-sm text-gray-500">Email nhận reply (để trống nếu không cần)</p>
            </div>
            <div class="md:col-span-2">
              <input
                v-model="formData.reply_to_email"
                type="email"
                maxlength="255"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                :class="{ 'border-red-500': apiErrors?.reply_to_email }"
                placeholder="contact@example.com"
              />
              <div v-if="apiErrors?.reply_to_email" class="mt-1 text-sm text-red-600">
                {{ apiErrors.reply_to_email }}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin-layout',
  requiresAuth: true,
  requiresAdmin: true
})

import { ref, onMounted, computed } from 'vue'
import { useToast } from '@/composables/ui/useToast'
import { useGlobalApiClient } from '@/composables/api'
import { adminEndpoints } from '@/api/endpoints'

const { showSuccess, showError } = useToast()
const { apiClient } = useGlobalApiClient()

// Reactive data
const loading = ref(false)
const saving = ref(false)
const error = ref(null)
const apiErrors = ref(null)
const changePassword = ref(false)
const hasPassword = ref(false)

// Form data
const formData = ref({
  smtp_host: '',
  smtp_port: 587,
  smtp_secure: true,
  smtp_username: '',
  smtp_password: '',
  from_email: '',
  from_name: '',
  reply_to_email: ''
})

// Load config
const loadConfig = async () => {
  loading.value = true
  error.value = null
  apiErrors.value = null
  
  try {
    const response = await apiClient.get(adminEndpoints.systemConfigs.email.get)
    
    if (response.data) {
      // Map data từ API response - dữ liệu thực tế nằm trong response.data.data
      const data = response.data.data || response.data
      formData.value = {
        smtp_host: data.smtp_host || '',
        smtp_port: data.smtp_port || 587,
        smtp_secure: data.smtp_secure !== undefined ? data.smtp_secure : true,
        smtp_username: data.smtp_username || '',
        smtp_password: '', // Không lưu password từ API (luôn là "******")
        from_email: data.from_email || '',
        from_name: data.from_name || '',
        reply_to_email: data.reply_to_email || ''
      }
      
      // Kiểm tra xem có password không (nếu API trả về "******" thì có password)
      hasPassword.value = data.smtp_password === '******' || !!data.smtp_password
    }
  } catch (err) {
    error.value = err.message || 'Không thể tải cấu hình'
    console.error('Error loading config:', err)
  } finally {
    loading.value = false
  }
}

// Save config
const saveConfig = async () => {
  saving.value = true
  apiErrors.value = null
  
  try {
    // Chuẩn bị data để gửi
    const updateData = { ...formData.value }
    
    // Nếu không muốn đổi password, không gửi trường smtp_password
    if (!changePassword.value || !updateData.smtp_password) {
      delete updateData.smtp_password
    }
    
    const response = await apiClient.put(adminEndpoints.systemConfigs.email.update, updateData)
    
    if (response.data) {
      showSuccess('Cấu hình email đã được cập nhật thành công')
      
      // Reset password field và checkbox
      formData.value.smtp_password = ''
      changePassword.value = false
      
      // Reload config để có dữ liệu mới nhất
      await loadConfig()
    } else {
      throw new Error('Không thể cập nhật cấu hình')
    }
  } catch (err) {
    if (err.response?.data?.errors) {
      apiErrors.value = err.response.data.errors
    } else {
      apiErrors.value = { general: err.message || 'Không thể cập nhật cấu hình' }
    }
    showError('Không thể cập nhật cấu hình email')
    console.error('Error saving config:', err)
  } finally {
    saving.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadConfig()
})
</script>
