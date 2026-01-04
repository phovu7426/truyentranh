<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Đổi mật khẩu</h1>
            <p class="mt-2 text-gray-600">Cập nhật mật khẩu tài khoản của bạn</p>
          </div>
          <NuxtLink
            to="/user/profile"
            class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Quay lại
          </NuxtLink>
        </div>
      </div>

      <!-- Security Notice -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div class="flex">
          <svg class="h-5 w-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
          </svg>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-blue-800">Lưu ý bảo mật</h3>
            <div class="mt-2 text-sm text-blue-700">
              <ul class="list-disc pl-5 space-y-1">
                <li>Mật khẩu phải có ít nhất 6 ký tự</li>
                <li>Nên sử dụng mật khẩu mạnh bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt</li>
                <li>Không chia sẻ mật khẩu với người khác</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Form -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <FormWrapper
          :default-values="formData"
          :rules="validationRules"
          :api-errors="apiErrors"
          :disable-submit="isLoading"
          submit-text="Đổi mật khẩu"
          submitting-text="Đang xử lý..."
          cancel-text="Hủy"
          @submit="handleSubmit"
          @cancel="handleCancel"
        >
          <template #default="{ form, errors, clearError }">
            <div class="space-y-6">
              <!-- Old Password -->
              <FormField
                v-model="form.oldPassword"
                name="oldPassword"
                type="password"
                label="Mật khẩu hiện tại"
                placeholder="Nhập mật khẩu hiện tại"
                :error="errors.oldPassword"
                :disabled="isLoading"
                required
                autocomplete="current-password"
                @update:model-value="clearError('oldPassword')"
              />

              <!-- New Password -->
              <FormField
                v-model="form.newPassword"
                name="newPassword"
                type="password"
                label="Mật khẩu mới"
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                :error="errors.newPassword"
                :disabled="isLoading"
                required
                autocomplete="new-password"
                @update:model-value="clearError('newPassword')"
              />

              <!-- Confirm New Password -->
              <FormField
                v-model="form.confirmPassword"
                name="confirmPassword"
                type="password"
                label="Xác nhận mật khẩu mới"
                placeholder="Nhập lại mật khẩu mới"
                :error="errors.confirmPassword"
                :disabled="isLoading"
                required
                autocomplete="new-password"
                @update:model-value="clearError('confirmPassword')"
              />

              <!-- Password Strength Indicator -->
              <div v-if="form.newPassword" class="space-y-2">
                <label class="text-sm font-medium text-gray-700">Độ mạnh mật khẩu:</label>
                <div class="flex items-center space-x-2">
                  <div class="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      class="h-2 rounded-full transition-all duration-300"
                      :class="passwordStrengthClass"
                      :style="{ width: passwordStrength + '%' }"
                    ></div>
                  </div>
                  <span class="text-sm font-medium" :class="passwordStrengthTextClass">
                    {{ passwordStrengthText }}
                  </span>
                </div>
              </div>

              <!-- Success Message -->
              <div v-if="successMessage" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                <div class="flex items-center">
                  <svg class="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                  </svg>
                  {{ successMessage }}
                </div>
              </div>

              <!-- Error Message -->
              <div v-if="generalError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <div class="flex items-center">
                  <svg class="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                  </svg>
                  {{ generalError }}
                </div>
              </div>
            </div>
          </template>
        </FormWrapper>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useApiClient } from '@/composables/api/useApiClient'
import { publicEndpoints } from '@/api/endpoints'
import FormWrapper from '@/components/Core/Form/FormWrapper.vue'
import FormField from '@/components/Core/Form/FormField.vue'
import { useSeo } from '@/composables/seo'

// Page meta
definePageMeta({
  layout: 'home',
  middleware: 'auth'
})

// SEO configuration
useSeo({
  title: 'Đổi mật khẩu',
  description: 'Cập nhật mật khẩu tài khoản của bạn',
  type: 'profile',
  noindex: true
})

const router = useRouter()
const { apiClient } = useApiClient()

// Form data
const formData = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Validation rules
const validationRules = {
  oldPassword: [
    { required: 'Mật khẩu hiện tại là bắt buộc' },
    { min: 6, minMessage: 'Mật khẩu phải có ít nhất 6 ký tự' }
  ],
  newPassword: [
    { required: 'Mật khẩu mới là bắt buộc' },
    { min: 6, minMessage: 'Mật khẩu mới phải có ít nhất 6 ký tự' }
  ],
  confirmPassword: [
    { required: 'Xác nhận mật khẩu là bắt buộc' },
    {
      custom: [
        (value, form) => value === form.newPassword,
        'Mật khẩu xác nhận không khớp'
      ]
    }
  ]
}

const apiErrors = ref({})
const generalError = ref('')
const successMessage = ref('')
const isLoading = ref(false)

// Password strength calculator
const passwordStrength = computed(() => {
  const password = formData.value.newPassword
  if (!password) return 0
  
  let strength = 0
  
  // Length
  if (password.length >= 6) strength += 20
  if (password.length >= 8) strength += 20
  if (password.length >= 12) strength += 10
  
  // Contains lowercase
  if (/[a-z]/.test(password)) strength += 15
  
  // Contains uppercase
  if (/[A-Z]/.test(password)) strength += 15
  
  // Contains numbers
  if (/[0-9]/.test(password)) strength += 10
  
  // Contains special characters
  if (/[^a-zA-Z0-9]/.test(password)) strength += 10
  
  return Math.min(strength, 100)
})

const passwordStrengthText = computed(() => {
  const strength = passwordStrength.value
  if (strength < 30) return 'Yếu'
  if (strength < 60) return 'Trung bình'
  if (strength < 80) return 'Mạnh'
  return 'Rất mạnh'
})

const passwordStrengthClass = computed(() => {
  const strength = passwordStrength.value
  if (strength < 30) return 'bg-red-500'
  if (strength < 60) return 'bg-yellow-500'
  if (strength < 80) return 'bg-blue-500'
  return 'bg-green-500'
})

const passwordStrengthTextClass = computed(() => {
  const strength = passwordStrength.value
  if (strength < 30) return 'text-red-600'
  if (strength < 60) return 'text-yellow-600'
  if (strength < 80) return 'text-blue-600'
  return 'text-green-600'
})

// Methods
const handleSubmit = async (form) => {
  if (isLoading.value) return
  
  isLoading.value = true
  generalError.value = ''
  successMessage.value = ''
  apiErrors.value = {}

  try {
    const response = await apiClient.patch(publicEndpoints.users.changePassword, {
      oldPassword: form.oldPassword,
      newPassword: form.newPassword
    })

    // API mới trả về null khi thành công
    if (response.status === 200) {
      successMessage.value = 'Đổi mật khẩu thành công!'
      
      // Reset form
      formData.value = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
      
      // Redirect sau 2 giây
      setTimeout(() => {
        router.push('/user/profile')
      }, 2000)
    } else {
      generalError.value = response.data?.message || 'Đổi mật khẩu thất bại'
    }
  } catch (err) {
    generalError.value = err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại'
  } finally {
    isLoading.value = false
  }
}

const handleCancel = () => {
  router.push('/user/profile')
}
</script>

<style scoped>
/* Add any custom styles here */
</style>