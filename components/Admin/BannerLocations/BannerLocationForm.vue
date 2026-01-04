<template>
  <Modal v-model="modalVisible" :title="formTitle" size="lg" :loading="isSubmitting">
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
          <p class="text-sm text-gray-600 mt-1">Nhập thông tin cơ bản của vị trí banner</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Mã vị trí -->
          <div>
            <label for="code" class="block text-sm font-medium text-gray-700 mb-2">
              Mã vị trí <span class="text-red-500">*</span>
            </label>
            <input
              id="code"
              v-model="formData.code"
              type="text"
              placeholder="home_slider"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-md transition-all duration-200"
              :class="{ 'border-red-500 ring-2 ring-red-200': validationErrors.code || (apiErrors && apiErrors.code) }"
              :disabled="!!location"
            />
            <p v-if="validationErrors.code" class="mt-2 text-sm text-red-600">{{ validationErrors.code }}</p>
            <p v-else-if="apiErrors && apiErrors.code" class="mt-2 text-sm text-red-600">{{ apiErrors.code[0] }}</p>
            <p v-if="!location" class="text-xs text-gray-500 mt-1">Mã duy nhất, không chứa khoảng trắng và ký tự đặc biệt</p>
            <p v-else class="text-xs text-gray-500 mt-1">Mã vị trí không thể thay đổi sau khi tạo</p>
          </div>

          <!-- Tên vị trí -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
              Tên vị trí <span class="text-red-500">*</span>
            </label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              placeholder="Slider trang chủ"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-md transition-all duration-200"
              :class="{ 'border-red-500 ring-2 ring-red-200': validationErrors.name || (apiErrors && apiErrors.name) }"
            />
            <p v-if="validationErrors.name" class="mt-2 text-sm text-red-600">{{ validationErrors.name }}</p>
            <p v-else-if="apiErrors && apiErrors.name" class="mt-2 text-sm text-red-600">{{ apiErrors.name[0] }}</p>
          </div>
        </div>

        <!-- Mô tả -->
        <div>
          <label for="description" class="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
          <textarea
            id="description"
            v-model="formData.description"
            rows="3"
            placeholder="Mô tả chi tiết về vị trí banner này..."
            class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-md transition-all duration-200"
            :class="{ 'border-red-500 ring-2 ring-red-200': validationErrors.description || (apiErrors && apiErrors.description) }"
          ></textarea>
          <p v-if="validationErrors.description" class="mt-2 text-sm text-red-600">{{ validationErrors.description }}</p>
          <p v-else-if="apiErrors && apiErrors.description" class="mt-2 text-sm text-red-600">{{ apiErrors.description[0] }}</p>
        </div>

        <!-- Trạng thái -->
        <div>
          <SingleSelectEnhanced
            v-model="formData.status"
            :search-api="statusApi"
            label="Trạng thái"
            label-field="label"
            value-field="value"
            placeholder="-- Chọn trạng thái --"
            :error="validationErrors.status || (apiErrors && apiErrors.status)"
            help-text="Trạng thái hoạt động của vị trí banner"
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
          <span v-else>{{ location ? 'Cập nhật vị trí' : 'Thêm vị trí mới' }}</span>
        </button>
      </div>
    </form>
  </Modal>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import Modal from '@/components/Core/Modal/Modal.vue'
import SingleSelectEnhanced from '@/components/Core/Select/SingleSelectEnhanced.vue'
import { adminEndpoints } from '@/api/endpoints'
import { useFormValidation } from '@/composables/utils/useFormValidation'

const props = defineProps({
  show: Boolean,
  location: Object,
  statusEnums: {
    type: Array,
    default: () => []
  },
  apiErrors: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['submit', 'cancel', 'created', 'updated'])

// API cho enum trạng thái
const statusApi = adminEndpoints.enums.byName('basic_status')

// Form title
const formTitle = computed(() => props.location ? 'Chỉnh sửa vị trí banner' : 'Thêm vị trí banner mới')

// Modal visibility
const modalVisible = computed({
  get: () => props.show,
  set: () => onClose()
})

// Form data
const formData = reactive({
  code: '',
  name: '',
  description: '',
  status: 'active'
})

// Form state
const isSubmitting = ref(false)

// Validation rules
const validationRules = computed(() => ({
  code: [
    { required: 'Mã vị trí là bắt buộc' },
    { pattern: /^[a-z_]+$/, message: 'Mã vị trí chỉ chứa chữ thường và dấu gạch dưới' }
  ],
  name: [
    { required: 'Tên vị trí là bắt buộc' }
  ]
}))

// Use form validation composable
const { validationErrors, clearErrors, validateForm } = useFormValidation(ref(formData), validationRules)

// Watch for location prop changes
watch(() => props.location, (newLocation) => {
  if (newLocation) {
    // Update form data with location data
    Object.assign(formData, {
      code: newLocation.code || '',
      name: newLocation.name || '',
      description: newLocation.description || '',
      status: newLocation.status || 'active'
    })
  } else {
    // Reset form for new location
    resetForm()
    clearErrors()
  }
}, { immediate: true })

// Reset form
function resetForm() {
  formData.code = ''
  formData.name = ''
  formData.description = ''
  formData.status = 'active'
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
      code: formData.code,
      name: formData.name,
      status: formData.status
    }
    
    // Only include description if it has a value
    if (formData.description !== undefined && formData.description !== null && formData.description !== '') {
      submitData.description = formData.description
    }
    
    // Emit appropriate event for create or update
    if (props.location) {
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
textarea {
  @apply focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
}

/* Background sections */
.bg-gray-50 {
  @apply hover:bg-gray-100 transition-colors duration-200;
}
</style>