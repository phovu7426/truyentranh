<template>
  <Modal v-model="modalVisible" :title="formTitle" size="xl" :loading="isSubmitting">
    <form @submit.prevent="validateAndSubmit" class="space-y-6" @click.stop>
      <!-- Thông tin cơ bản -->
      <div class="space-y-4">
        <div class="border-b border-gray-200 pb-4">
          <h3 class="text-lg font-semibold text-gray-900">
            Thông tin quyền
          </h3>
          <p class="text-sm text-gray-600 mt-1">
            Nhập thông tin cơ bản cho quyền
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Mã code -->
          <div>
            <label for="code" class="block text-sm font-medium text-gray-700 mb-2">
              Mã code <span class="text-red-500">*</span>
            </label>
            <input
              id="code"
              v-model="formData.code"
              type="text"
              :disabled="!!permission"
              placeholder="Ví dụ: post.manage, user.create"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500 ring-2 ring-red-200': validationErrors.code || apiErrorsSafe.code, 'bg-gray-100': !!permission }"
            />
            <p v-if="validationErrors.code" class="mt-2 text-sm text-red-600">{{ validationErrors.code }}</p>
            <p v-else-if="apiErrorsSafe.code" class="mt-2 text-sm text-red-600">{{ apiErrorsSafe.code[0] }}</p>
            <p v-if="permission" class="mt-1 text-xs text-gray-500">Không thể thay đổi mã code sau khi tạo</p>
          </div>

          <!-- Tên quyền -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-2">Tên quyền</label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              placeholder="Ví dụ: Quản lý bài viết"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500 ring-2 ring-red-200': validationErrors.name || apiErrorsSafe.name }"
            />
            <p v-if="validationErrors.name" class="mt-2 text-sm text-red-600">{{ validationErrors.name }}</p>
            <p v-else-if="apiErrorsSafe.name" class="mt-2 text-sm text-red-600">{{ apiErrorsSafe.name[0] }}</p>
          </div>
        </div>

        <!-- Scope -->
        <div>
          <label for="scope" class="block text-sm font-medium text-gray-700 mb-2">Phạm vi (Scope)</label>
          <select
            id="scope"
            v-model="formData.scope"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            :class="{ 'border-red-500 ring-2 ring-red-200': validationErrors.scope || apiErrorsSafe.scope }"
          >
            <option value="context">Context (Dùng trong shop, group, ...)</option>
            <option value="system">System (Chỉ dùng trong system context)</option>
          </select>
          <p v-if="validationErrors.scope" class="mt-2 text-sm text-red-600">{{ validationErrors.scope }}</p>
          <p v-else-if="apiErrorsSafe.scope" class="mt-2 text-sm text-red-600">{{ apiErrorsSafe.scope[0] }}</p>
          <p class="mt-1 text-xs text-gray-500">Chọn phạm vi áp dụng của quyền này</p>
        </div>

        <!-- Quyền cha -->
        <div>
          <label for="parent_id" class="block text-sm font-medium text-gray-700 mb-2">Quyền cha</label>
          <SearchableSelect
            v-model="formData.parent_id"
            :search-api="permissionsListApi"
            :exclude-id="permission?.id"
            :error="validationErrors.parent_id || apiErrorsSafe.parent_id"
            placeholder="Tìm kiếm quyền cha..."
            label-field="name"
          />
          <p v-if="validationErrors.parent_id" class="mt-2 text-sm text-red-600">{{ validationErrors.parent_id }}</p>
          <p v-else-if="apiErrorsSafe.parent_id" class="mt-2 text-sm text-red-600">{{ apiErrorsSafe.parent_id[0] }}</p>
        </div>

        <!-- Trạng thái -->
        <div>
          <label for="status" class="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
          <select
            id="status"
            v-model="formData.status"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            :class="{ 'border-red-500 ring-2 ring-red-200': validationErrors.status || apiErrorsSafe.status }"
          >
            <option value="">-- Chọn trạng thái --</option>
            <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
          <p v-if="validationErrors.status" class="mt-2 text-sm text-red-600">{{ validationErrors.status }}</p>
          <p v-else-if="apiErrorsSafe.status" class="mt-2 text-sm text-red-600">{{ apiErrorsSafe.status[0] }}</p>
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
          <span v-else>{{ permission ? 'Cập nhật quyền' : 'Thêm quyền mới' }}</span>
        </button>
      </div>
    </form>
  </Modal>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import Modal from '@/components/Core/Modal/Modal.vue'
import SearchableSelect from '@/components/Core/Select/SearchableSelect.vue'
import { useFormValidation } from '@/composables/utils/useFormValidation'

const props = defineProps({
  show: Boolean,
  permission: Object,
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

// Đảm bảo luôn có object để tránh lỗi khi apiErrors là null
const apiErrorsSafe = computed(() => props.apiErrors || {})

// Form title
const formTitle = computed(() => props.permission ? 'Chỉnh sửa quyền' : 'Thêm quyền mới')

// Modal visibility
const modalVisible = computed({
  get: () => props.show,
  set: () => onClose()
})

// Form data
const formData = reactive({
  code: '',
  name: '',
  scope: 'context',
  parent_id: null,
  status: 'active'
})

// Form state
const isSubmitting = ref(false)

// Validation rules
const validationRules = computed(() => ({
  code: [
    { required: 'Mã code là bắt buộc' },
    { max: [120, 'Mã code không được vượt quá 120 ký tự'] }
  ],
  name: [
    { max: [150, 'Tên quyền không được vượt quá 150 ký tự'] }
  ]
}))

// Use form validation composable
const { validationErrors, clearErrors, validateForm } = useFormValidation(ref(formData), validationRules)

// API endpoint cho list permissions
const permissionsListApi = '/api/admin/permissions'

// Status options
const statusOptions = computed(() => {
  const options = [{ value: '', label: '-- Chọn trạng thái --' }]
  if (Array.isArray(props.statusEnums)) {
    props.statusEnums.forEach(item => {
      if (item && item.value !== undefined) {
        options.push({
          value: item.value,
          label: item.label || item.name
        })
      }
    })
  }
  return options
})

// Watch permission prop to update form data
watch(() => props.permission, (newVal) => {
  if (newVal) {
    formData.code = newVal.code || ''
    formData.name = newVal.name || ''
    formData.scope = newVal.scope || 'context'
    formData.parent_id = newVal.parent_id || null
    formData.status = newVal.status || 'active'
  } else {
    resetForm()
  }
}, { immediate: true })

// Reset form
function resetForm() {
  formData.code = ''
  formData.name = ''
  formData.scope = 'context'
  formData.parent_id = null
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
    // Tạo object data theo API spec
    const submitData = {
      code: formData.code,
      name: formData.name || null,
      scope: formData.scope || 'context',
      parent_id: formData.parent_id || null,
      status: formData.status || 'active'
    }
    
    // Chỉ gửi các trường có giá trị
    if (!submitData.name) {
      delete submitData.name
    }
    if (!submitData.parent_id) {
      delete submitData.parent_id
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
</script>
