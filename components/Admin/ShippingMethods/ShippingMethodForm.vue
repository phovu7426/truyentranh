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
            Nhập thông tin chung cho phương thức vận chuyển
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Tên phương thức vận chuyển -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
              Tên phương thức vận chuyển <span class="text-red-500">*</span>
            </label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              placeholder="Ví dụ: Giao hàng nhanh"
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
              placeholder="Ví dụ: STANDARD, EXPRESS, ECONOMY"
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
              placeholder="Mô tả về phương thức vận chuyển..."
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
      </div>

      <!-- Chi phí và thời gian -->
      <div class="space-y-4">
        <div class="border-b border-gray-200 pb-4">
          <h3 class="text-lg font-semibold text-gray-900">
            Chi phí và thời gian giao hàng
          </h3>
          <p class="text-sm text-gray-600 mt-1">
            Thiết lập chi phí vận chuyển và thời gian ước tính giao hàng
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Chi phí vận chuyển -->
          <div>
            <label for="cost" class="block text-sm font-medium text-gray-700 mb-1">
              Chi phí vận chuyển (VNĐ)
            </label>
            <input
              id="cost"
              v-model.number="formData.cost"
              type="number"
              min="0"
              step="1000"
              placeholder="Ví dụ: 50000"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              :class="{ 'border-red-500': validationErrors.cost || apiErrorsSafe.cost }"
            />
            <p v-if="validationErrors.cost" class="mt-1 text-sm text-red-600">{{ validationErrors.cost }}</p>
            <p v-else-if="apiErrorsSafe.cost" class="mt-1 text-sm text-red-600">{{ apiErrorsSafe.cost[0] }}</p>
            <p class="mt-1 text-xs text-gray-500">Chi phí vận chuyển cơ bản (đơn vị: VNĐ)</p>
          </div>

          <!-- Số ngày ước tính giao hàng -->
          <div>
            <label for="estimated_delivery_days" class="block text-sm font-medium text-gray-700 mb-1">
              Số ngày ước tính giao hàng
            </label>
            <input
              id="estimated_delivery_days"
              v-model.number="formData.estimated_delivery_days"
              type="number"
              min="0"
              placeholder="Ví dụ: 2"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              :class="{ 'border-red-500': validationErrors.estimated_delivery_days || apiErrorsSafe.estimated_delivery_days }"
            />
            <p v-if="validationErrors.estimated_delivery_days" class="mt-1 text-sm text-red-600">{{ validationErrors.estimated_delivery_days }}</p>
            <p v-else-if="apiErrorsSafe.estimated_delivery_days" class="mt-1 text-sm text-red-600">{{ apiErrorsSafe.estimated_delivery_days[0] }}</p>
            <p class="mt-1 text-xs text-gray-500">Số ngày làm việc ước tính để giao hàng</p>
          </div>
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
          <span v-else>{{ item ? 'Cập nhật phương thức vận chuyển' : 'Thêm phương thức vận chuyển mới' }}</span>
        </button>
      </div>
    </form>
  </Modal>
</template>

<script setup>
import { ref, computed, reactive, watch, nextTick } from 'vue'
import Modal from '@/components/Core/Modal/Modal.vue'
import CKEditor from '@/components/Core/Content/CKEditor.vue'
import { useFormValidation } from '@/composables/utils/useFormValidation'

const props = defineProps({
  show: Boolean,
  item: Object,
  apiErrors: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['submit', 'cancel'])

// Đảm bảo luôn có object để tránh lỗi khi apiErrors là null
const apiErrorsSafe = computed(() => props.apiErrors || {})

// Form title
const formTitle = computed(() => props.item ? 'Chỉnh sửa phương thức vận chuyển' : 'Thêm phương thức vận chuyển mới')

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
  cost: null,
  estimated_delivery_days: null
})

// Form state
const isSubmitting = ref(false)

// Validation rules
const validationRules = computed(() => ({
  name: [
    { required: 'Tên phương thức vận chuyển là bắt buộc' }
  ],
  code: [
    { required: 'Mã code là bắt buộc' }
  ],
  cost: [
    { 
      validator: (value) => {
        if (value !== null && value !== '' && value < 0) {
          return 'Chi phí không được nhỏ hơn 0'
        }
        return true
      }
    }
  ],
  estimated_delivery_days: [
    { 
      validator: (value) => {
        if (value !== null && value !== '' && value < 0) {
          return 'Số ngày không được nhỏ hơn 0'
        }
        return true
      }
    }
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
    
    // Map từ base_cost sang cost (DTO field)
    formData.cost = newVal.base_cost || newVal.cost || null
    if (formData.cost) {
      formData.cost = parseFloat(formData.cost)
    }
    
    // Map từ estimated_days sang estimated_delivery_days (DTO field)
    formData.estimated_delivery_days = newVal.estimated_days || newVal.estimated_delivery_days || null
    if (formData.estimated_delivery_days) {
      formData.estimated_delivery_days = parseInt(formData.estimated_delivery_days)
    }

    await nextTick()
  } else {
    resetForm()
    clearErrors()
  }
}, { immediate: true })

// Reset form
function resetForm() {
  formData.name = ''
  formData.code = ''
  formData.description = ''
  formData.cost = null
  formData.estimated_delivery_days = null
}

// Validate and submit form
function validateAndSubmit() {
  if (!validateForm()) {
    return
  }
  
  isSubmitting.value = true

  try {
    // Create submit data theo spec API (DTO sử dụng cost và estimated_delivery_days)
    const submitData = {
      name: formData.name,
      code: formData.code
    }

    if (formData.description) {
      submitData.description = formData.description
    }
    if (formData.cost !== null && formData.cost !== '') {
      submitData.cost = parseFloat(formData.cost)
    }
    if (formData.estimated_delivery_days !== null && formData.estimated_delivery_days !== '') {
      submitData.estimated_delivery_days = parseInt(formData.estimated_delivery_days)
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


