<template>
  <Modal v-model="modalVisible" :title="formTitle" size="xl" :loading="isSubmitting">
    <div v-if="props.loading" class="flex justify-center items-center p-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span class="ml-2 text-gray-600">Đang tải dữ liệu...</span>
    </div>
    <form v-else @submit.prevent="validateAndSubmit" class="space-y-8" @click.stop>
      <!-- Thông tin vai trò -->
      <section class="space-y-4">
        <header class="border-b border-gray-200 pb-3 flex items-center gap-2">
          <span class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </span>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Thông tin vai trò</h3>
            <p class="text-sm text-gray-500">Nhập mã code, tên và trạng thái</p>
          </div>
        </header>

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
              :disabled="!!role"
              placeholder="Ví dụ: admin, manager, editor"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500 ring-2 ring-red-200': validationErrors.code || (apiErrors && apiErrors.code), 'bg-gray-100': !!role }"
            />
            <p v-if="validationErrors.code" class="mt-2 text-sm text-red-600">{{ validationErrors.code }}</p>
            <p v-else-if="apiErrors && apiErrors.code" class="mt-2 text-sm text-red-600">{{ Array.isArray(apiErrors.code) ? apiErrors.code[0] : apiErrors.code }}</p>
            <p v-if="role" class="mt-1 text-xs text-gray-500">Không thể thay đổi mã code sau khi tạo</p>
          </div>

          <!-- Tên vai trò -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-2">Tên vai trò</label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              placeholder="Ví dụ: Admin, Manager, Editor"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500 ring-2 ring-red-200': validationErrors.name || (apiErrors && apiErrors.name) }"
            />
            <p v-if="validationErrors.name" class="mt-2 text-sm text-red-600">{{ validationErrors.name }}</p>
            <p v-else-if="apiErrors && apiErrors.name" class="mt-2 text-sm text-red-600">{{ Array.isArray(apiErrors.name) ? apiErrors.name[0] : apiErrors.name }}</p>
          </div>
        </div>
      </section>

      <!-- Liên kết & trạng thái -->
      <section class="space-y-4">
        <header class="border-b border-gray-200 pb-3 flex items-center gap-2">
          <span class="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-4.553a1 1 0 00-1.414-1.414L13 8.172M5 13l-4.553 4.553a1 1 0 001.414 1.414L7 15.828"></path>
            </svg>
          </span>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Liên kết & trạng thái</h3>
            <p class="text-sm text-gray-500">Chọn vai trò cha và trạng thái</p>
          </div>
        </header>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Vai trò cha -->
          <div>
            <label for="parent_id" class="block text-sm font-medium text-gray-700 mb-2">Vai trò cha</label>
            <SearchableSelect
              v-model="formData.parent_id"
              :search-api="adminEndpoints.roles.list"
              placeholder="Tìm kiếm vai trò cha..."
              :error="validationErrors.parent_id || (apiErrors && apiErrors.parent_id)"
              :exclude-id="props.role?.id"
              label-field="name"
            />
            <p v-if="validationErrors.parent_id" class="mt-2 text-sm text-red-600">{{ validationErrors.parent_id }}</p>
            <p v-else-if="apiErrors && apiErrors.parent_id" class="mt-2 text-sm text-red-600">{{ Array.isArray(apiErrors.parent_id) ? apiErrors.parent_id[0] : apiErrors.parent_id }}</p>
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
              required="required"
            />
            <p v-if="validationErrors.status" class="mt-2 text-sm text-red-600">{{ validationErrors.status }}</p>
            <p v-else-if="apiErrors && apiErrors.status" class="mt-2 text-sm text-red-600">{{ Array.isArray(apiErrors.status) ? apiErrors.status[0] : apiErrors.status }}</p>
          </div>
        </div>
      </section>

      <!-- Contexts -->
      <section class="space-y-4">
        <header class="border-b border-gray-200 pb-3 flex items-center gap-2">
          <span class="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
          </span>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Contexts</h3>
            <p class="text-sm text-gray-500">Chọn contexts mà role này sẽ được gán (để trống nếu chỉ dành cho system admin)</p>
          </div>
        </header>

        <div>
          <label for="context_ids" class="block text-sm font-medium text-gray-700 mb-2">Contexts</label>
          <MultipleSelect
            v-model="formData.context_ids"
            :options="contextOptions"
            placeholder="Chọn contexts..."
            :error="validationErrors.context_ids || (apiErrors && apiErrors.context_ids)"
          />
          <p v-if="validationErrors.context_ids" class="mt-2 text-sm text-red-600">{{ validationErrors.context_ids }}</p>
          <p v-else-if="apiErrors && apiErrors.context_ids" class="mt-2 text-sm text-red-600">{{ Array.isArray(apiErrors.context_ids) ? apiErrors.context_ids[0] : apiErrors.context_ids }}</p>
          <p class="mt-1 text-xs text-gray-500">Nếu không chọn contexts, role này chỉ hiển thị cho system admin</p>
        </div>
      </section>

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
          <span v-else>{{ role ? 'Cập nhật vai trò' : 'Thêm vai trò mới' }}</span>
        </button>
      </div>


    </form>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch, onMounted } from 'vue'
import Modal from '@/components/Core/Modal/Modal.vue'
import SearchableSelect from '@/components/Core/Select/SearchableSelect.vue'
import SingleSelectEnhanced from '@/components/Core/Select/SingleSelectEnhanced.vue'
import MultipleSelect from '@/components/Core/Select/MultipleSelect.vue'
import { adminEndpoints } from '@/api/endpoints'
import { useApiClient } from '@/composables/api/useApiClient'
import { useFormValidation } from '@/composables/utils/useFormValidation'

const { apiClient } = useApiClient()

const props = defineProps({
  show: Boolean,
  role: Object,
  statusEnums: {
    type: Array,
    default: () => []
  },
  apiErrors: {
    type: Object,
    default: () => ({})
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit', 'cancel'])

// Status options từ props
const statusOptions = computed(() =>
  Array.isArray(props.statusEnums)
    ? props.statusEnums
        .filter(item => item != null)
        .map(item => ({
          value: item?.value ?? item?.id ?? '',
          label: item?.label ?? item?.name ?? ''
        }))
    : []
)


// Form title
const formTitle = computed(() => props.role ? 'Chỉnh sửa vai trò' : 'Thêm vai trò mới')

// Modal visibility
const modalVisible = computed({
  get: () => props.show,
  set: () => onClose()
})

// Form data
const formData = reactive({
  code: '',
  name: '',
  parent_id: null,
  status: 'active',
  context_ids: []
})

// Contexts
const contexts = ref([])
const contextOptions = computed(() => {
  return (contexts.value || []).map(ctx => ({
    value: ctx.id,
    label: `${ctx.name} (${ctx.type})`
  }))
})

// Form state
const isSubmitting = ref(false)

// Validation rules
const validationRules = computed(() => ({
  code: [
    { required: 'Mã code là bắt buộc' },
    { max: [100, 'Mã code không được vượt quá 100 ký tự'] }
  ],
  name: [
    { max: [150, 'Tên vai trò không được vượt quá 150 ký tự'] }
  ]
}))

// Use form validation composable
const { validationErrors, clearErrors, validateForm } = useFormValidation(ref(formData), validationRules)

// Watch role prop to update form data
watch(() => props.role, (newVal) => {
  if (newVal && typeof newVal === 'object') {
    formData.code = newVal?.code || ''
    formData.name = newVal?.name || ''
    formData.parent_id = newVal?.parent_id || null
    formData.status = newVal?.status || 'active'
    // Extract context_ids from contexts array or context_ids array
    if (newVal.context_ids && Array.isArray(newVal.context_ids)) {
      formData.context_ids = newVal.context_ids
    } else if (newVal.contexts && Array.isArray(newVal.contexts)) {
      formData.context_ids = newVal.contexts.map(ctx => ctx.id)
    } else {
      formData.context_ids = []
    }
  } else {
    resetForm()
  }
}, { immediate: true })

// Reset form
function resetForm() {
  formData.code = ''
  formData.name = ''
  formData.parent_id = null
  formData.status = 'active'
  formData.context_ids = []
  clearErrors()
}

// Load contexts
// Sử dụng GET /api/user/contexts (API vẫn hoạt động bình thường)
async function loadContexts() {
  try {
    const response = await apiClient.get('/api/admin/contexts')
    // Response format: array trực tiếp [...]
    let contextsData: any[] = []
    if (Array.isArray(response.data)) {
      contextsData = response.data
    } else if (response.data?.success && Array.isArray(response.data.data)) {
      contextsData = response.data.data
    } else if (Array.isArray(response.data?.data)) {
      contextsData = response.data.data
    }
    contexts.value = contextsData || []
  } catch (error) {
    contexts.value = []
  }
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
      parent_id: formData.parent_id || null,
      status: formData.status || 'active',
      context_ids: Array.isArray(formData.context_ids) && formData.context_ids.length > 0 ? formData.context_ids : undefined
    }
    
    // Chỉ gửi các trường có giá trị
    if (!submitData.name) {
      delete submitData.name
    }
    if (!submitData.parent_id) {
      delete submitData.parent_id
    }
    if (!submitData.context_ids) {
      delete submitData.context_ids
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

// Load contexts on mount
onMounted(() => {
  loadContexts()
})
</script>


<style>
.multiselect__tag, .multiselect__single, .multiselect__option {
  color: #222 !important;
  font-size: 14px !important;
  min-width: 40px;
}
/* Thêm scroll cho vùng tag khi tràn */
.multiselect__tags {
  max-height: 90px;
  overflow-y: auto;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
}
</style> 

