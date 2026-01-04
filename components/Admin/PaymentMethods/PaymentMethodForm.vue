<template>
  <Modal v-model="modalVisible" :title="formTitle" size="xl" :loading="isSubmitting">
    <form @submit.prevent="validateAndSubmit" class="space-y-6" @click.stop>
      <!-- Thông tin cơ bản -->
      <div class="space-y-4">
        <div class="border-b border-gray-200 pb-4">
          <h3 class="text-lg font-semibold text-gray-900">
            Thông tin cơ bản
          </h3>
          <p class="text-sm text-gray-600 mt-1">
            Nhập thông tin chung cho phương thức thanh toán
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Tên phương thức thanh toán -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
              Tên phương thức thanh toán <span class="text-red-500">*</span>
            </label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              placeholder="Ví dụ: Chuyển khoản ngân hàng"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              :class="{ 'border-red-500': validationErrors.name || apiErrorsSafe.name }"
            />
            <p v-if="validationErrors.name" class="mt-1 text-sm text-red-600">{{ validationErrors.name }}</p>
            <p v-else-if="apiErrorsSafe.name" class="mt-1 text-sm text-red-600">{{ apiErrorsSafe.name[0] }}</p>
          </div>

          <!-- Mã code -->
          <div>
            <label for="code" class="block text-sm font-medium text-gray-700 mb-1">
              Mã code <span class="text-red-500">*</span>
            </label>
            <input
              id="code"
              v-model="formData.code"
              type="text"
              placeholder="Ví dụ: bank_transfer, vnpay, momo, cod"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              :class="{ 'border-red-500': validationErrors.code || apiErrorsSafe.code }"
            />
            <p v-if="validationErrors.code" class="mt-1 text-sm text-red-600">{{ validationErrors.code }}</p>
            <p v-else-if="apiErrorsSafe.code" class="mt-1 text-sm text-red-600">{{ apiErrorsSafe.code[0] }}</p>
            <p class="mt-1 text-xs text-gray-500">Mã code phải là duy nhất và không được trùng với phương thức khác</p>
          </div>
        </div>

        <!-- Mô tả -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
          <div @click.stop>
            <CKEditor
              id="description"
              v-model="formData.description"
              placeholder="Mô tả về phương thức thanh toán..."
              :height="'150px'"
              :show-word-count="true"
              :show-char-count="false"
              :upload-url="'/api/admin/upload/image'"
              :max-file-size="5 * 1024 * 1024"
              :allowed-image-types="['image/jpeg', 'image/png', 'image/gif', 'image/webp']"
              :auto-save="false"
              :language="'vi'"
              @change="onDescriptionChange"
              @ready="onEditorReady"
              @error="onEditorError"
            />
          </div>
          <p v-if="validationErrors.description" class="mt-2 text-sm text-red-600">{{ validationErrors.description }}</p>
          <p v-else-if="apiErrorsSafe.description" class="mt-2 text-sm text-red-600">{{ apiErrorsSafe.description[0] }}</p>
        </div>

        <!-- Nhà cung cấp -->
        <div>
          <label for="provider" class="block text-sm font-medium text-gray-700 mb-1">
            Nhà cung cấp
          </label>
          <input
            id="provider"
            v-model="formData.provider"
            type="text"
            placeholder="Ví dụ: Vietcombank, VNPay, MoMo"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            :class="{ 'border-red-500': validationErrors.provider || apiErrorsSafe.provider }"
          />
          <p v-if="validationErrors.provider" class="mt-1 text-sm text-red-600">{{ validationErrors.provider }}</p>
          <p v-else-if="apiErrorsSafe.provider" class="mt-1 text-sm text-red-600">{{ apiErrorsSafe.provider[0] }}</p>
        </div>
      </div>

      <!-- Cấu hình -->
      <div class="space-y-4">
        <div class="border-b border-gray-200 pb-4">
          <h3 class="text-lg font-semibold text-gray-900">
            Cấu hình
          </h3>
          <p class="text-sm text-gray-600 mt-1">
            Cấu hình tùy chỉnh cho phương thức thanh toán (JSON)
          </p>
        </div>

        <div>
          <label for="config" class="block text-sm font-medium text-gray-700 mb-1">
            Cấu hình (JSON)
          </label>
          <textarea
            id="config"
            v-model="configJson"
            rows="6"
            placeholder='{"bank_name": "Vietcombank", "account_number": "1234567890", "account_holder": "Công ty ABC"}'
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
            :class="{ 'border-red-500': configError || apiErrorsSafe.config }"
          ></textarea>
          <p v-if="configError" class="mt-1 text-sm text-red-600">{{ configError }}</p>
          <p v-else-if="apiErrorsSafe.config" class="mt-1 text-sm text-red-600">{{ apiErrorsSafe.config[0] }}</p>
          <p class="mt-1 text-xs text-gray-500">Nhập dữ liệu JSON hợp lệ. Ví dụ: {"bank_name": "Vietcombank", "account_number": "1234567890"}</p>
        </div>
      </div>

      <!-- Trạng thái -->
      <div class="space-y-4">
        <div class="border-b border-gray-200 pb-4">
          <h3 class="text-lg font-semibold text-gray-900">
            Trạng thái
          </h3>
          <p class="text-sm text-gray-600 mt-1">
            Thiết lập trạng thái hoạt động của phương thức thanh toán
          </p>
        </div>

        <div>
          <SingleSelectEnhanced
            v-model="formData.status"
            :search-api="statusApi"
            label="Trạng thái"
            label-field="label"
            value-field="value"
            placeholder="-- Chọn trạng thái --"
            :error="validationErrors.status || (apiErrorsSafe.status ? (Array.isArray(apiErrorsSafe.status) ? apiErrorsSafe.status[0] : apiErrorsSafe.status) : '')"
            help-text="Trạng thái hoạt động của phương thức thanh toán"
          />
        </div>
      </div>

      <!-- Buttons -->
      <div class="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          @click="onClose"
          class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
        >
          Hủy
        </button>
        <button
          type="submit"
          class="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
          :disabled="isSubmitting"
        >
          <span v-if="isSubmitting">Đang xử lý...</span>
          <span v-else>{{ item ? 'Cập nhật phương thức thanh toán' : 'Thêm phương thức thanh toán mới' }}</span>
        </button>
      </div>
    </form>
  </Modal>
</template>

<script setup>
import { ref, computed, reactive, watch, nextTick } from 'vue'
import Modal from '@/components/Core/Modal/Modal.vue'
import SingleSelectEnhanced from '@/components/Core/Select/SingleSelectEnhanced.vue'
import CKEditor from '@/components/Core/Content/CKEditor.vue'
import { adminEndpoints } from '@/api/endpoints'
import { useFormValidation } from '@/composables/utils/useFormValidation'

const props = defineProps({
  show: Boolean,
  item: Object,
  statusEnums: {
    type: Array,
    default: () => []
  },
  apiErrors: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['submit', 'cancel'])

// API cho enum trạng thái
const statusApi = adminEndpoints.enums.byName('basic_status')

// Đảm bảo luôn có object để tránh lỗi khi apiErrors là null
const apiErrorsSafe = computed(() => props.apiErrors || {})

// Form title
const formTitle = computed(() => props.item ? 'Chỉnh sửa phương thức thanh toán' : 'Thêm phương thức thanh toán mới')

// Modal visibility
const modalVisible = computed({
  get: () => props.show,
  set: () => onClose()
})

// Form data
const formData = reactive({
  name: '',
  code: '',
  description: '',
  provider: '',
  config: null,
  status: 'active'
})

// Form state
const isSubmitting = ref(false)
const configJson = ref('')
const configError = ref('')

// Validation rules
const validationRules = computed(() => ({
  name: [
    { required: 'Tên phương thức thanh toán là bắt buộc' }
  ],
  code: [
    { required: 'Mã code là bắt buộc' }
  ]
}))

// Use form validation composable
const { validationErrors, clearErrors, validateForm } = useFormValidation(ref(formData), validationRules)

// Watch item prop to update form data
watch(() => props.item, async (newVal) => {
  if (newVal) {
    formData.name = newVal.name || ''
    formData.code = newVal.code || ''
    formData.description = newVal.description || ''
    formData.provider = newVal.provider || ''
    formData.status = newVal.status !== undefined ? newVal.status : 'active'
    
    // Parse config JSON
    if (newVal.config) {
      try {
        configJson.value = typeof newVal.config === 'string' 
          ? newVal.config 
          : JSON.stringify(newVal.config, null, 2)
        formData.config = typeof newVal.config === 'object' ? newVal.config : JSON.parse(newVal.config)
      } catch (e) {
        configJson.value = ''
        formData.config = null
      }
    } else {
      configJson.value = ''
      formData.config = null
    }

    await nextTick()
  } else {
    resetForm()
    clearErrors()
  }
}, { immediate: true })

// Watch configJson to validate JSON
watch(() => configJson.value, (newVal) => {
  configError.value = ''
  if (!newVal || newVal.trim() === '') {
    formData.config = null
    return
  }
  
  try {
    const parsed = JSON.parse(newVal)
    formData.config = parsed
  } catch (e) {
    configError.value = 'JSON không hợp lệ: ' + e.message
    formData.config = null
  }
})

// Reset form
function resetForm() {
  formData.name = ''
  formData.code = ''
  formData.description = ''
  formData.provider = ''
  formData.config = null
  formData.status = 'active'
  configJson.value = ''
  configError.value = ''
}

// Validate and submit form
function validateAndSubmit() {
  configError.value = ''
  
  // Validate JSON if provided
  if (configJson.value && configJson.value.trim() !== '') {
    try {
      formData.config = JSON.parse(configJson.value)
    } catch (e) {
      configError.value = 'JSON không hợp lệ: ' + e.message
      return
    }
  } else {
    formData.config = null
  }
  
  if (!validateForm()) {
    return
  }
  
  isSubmitting.value = true

  try {
    // Create submit data theo spec API
    const submitData = {
      name: formData.name,
      code: formData.code,
      status: formData.status
    }

    if (formData.description) {
      submitData.description = formData.description
    }
    if (formData.provider) {
      submitData.provider = formData.provider
    }
    if (formData.config) {
      submitData.config = formData.config
    }

    emit('submit', submitData)
  } finally {
    isSubmitting.value = false
  }
}

// Close modal
function onClose() {
  emit('cancel')
}

// CKEditor event handlers
const onDescriptionChange = (content) => {
  // Handle description change
}

const onEditorReady = (editor) => {
  // Editor is ready
}

const onEditorError = (error) => {
}
</script>







