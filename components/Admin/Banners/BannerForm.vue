<template>
  <Modal v-model="modalVisible" :title="formTitle" size="xl" :loading="isSubmitting">
    <form @submit.prevent="validateAndSubmit" class="space-y-6" @click.stop>
      
      <!-- Basic Information Section -->
      <div class="space-y-6">
        <div class="border-b border-gray-200 pb-4">
          <h3 class="text-lg font-semibold text-gray-900 flex items-center">
            <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Thông tin cơ bản
          </h3>
          <p class="text-sm text-gray-600 mt-1">Nhập thông tin cơ bản của banner</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Tiêu đề -->
          <div class="md:col-span-2">
            <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề <span class="text-red-500">*</span>
            </label>
            <input
              id="title"
              v-model="formData.title"
              type="text"
              placeholder="Nhập tiêu đề banner"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-md transition-all duration-200"
              :class="{ 'border-red-500 ring-2 ring-red-200': validationErrors.title || (apiErrors && apiErrors.title) }"
            />
            <p v-if="validationErrors.title" class="mt-2 text-sm text-red-600">{{ validationErrors.title }}</p>
            <p v-else-if="apiErrors && apiErrors.title" class="mt-2 text-sm text-red-600">{{ apiErrors.title[0] }}</p>
          </div>

          <!-- Phụ đề -->
          <div class="md:col-span-2">
            <label for="subtitle" class="block text-sm font-medium text-gray-700 mb-2">Phụ đề</label>
            <input
              id="subtitle"
              v-model="formData.subtitle"
              type="text"
              placeholder="Nhập phụ đề banner"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-md transition-all duration-200"
              :class="{ 'border-red-500 ring-2 ring-red-200': validationErrors.subtitle || (apiErrors && apiErrors.subtitle) }"
            />
            <p v-if="validationErrors.subtitle" class="mt-2 text-sm text-red-600">{{ validationErrors.subtitle }}</p>
            <p v-else-if="apiErrors && apiErrors.subtitle" class="mt-2 text-sm text-red-600">{{ apiErrors.subtitle[0] }}</p>
          </div>

          <!-- Vị trí banner -->
          <div>
            <SingleSelectEnhanced
              v-model="formData.location_id"
              :search-api="locationApi"
              label="Vị trí banner"
              label-field="name"
              value-field="id"
              placeholder="-- Chọn vị trí banner --"
              :error="validationErrors.location_id || (apiErrors && apiErrors.location_id)"
              help-text="Chọn vị trí hiển thị banner"
              required="required"
            />
          </div>

          <!-- Thứ tự hiển thị -->
          <div>
            <label for="sort_order" class="block text-sm font-medium text-gray-700 mb-2">
              Thứ tự hiển thị
            </label>
            <input
              id="sort_order"
              v-model="formData.sort_order"
              type="number"
              min="0"
              placeholder="1"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-md transition-all duration-200"
              :class="{ 'border-red-500 ring-2 ring-red-200': validationErrors.sort_order || (apiErrors && apiErrors.sort_order) }"
            />
            <p v-if="validationErrors.sort_order" class="mt-2 text-sm text-red-600">{{ validationErrors.sort_order }}</p>
            <p v-else-if="apiErrors && apiErrors.sort_order" class="mt-2 text-sm text-red-600">{{ apiErrors.sort_order[0] }}</p>
            <p class="text-xs text-gray-500 mt-1">Số càng nhỏ càng được hiển thị trước</p>
          </div>
        </div>

        <!-- Mô tả -->
        <div>
          <label for="description" class="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
          <textarea
            id="description"
            v-model="formData.description"
            rows="3"
            placeholder="Mô tả chi tiết về banner..."
            class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-md transition-all duration-200"
            :class="{ 'border-red-500 ring-2 ring-red-200': validationErrors.description || (apiErrors && apiErrors.description) }"
          ></textarea>
          <p v-if="validationErrors.description" class="mt-2 text-sm text-red-600">{{ validationErrors.description }}</p>
          <p v-else-if="apiErrors && apiErrors.description" class="mt-2 text-sm text-red-600">{{ apiErrors.description[0] }}</p>
        </div>
      </div>

      <!-- Images Section -->
      <div class="space-y-6 mt-8">
        <div class="border-b border-gray-200 pb-4">
          <h3 class="text-lg font-semibold text-gray-900 flex items-center">
            <svg class="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            Hình ảnh banner
          </h3>
          <p class="text-sm text-gray-600 mt-1">Thêm hình ảnh cho banner</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Hình ảnh desktop -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Hình ảnh desktop <span class="text-red-500">*</span></label>
            <ImageUploader
              v-model="formData.image"
              :default-url="imageUrl"
              @remove="formData.image = null"
            />
            <p v-if="validationErrors.image" class="mt-2 text-sm text-red-600">{{ validationErrors.image }}</p>
            <p v-else-if="apiErrors && apiErrors.image && Array.isArray(apiErrors.image)" class="mt-2 text-sm text-red-600">{{ apiErrors.image[0] }}</p>
          </div>

          <!-- Hình ảnh mobile -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Hình ảnh mobile</label>
            <ImageUploader
              v-model="formData.mobile_image"
              :default-url="mobileImageUrl"
              @remove="formData.mobile_image = null"
            />
            <p v-if="validationErrors.mobile_image" class="mt-2 text-sm text-red-600">{{ validationErrors.mobile_image }}</p>
            <p v-else-if="apiErrors && apiErrors.mobile_image && Array.isArray(apiErrors.mobile_image)" class="mt-2 text-sm text-red-600">{{ apiErrors.mobile_image[0] }}</p>
            <p class="text-xs text-gray-500 mt-1">Sẽ được ưu tiên trên thiết bị di động</p>
          </div>
        </div>
      </div>

      <!-- Link and Button Section -->
      <div class="space-y-6 mt-8">
        <div class="border-b border-gray-200 pb-4">
          <h3 class="text-lg font-semibold text-gray-900 flex items-center">
            <svg class="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
            </svg>
            Liên kết và nút bấm
          </h3>
          <p class="text-sm text-gray-600 mt-1">Cấu hình liên kết và nút bấm cho banner</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Link -->
          <div>
            <label for="link" class="block text-sm font-medium text-gray-700 mb-2">Liên kết</label>
            <input
              id="link"
              v-model="formData.link"
              type="url"
              placeholder="https://example.com/products"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-md transition-all duration-200"
              :class="{ 'border-red-500 ring-2 ring-red-200': validationErrors.link || (apiErrors && apiErrors.link) }"
            />
            <p v-if="validationErrors.link" class="mt-2 text-sm text-red-600">{{ validationErrors.link }}</p>
            <p v-else-if="apiErrors && apiErrors.link" class="mt-2 text-sm text-red-600">{{ apiErrors.link[0] }}</p>
          </div>

          <!-- Link target -->
          <div>
            <label for="link_target" class="block text-sm font-medium text-gray-700 mb-2">Mở liên kết</label>
            <select
              id="link_target"
              v-model="formData.link_target"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-md transition-all duration-200"
              :class="{ 'border-red-500 ring-2 ring-red-200': validationErrors.link_target || (apiErrors && apiErrors.link_target) }"
            >
              <option value="_self">Cùng tab</option>
              <option value="_blank">Tab mới</option>
            </select>
            <p v-if="validationErrors.link_target" class="mt-2 text-sm text-red-600">{{ validationErrors.link_target }}</p>
            <p v-else-if="apiErrors && apiErrors.link_target" class="mt-2 text-sm text-red-600">{{ apiErrors.link_target[0] }}</p>
          </div>

          <!-- Button text -->
          <div>
            <label for="button_text" class="block text-sm font-medium text-gray-700 mb-2">Nút bấm</label>
            <input
              id="button_text"
              v-model="formData.button_text"
              type="text"
              placeholder="Xem ngay"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-md transition-all duration-200"
              :class="{ 'border-red-500 ring-2 ring-red-200': validationErrors.button_text || (apiErrors && apiErrors.button_text) }"
            />
            <p v-if="validationErrors.button_text" class="mt-2 text-sm text-red-600">{{ validationErrors.button_text }}</p>
            <p v-else-if="apiErrors && apiErrors.button_text" class="mt-2 text-sm text-red-600">{{ apiErrors.button_text[0] }}</p>
          </div>

          <!-- Button color -->
          <div>
            <label for="button_color" class="block text-sm font-medium text-gray-700 mb-2">Màu nút bấm</label>
            <input
              id="button_color"
              v-model="formData.button_color"
              type="text"
              placeholder="#ff6b6b"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-md transition-all duration-200"
              :class="{ 'border-red-500 ring-2 ring-red-200': validationErrors.button_color || (apiErrors && apiErrors.button_color) }"
            />
            <p v-if="validationErrors.button_color" class="mt-2 text-sm text-red-600">{{ validationErrors.button_color }}</p>
            <p v-else-if="apiErrors && apiErrors.button_color" class="mt-2 text-sm text-red-600">{{ apiErrors.button_color[0] }}</p>
            <p class="text-xs text-gray-500 mt-1">Mã màu hex (#ff6b6b) hoặc tên màu (red)</p>
          </div>

          <!-- Text color -->
          <div>
            <label for="text_color" class="block text-sm font-medium text-gray-700 mb-2">Màu chữ</label>
            <input
              id="text_color"
              v-model="formData.text_color"
              type="text"
              placeholder="#ffffff"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-md transition-all duration-200"
              :class="{ 'border-red-500 ring-2 ring-red-200': validationErrors.text_color || (apiErrors && apiErrors.text_color) }"
            />
            <p v-if="validationErrors.text_color" class="mt-2 text-sm text-red-600">{{ validationErrors.text_color }}</p>
            <p v-else-if="apiErrors && apiErrors.text_color" class="mt-2 text-sm text-red-600">{{ apiErrors.text_color[0] }}</p>
            <p class="text-xs text-gray-500 mt-1">Mã màu hex (#ffffff) hoặc tên màu (white)</p>
          </div>
        </div>
      </div>

      <!-- Schedule Section -->
      <div class="space-y-6 mt-8">
        <div class="border-b border-gray-200 pb-4">
          <h3 class="text-lg font-semibold text-gray-900 flex items-center">
            <svg class="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            Lịch trình hiển thị
          </h3>
          <p class="text-sm text-gray-600 mt-1">Cài đặt thời gian hiển thị banner</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Start date -->
          <div>
            <label for="start_date" class="block text-sm font-medium text-gray-700 mb-2">Ngày bắt đầu</label>
            <input
              id="start_date"
              v-model="formData.start_date"
              type="datetime-local"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-md transition-all duration-200"
              :class="{ 'border-red-500 ring-2 ring-red-200': validationErrors.start_date || (apiErrors && apiErrors.start_date) }"
            />
            <p v-if="validationErrors.start_date" class="mt-2 text-sm text-red-600">{{ validationErrors.start_date }}</p>
            <p v-else-if="apiErrors && apiErrors.start_date" class="mt-2 text-sm text-red-600">{{ apiErrors.start_date[0] }}</p>
            <p class="text-xs text-gray-500 mt-1">Để trống nếu hiển thị ngay lập tức</p>
          </div>

          <!-- End date -->
          <div>
            <label for="end_date" class="block text-sm font-medium text-gray-700 mb-2">Ngày kết thúc</label>
            <input
              id="end_date"
              v-model="formData.end_date"
              type="datetime-local"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-md transition-all duration-200"
              :class="{ 'border-red-500 ring-2 ring-red-200': validationErrors.end_date || (apiErrors && apiErrors.end_date) }"
            />
            <p v-if="validationErrors.end_date" class="mt-2 text-sm text-red-600">{{ validationErrors.end_date }}</p>
            <p v-else-if="apiErrors && apiErrors.end_date" class="mt-2 text-sm text-red-600">{{ apiErrors.end_date[0] }}</p>
            <p class="text-xs text-gray-500 mt-1">Để trống nếu hiển thị vĩnh viễn</p>
          </div>
        </div>
      </div>

      <!-- Status Section -->
      <div class="space-y-6 mt-8">
        <div class="border-b border-gray-200 pb-4">
          <h3 class="text-lg font-semibold text-gray-900 flex items-center">
            <svg class="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Trạng thái
          </h3>
          <p class="text-sm text-gray-600 mt-1">Cài đặt trạng thái hoạt động</p>
        </div>

        <div>
          <SingleSelectEnhanced
            v-model="formData.status"
            :search-api="statusApi"
            label="Trạng thái"
            label-field="label"
            value-field="value"
            placeholder="-- Chọn trạng thái --"
            :error="validationErrors.status || (apiErrors && apiErrors.status)"
            help-text="Trạng thái hoạt động của banner"
            required="required"
          />
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          @click="onClose"
          class="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold rounded-lg shadow transition-all duration-200"
        >
          Hủy
        </button>
        <button
          type="submit"
          class="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
          :disabled="isSubmitting"
        >
          <span v-if="isSubmitting">
            <span class="inline-block animate-spin mr-2">&#8635;</span>
            Đang xử lý...
          </span>
          <span v-else>{{ banner ? 'Cập nhật banner' : 'Thêm banner mới' }}</span>
        </button>
      </div>
    </form>
  </Modal>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import Modal from '@/components/Core/Modal/Modal.vue'
import ImageUploader from '@/components/Core/Image/ImageUploader.vue'
import SingleSelectEnhanced from '@/components/Core/Select/SingleSelectEnhanced.vue'
import { adminEndpoints } from '@/api/endpoints'
import { useFormValidation } from '@/composables/utils/useFormValidation'

const props = defineProps({
  show: Boolean,
  banner: Object,
  statusEnums: {
    type: Array,
    default: () => []
  },
  locationEnums: {
    type: Array,
    default: () => []
  },
  apiErrors: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['submit', 'cancel', 'created', 'updated'])

// API cho enum trạng thái và vị trí
const statusApi = adminEndpoints.enums.byName('basic_status')
const locationApi = adminEndpoints.bannerLocations.list

// Form title
const formTitle = computed(() => props.banner ? 'Chỉnh sửa banner' : 'Thêm banner mới')

// Modal visibility
const modalVisible = computed({
  get: () => props.show,
  set: () => onClose()
})

// Image URLs for ImageUploader
const imageUrl = computed(() => {
  if (props.banner?.image) {
    return props.banner.image
  }
  return null
})

const mobileImageUrl = computed(() => {
  if (props.banner?.mobile_image) {
    return props.banner.mobile_image
  }
  return null
})

// Form data
const formData = reactive({
  title: '',
  subtitle: '',
  description: '',
  image: null,
  mobile_image: null,
  link: '',
  link_target: '_self',
  button_text: '',
  button_color: '#ff6b6b',
  text_color: '#ffffff',
  location_id: null,
  sort_order: 1,
  status: 'active',
  start_date: null,
  end_date: null
})

// Form state
const isSubmitting = ref(false)

// Validation rules
const validationRules = computed(() => ({
  title: [
    { required: 'Tiêu đề là bắt buộc' }
  ],
  image: [
    { required: 'Hình ảnh desktop là bắt buộc' }
  ],
  location_id: [
    { required: 'Vị trí banner là bắt buộc' }
  ]
}))

// Use form validation composable
const { validationErrors, clearErrors, validateForm } = useFormValidation(ref(formData), validationRules)

// Watch for banner prop changes
watch(() => props.banner, (newBanner) => {
  if (newBanner) {
    // Update form data with banner data
    Object.assign(formData, {
      title: newBanner.title || '',
      subtitle: newBanner.subtitle || '',
      description: newBanner.description || '',
      image: (newBanner.image && !newBanner.image.includes('via.placeholder')) ? newBanner.image : null,
      mobile_image: (newBanner.mobile_image && !newBanner.mobile_image.includes('via.placeholder')) ? newBanner.mobile_image : null,
      link: newBanner.link || '',
      link_target: newBanner.link_target || '_self',
      button_text: newBanner.button_text || '',
      button_color: newBanner.button_color || '#ff6b6b',
      text_color: newBanner.text_color || '#ffffff',
      location_id: newBanner.location_id || null,
      sort_order: newBanner.sort_order || 1,
      status: newBanner.status || 'active',
      start_date: newBanner.start_date ? new Date(newBanner.start_date).toISOString().slice(0, 16) : null,
      end_date: newBanner.end_date ? new Date(newBanner.end_date).toISOString().slice(0, 16) : null
    })
  } else {
    // Reset form for new banner
    resetForm()
    clearErrors()
  }
}, { immediate: true })

// Reset form
function resetForm() {
  formData.title = ''
  formData.subtitle = ''
  formData.description = ''
  formData.image = null
  formData.mobile_image = null
  formData.link = ''
  formData.link_target = '_self'
  formData.button_text = ''
  formData.button_color = '#ff6b6b'
  formData.text_color = '#ffffff'
  formData.location_id = null
  formData.sort_order = 1
  formData.status = 'active'
  formData.start_date = null
  formData.end_date = null
}

// Validate and submit form
function validateAndSubmit() {
  if (!validateForm()) {
    return
  }
  
  isSubmitting.value = true
  
  try {
    // Create submit data
    const submitData = {
      title: formData.title,
      status: formData.status,
      location_id: formData.location_id,
      sort_order: parseInt(formData.sort_order) || 1
    }
    
    // Only include fields with valid values
    if (formData.subtitle !== undefined && formData.subtitle !== null && formData.subtitle !== '') {
      submitData.subtitle = formData.subtitle
    }
    
    if (formData.description !== undefined && formData.description !== null && formData.description !== '') {
      submitData.description = formData.description
    }
    
    if (formData.image !== null && formData.image !== undefined) {
      submitData.image = formData.image
    }
    
    if (formData.mobile_image !== null && formData.mobile_image !== undefined) {
      submitData.mobile_image = formData.mobile_image
    }
    
    if (formData.link !== undefined && formData.link !== null && formData.link !== '') {
      submitData.link = formData.link
    }
    
    submitData.link_target = formData.link_target
    
    if (formData.button_text !== undefined && formData.button_text !== null && formData.button_text !== '') {
      submitData.button_text = formData.button_text
    }
    
    if (formData.button_color !== undefined && formData.button_color !== null && formData.button_color !== '') {
      submitData.button_color = formData.button_color
    }
    
    if (formData.text_color !== undefined && formData.text_color !== null && formData.text_color !== '') {
      submitData.text_color = formData.text_color
    }
    
    if (formData.start_date !== undefined && formData.start_date !== null && formData.start_date !== '') {
      submitData.start_date = new Date(formData.start_date).toISOString()
    }
    
    if (formData.end_date !== undefined && formData.end_date !== null && formData.end_date !== '') {
      submitData.end_date = new Date(formData.end_date).toISOString()
    }
    
    // Emit appropriate event for create or update
    if (props.banner) {
      // Editing - emit updated event
      emit('updated', submitData)
    } else {
      // Creating - emit created event
      emit('created', submitData)
    }
  } catch (error) {
  } finally {
    isSubmitting.value = false
  }
}

// Close modal
function onClose() {
  emit('cancel')
}
</script>

<style scoped>
/* Enhanced styling for the modal */
:deep(.modal-container) {
  @apply bg-gradient-to-br from-white to-gray-50;
}

:deep(.modal-header) {
  @apply bg-gradient-to-r from-blue-600 to-blue-700 text-white border-b-0;
}

:deep(.modal-title) {
  @apply text-xl font-bold text-white;
}

:deep(.modal-close) {
  @apply text-white hover:text-gray-200;
}

/* Enhanced form styling */
:deep(.form-field) {
  @apply mb-4;
}

:deep(.form-field input),
:deep(.form-field textarea),
:deep(.form-field select) {
  @apply border-gray-300 rounded-lg shadow-sm transition-all duration-200;
}

:deep(.form-field input:focus),
:deep(.form-field textarea:focus),
:deep(.form-field select:focus) {
  @apply border-blue-500 ring-2 ring-blue-200 shadow-md;
}

:deep(.form-field.has-error input),
:deep(.form-field.has-error textarea),
:deep(.form-field.has-error select) {
  @apply border-red-500 ring-2 ring-red-200;
}

/* Enhanced button styling */
button[type="submit"] {
  @apply bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105;
}

button[type="button"]:not([type="submit"]) {
  @apply bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 px-6 rounded-lg shadow transition-all duration-200;
}

/* Section styling */
.section-header {
  @apply bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border-l-4 border-blue-500;
}

/* Grid improvements */
.grid > div {
  @apply transition-all duration-200;
}

.grid > div:hover {
  @apply transform scale-[1.02];
}

/* Enhanced input fields */
input[type="text"],
input[type="url"],
input[type="number"],
input[type="datetime-local"],
textarea {
  @apply focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
}

/* Background sections */
.bg-gray-50 {
  @apply hover:bg-gray-100 transition-colors duration-200;
}
</style>