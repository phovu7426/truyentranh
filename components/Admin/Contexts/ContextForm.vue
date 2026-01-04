<template>
  <Modal v-model="modalVisible" :title="formTitle" size="xl" :loading="isSubmitting">
    <form @submit.prevent="validateAndSubmit" class="space-y-6" @click.stop>
      <!-- Thông tin context -->
      <div class="space-y-4">
        <div class="border-b border-gray-200 pb-4">
          <h3 class="text-lg font-semibold text-gray-900">
            Thông tin context
          </h3>
          <p class="text-sm text-gray-600 mt-1">
            Nhập thông tin cơ bản cho context
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Loại context -->
          <div>
            <label for="type" class="block text-sm font-medium text-gray-700 mb-2">
              Loại context <span class="text-red-500">*</span>
            </label>
            <input
              id="type"
              v-model="formData.type"
              type="text"
              :disabled="!!context"
              placeholder="Ví dụ: system, shop, team, comic..."
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500 ring-2 ring-red-200': validationErrors.type || (apiErrors && apiErrors.type), 'bg-gray-100': !!context }"
            />
            <p v-if="validationErrors.type" class="mt-2 text-sm text-red-600">{{ validationErrors.type }}</p>
            <p v-else-if="apiErrors && apiErrors.type" class="mt-2 text-sm text-red-600">{{ Array.isArray(apiErrors.type) ? apiErrors.type[0] : apiErrors.type }}</p>
            <p v-if="context" class="mt-1 text-xs text-gray-500">Không thể thay đổi loại context sau khi tạo</p>
          </div>

          <!-- Mã code -->
          <div>
            <label for="code" class="block text-sm font-medium text-gray-700 mb-2">Mã code</label>
            <input
              id="code"
              v-model="formData.code"
              type="text"
              :disabled="!!context"
              placeholder="Nếu không nhập, hệ thống sẽ tự động tạo"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500 ring-2 ring-red-200': validationErrors.code || (apiErrors && apiErrors.code), 'bg-gray-100': !!context }"
            />
            <p v-if="validationErrors.code" class="mt-2 text-sm text-red-600">{{ validationErrors.code }}</p>
            <p v-else-if="apiErrors && apiErrors.code" class="mt-2 text-sm text-red-600">{{ Array.isArray(apiErrors.code) ? apiErrors.code[0] : apiErrors.code }}</p>
            <p v-if="context" class="mt-1 text-xs text-gray-500">Không thể thay đổi mã code sau khi tạo</p>
            <p v-else class="mt-1 text-xs text-gray-500">Để trống để hệ thống tự động tạo từ type</p>
          </div>

          <!-- Tên context -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
              Tên context <span class="text-red-500">*</span>
            </label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              placeholder="Ví dụ: Shop Context, Team Context"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500 ring-2 ring-red-200': validationErrors.name || (apiErrors && apiErrors.name) }"
            />
            <p v-if="validationErrors.name" class="mt-2 text-sm text-red-600">{{ validationErrors.name }}</p>
            <p v-else-if="apiErrors && apiErrors.name" class="mt-2 text-sm text-red-600">{{ Array.isArray(apiErrors.name) ? apiErrors.name[0] : apiErrors.name }}</p>
          </div>

          <!-- Trạng thái -->
          <div>
            <label for="status" class="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
            <SingleSelectEnhanced
              v-model="formData.status"
              :options="statusOptions"
              label-field="label"
              value-field="value"
              placeholder="-- Chọn trạng thái --"
              :error="validationErrors.status || (apiErrors && apiErrors.status)"
            />
            <p v-if="validationErrors.status" class="mt-2 text-sm text-red-600">{{ validationErrors.status }}</p>
            <p v-else-if="apiErrors && apiErrors.status" class="mt-2 text-sm text-red-600">{{ Array.isArray(apiErrors.status) ? apiErrors.status[0] : apiErrors.status }}</p>
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
          class="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
          :disabled="isSubmitting"
        >
          <span v-if="isSubmitting">Đang xử lý...</span>
          <span v-else>{{ context ? 'Cập nhật context' : 'Thêm context mới' }}</span>
        </button>
      </div>
    </form>
  </Modal>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import Modal from '@/components/Core/Modal/Modal.vue'
import SingleSelectEnhanced from '@/components/Core/Select/SingleSelectEnhanced.vue'
import { useFormValidation } from '@/composables/utils/useFormValidation'

const props = defineProps({
  show: Boolean,
  context: Object,
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

// Form title
const formTitle = computed(() => props.context ? 'Chỉnh sửa context' : 'Thêm context mới')

// Modal visibility
const modalVisible = computed({
  get: () => props.show,
  set: () => onClose()
})

// Form data
const formData = reactive({
  type: '',
  code: '',
  name: '',
  status: 'active'
})

// Form state
const isSubmitting = ref(false)

// Validation rules
const validationRules = computed(() => ({
  type: [
    { required: 'Loại context là bắt buộc' }
  ],
  name: [
    { required: 'Tên context là bắt buộc' },
    { max: [255, 'Tên context không được vượt quá 255 ký tự'] }
  ],
  code: [
    { max: [100, 'Mã code không được vượt quá 100 ký tự'] }
  ]
}))

// Use form validation composable
const { validationErrors, clearErrors, validateForm } = useFormValidation(ref(formData), validationRules)

// Status options
const statusOptions = computed(() => {
  const options = [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]
  if (Array.isArray(props.statusEnums) && props.statusEnums.length > 0) {
    return props.statusEnums
      .filter(item => item != null)
      .map(item => ({
        value: item?.value ?? item?.id ?? '',
        label: item?.label ?? item?.name ?? ''
      }))
  }
  return options
})

// Watch context prop to update form data
watch(() => props.context, (newVal) => {
  if (newVal && typeof newVal === 'object') {
    formData.type = newVal?.type || ''
    formData.code = newVal?.code || ''
    formData.name = newVal?.name || ''
    formData.status = newVal?.status || 'active'
    clearErrors()
  } else if (!newVal) {
    resetForm()
  }
}, { immediate: true, deep: true })

// Reset form
function resetForm() {
  formData.type = ''
  formData.code = ''
  formData.name = ''
  formData.status = 'active'
  clearErrors()
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
      type: formData.type,
      name: formData.name
    }

    // code và status chỉ gửi nếu có giá trị (optional)
    if (formData.code) {
      submitData.code = formData.code
    }
    
    if (formData.status) {
      submitData.status = formData.status
    }

    // For update, only send allowed fields (name, code, status)
    if (props.context) {
      const updateData = {}
      if (formData.name) updateData.name = formData.name
      if (formData.code) updateData.code = formData.code
      if (formData.status) updateData.status = formData.status
      emit('submit', updateData)
    } else {
      emit('submit', submitData)
    }
  } finally {
    isSubmitting.value = false
  }
}

// Close modal
function onClose() {
  emit('cancel')
}
</script>

