<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Chỉnh sửa thông tin</h1>
            <p class="mt-2 text-gray-600">Cập nhật thông tin cá nhân của bạn</p>
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

      <!-- Form -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <FormWrapper
          :default-values="formData"
          :rules="validationRules"
          :api-errors="apiErrors"
          :disable-submit="isLoading"
          submit-text="Lưu thay đổi"
          submitting-text="Đang lưu..."
          cancel-text="Hủy"
          @submit="handleSubmit"
          @cancel="handleCancel"
        >
          <template #default="{ form, errors, clearError }">
            <div class="space-y-6">
              <!-- Avatar Upload -->
              <div class="flex items-center space-x-6">
                <div class="flex-1">
                  <ImageUploader
                    v-model="form.image"
                    :default-url="form.image"
                    label="URL ảnh đại diện"
                    :max-size="5 * 1024 * 1024"
                    @uploaded="handleImageUploaded"
                    @error="handleImageError"
                  />
                  <p class="mt-2 text-sm text-gray-500">
                    Tải lên ảnh đại diện của bạn (tối đa 5MB)
                  </p>
                </div>
              </div>

              <!-- Name -->
              <FormField
                v-model="form.name"
                name="name"
                type="text"
                label="Họ và tên"
                placeholder="Nhập họ và tên của bạn"
                :error="errors.name"
                :disabled="isLoading"
                @update:model-value="clearError('name')"
              />

              <!-- Phone -->
              <FormField
                v-model="form.phone"
                name="phone"
                type="tel"
                label="Số điện thoại"
                placeholder="Nhập số điện thoại"
                :error="errors.phone"
                :disabled="isLoading"
                @update:model-value="clearError('phone')"
              />

              <!-- Birthday -->
              <FormField
                v-model="form.birthday"
                name="birthday"
                type="date"
                label="Ngày sinh"
                placeholder="YYYY-MM-DD"
                :error="errors.birthday"
                :disabled="isLoading"
                @update:model-value="clearError('birthday')"
              />

              <!-- Gender -->
              <SingleSelectEnhanced
                v-model="form.gender"
                name="gender"
                label="Giới tính"
                placeholder="Chọn giới tính"
                :error="errors.gender"
                :disabled="isLoading"
                :options="genderOptions"
                @update:model-value="clearError('gender')"
              />

              <!-- Address -->
              <FormField
                v-model="form.address"
                name="address"
                type="text"
                label="Địa chỉ"
                placeholder="Nhập địa chỉ của bạn"
                :error="errors.address"
                :disabled="isLoading"
                @update:model-value="clearError('address')"
              />

              <!-- About -->
              <FormField
                v-model="form.about"
                name="about"
                type="textarea"
                label="Giới thiệu bản thân"
                placeholder="Nhập giới thiệu ngắn về bản thân"
                :error="errors.about"
                :disabled="isLoading"
                @update:model-value="clearError('about')"
              />

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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useApiClient } from '@/composables/api/useApiClient'
import { publicEndpoints } from '@/api/endpoints'
import FormWrapper from '@/components/Core/Form/FormWrapper.vue'
import FormField from '@/components/Core/Form/FormField.vue'
import SingleSelectEnhanced from '@/components/Core/Select/SingleSelectEnhanced.vue'
import ImageUploader from '@/components/Core/Image/ImageUploader.vue'
import { Gender, getGenderArray } from '@/shared/enums/enums/gender.enum'
import { useSeo } from '@/composables/seo'

// Page meta
definePageMeta({
  layout: 'home',
  middleware: 'auth'
})

// SEO configuration
useSeo({
  title: 'Chỉnh sửa thông tin',
  description: 'Cập nhật thông tin cá nhân của bạn',
  type: 'profile',
  noindex: true
})

const router = useRouter()
const { apiClient } = useApiClient()

// Form data
const formData = ref({
  name: '',
  phone: '',
  image: '',
  birthday: '',
  gender: '',
  address: '',
  about: ''
})

// Gender options from enum
const genderOptions = getGenderArray()

// Validation rules
const validationRules = {
  name: [
    { max: 100, maxMessage: 'Tên không được quá 100 ký tự' }
  ],
  phone: [
    { pattern: /^(0[3|5|7|8|9])+([0-9]{8})$/, patternMessage: 'Số điện thoại không hợp lệ (VD: 0901234567)' }
  ],
  image: [
    { max: 255, maxMessage: 'URL không được quá 255 ký tự' },
    { url: true, emailMessage: 'URL không hợp lệ' }
  ],
  birthday: [
    { date: true, patternMessage: 'Ngày sinh không hợp lệ' }
  ],
  gender: [
    { in: ['male', 'female', 'other'], patternMessage: 'Giới tính không hợp lệ' }
  ],
  address: [
    { max: 500, maxMessage: 'Địa chỉ không được quá 500 ký tự' }
  ],
  about: [
    { max: 1000, maxMessage: 'Giới thiệu không được quá 1000 ký tự' }
  ]
}

const apiErrors = ref({})
const generalError = ref('')
const successMessage = ref('')
const isLoading = ref(false)

// Methods
const loadUser = async () => {
  try {
    const response = await apiClient.get(publicEndpoints.users.me)
    if (response.data.success) {
      const user = response.data.data
      formData.value = {
        name: user.profile?.name || '',
        phone: user.phone || '',
        image: user.profile?.image || '',
        birthday: user.profile?.birthday || '',
        gender: user.profile?.gender || '',
        address: user.profile?.address || '',
        about: user.profile?.about || ''
      }
    }
  } catch (err) {
    generalError.value = 'Không thể tải thông tin người dùng'
  }
}

const handleSubmit = async (form) => {
  if (isLoading.value) return
  
  isLoading.value = true
  generalError.value = ''
  successMessage.value = ''
  apiErrors.value = {}

  try {
    const response = await apiClient.patch(publicEndpoints.users.updateProfile, {
      name: form.name || undefined,
      phone: form.phone || undefined,
      image: form.image || undefined,
      birthday: form.birthday || undefined,
      gender: form.gender || undefined,
      address: form.address || undefined,
      about: form.about || undefined
    })

    if (response.data.success) {
      successMessage.value = response.data.message || 'Cập nhật thông tin thành công!'
      
      // Redirect sau 2 giây
      setTimeout(() => {
        router.push('/user/profile')
      }, 2000)
    } else {
      if (response.data.errors) {
        apiErrors.value = response.data.errors
      } else {
        generalError.value = response.data.message || 'Cập nhật thông tin thất bại'
      }
    }
  } catch (err) {
    if (err.response?.data?.errors) {
      apiErrors.value = err.response.data.errors
    } else {
      generalError.value = err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại'
    }
  } finally {
    isLoading.value = false
  }
}

const handleCancel = () => {
  router.push('/user/profile')
}

const handleImageUploaded = (response) => {
  // Image đã được upload thành công, response chứa URL
  // Form đã được cập nhật tự động qua v-model
}

const handleImageError = (error) => {
  console.error('Image upload error:', error)
}

onMounted(() => {
  loadUser()
})
</script>

<style scoped>
/* Add any custom styles here */
</style>