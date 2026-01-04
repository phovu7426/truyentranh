<template>
  <Modal v-model="modalVisible" :title="formTitle" size="xl" :loading="isSubmitting">
    <div v-if="props.loading" class="flex justify-center items-center p-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span class="ml-2 text-gray-600">Đang tải dữ liệu...</span>
    </div>
    <form v-else @submit.prevent="validateAndSubmit" class="space-y-8" @click.stop>
      <!-- Thông tin group -->
      <section class="space-y-4">
        <header class="border-b border-gray-200 pb-3 flex items-center gap-2">
          <span class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </span>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Thông tin group</h3>
            <p class="text-sm text-gray-500">Nhập loại, mã code, tên và mô tả</p>
          </div>
        </header>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Loại group -->
          <div>
            <label for="type" class="block text-sm font-medium text-gray-700 mb-2">
              Loại group <span class="text-red-500">*</span>
            </label>
            <input
              id="type"
              v-model="formData.type"
              type="text"
              :disabled="!!group"
              placeholder="Ví dụ: shop, team, project, department..."
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500 ring-2 ring-red-200': validationErrors.type || (apiErrors && apiErrors.type), 'bg-gray-100': !!group }"
            />
            <p v-if="validationErrors.type" class="mt-2 text-sm text-red-600">{{ validationErrors.type }}</p>
            <p v-else-if="apiErrors && apiErrors.type" class="mt-2 text-sm text-red-600">{{ Array.isArray(apiErrors.type) ? apiErrors.type[0] : apiErrors.type }}</p>
            <p v-if="group" class="mt-1 text-xs text-gray-500">Không thể thay đổi loại group sau khi tạo</p>
          </div>

          <!-- Context -->
          <div>
            <label for="context_id" class="block text-sm font-medium text-gray-700 mb-2">
              Context <span class="text-red-500">*</span>
            </label>
            <SingleSelectEnhanced
              v-model="formData.context_id"
              :options="contextOptions"
              label-field="label"
              value-field="value"
              placeholder="-- Chọn context --"
              :error="validationErrors.context_id || (apiErrors && apiErrors.context_id)"
              :disabled="!!group"
            />
            <p v-if="validationErrors.context_id" class="mt-2 text-sm text-red-600">{{ validationErrors.context_id }}</p>
            <p v-else-if="apiErrors && apiErrors.context_id" class="mt-2 text-sm text-red-600">{{ Array.isArray(apiErrors.context_id) ? apiErrors.context_id[0] : apiErrors.context_id }}</p>
            <p v-if="group" class="mt-1 text-xs text-gray-500">Không thể thay đổi context sau khi tạo</p>
            <p v-else class="mt-1 text-xs text-gray-500">Chọn context có sẵn. Nếu chưa có, hãy tạo context trước.</p>
          </div>

          <!-- Mã code -->
          <div>
            <label for="code" class="block text-sm font-medium text-gray-700 mb-2">
              Mã code <span class="text-red-500">*</span>
            </label>
            <input
              id="code"
              v-model="formData.code"
              type="text"
              :disabled="!!group"
              placeholder="Ví dụ: shop-001, team-dev, project-abc"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500 ring-2 ring-red-200': validationErrors.code || (apiErrors && apiErrors.code), 'bg-gray-100': !!group }"
            />
            <p v-if="validationErrors.code" class="mt-2 text-sm text-red-600">{{ validationErrors.code }}</p>
            <p v-else-if="apiErrors && apiErrors.code" class="mt-2 text-sm text-red-600">{{ Array.isArray(apiErrors.code) ? apiErrors.code[0] : apiErrors.code }}</p>
            <p v-if="group" class="mt-1 text-xs text-gray-500">Không thể thay đổi mã code sau khi tạo</p>
          </div>

          <!-- Tên group -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
              Tên group <span class="text-red-500">*</span>
            </label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              placeholder="Ví dụ: Shop A, Development Team, Project ABC"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500 ring-2 ring-red-200': validationErrors.name || (apiErrors && apiErrors.name) }"
            />
            <p v-if="validationErrors.name" class="mt-2 text-sm text-red-600">{{ validationErrors.name }}</p>
            <p v-else-if="apiErrors && apiErrors.name" class="mt-2 text-sm text-red-600">{{ Array.isArray(apiErrors.name) ? apiErrors.name[0] : apiErrors.name }}</p>
          </div>

          <!-- Mô tả -->
          <div>
            <label for="description" class="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
            <textarea
              id="description"
              v-model="formData.description"
              rows="3"
              placeholder="Nhập mô tả về group..."
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500 ring-2 ring-red-200': validationErrors.description || (apiErrors && apiErrors.description) }"
            />
            <p v-if="validationErrors.description" class="mt-2 text-sm text-red-600">{{ validationErrors.description }}</p>
            <p v-else-if="apiErrors && apiErrors.description" class="mt-2 text-sm text-red-600">{{ Array.isArray(apiErrors.description) ? apiErrors.description[0] : apiErrors.description }}</p>
          </div>
        </div>
      </section>

      <!-- Metadata -->
      <section class="space-y-4" v-if="formData.type">
        <header class="border-b border-gray-200 pb-3 flex items-center gap-2">
          <span class="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </span>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Thông tin bổ sung</h3>
            <p class="text-sm text-gray-500">Metadata cho {{ getTypeLabel(formData.type) }}</p>
          </div>
        </header>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4" v-if="formData.type === 'shop'">
          <div>
            <label for="metadata_address" class="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
            <input
              id="metadata_address"
              v-model="formData.metadata.address"
              type="text"
              placeholder="Nhập địa chỉ..."
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label for="metadata_phone" class="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
            <input
              id="metadata_phone"
              v-model="formData.metadata.phone"
              type="text"
              placeholder="Nhập số điện thoại..."
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label for="metadata_email" class="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              id="metadata_email"
              v-model="formData.metadata.email"
              type="email"
              placeholder="Nhập email..."
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4" v-else-if="formData.type === 'team'">
          <div>
            <label for="metadata_leader" class="block text-sm font-medium text-gray-700 mb-2">Leader</label>
            <input
              id="metadata_leader"
              v-model="formData.metadata.leader"
              type="text"
              placeholder="Nhập tên leader..."
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label for="metadata_members_count" class="block text-sm font-medium text-gray-700 mb-2">Số lượng members</label>
            <input
              id="metadata_members_count"
              v-model.number="formData.metadata.members_count"
              type="number"
              min="0"
              placeholder="Nhập số lượng..."
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div v-else>
          <label for="metadata_json" class="block text-sm font-medium text-gray-700 mb-2">Metadata (JSON)</label>
          <textarea
            id="metadata_json"
            v-model="metadataJson"
            rows="4"
            placeholder='{"key": "value"}'
            class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            @blur="parseMetadataJson"
          />
          <p class="mt-1 text-xs text-gray-500">Nhập metadata dưới dạng JSON</p>
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
          <span v-else>{{ group ? 'Cập nhật group' : 'Thêm group mới' }}</span>
        </button>
      </div>
    </form>
  </Modal>
</template>

<script setup>
import { ref, computed, reactive, watch, onMounted } from 'vue'
import Modal from '@/components/Core/Modal/Modal.vue'
import SingleSelectEnhanced from '@/components/Core/Select/SingleSelectEnhanced.vue'
import { useFormValidation } from '@/composables/utils/useFormValidation'
import { useApiClient } from '@/composables/api/useApiClient'
import { adminEndpoints } from '@/api/endpoints'

const props = defineProps({
  show: Boolean,
  group: Object,
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

// Form title
const formTitle = computed(() => props.group ? 'Chỉnh sửa group' : 'Thêm group mới')

// Modal visibility
const modalVisible = computed({
  get: () => props.show,
  set: () => onClose()
})

// API client
const { apiClient } = useApiClient()

// Contexts
const contexts = ref([])
const contextOptions = computed(() => {
  return (contexts.value || []).map(ctx => ({
    value: ctx.id,
    label: `${ctx.name} (${ctx.type})`
  }))
})

// Form data
const formData = reactive({
  type: '',
  context_id: null,
  code: '',
  name: '',
  description: '',
  metadata: {}
})

// Metadata JSON string for editing
const metadataJson = ref('')

// Form state
const isSubmitting = ref(false)

// Validation rules
const validationRules = computed(() => ({
  type: [
    { required: 'Loại group là bắt buộc' }
  ],
  context_id: props.group ? [] : [
    { required: 'Context là bắt buộc' }
  ],
  code: [
    { required: 'Mã code là bắt buộc' },
    { max: [100, 'Mã code không được vượt quá 100 ký tự'] }
  ],
  name: [
    { required: 'Tên group là bắt buộc' },
    { max: [255, 'Tên group không được vượt quá 255 ký tự'] }
  ],
  description: [
    { max: [500, 'Mô tả không được vượt quá 500 ký tự'] }
  ]
}))

// Use form validation composable
const { validationErrors, clearErrors, validateForm } = useFormValidation(ref(formData), validationRules)

// Load contexts
async function loadContexts() {
  try {
    const response = await apiClient.get(adminEndpoints.contexts.list + '?limit=1000')
    let contextsData = []
    if (response.data?.success && Array.isArray(response.data.data)) {
      contextsData = response.data.data
    } else if (Array.isArray(response.data)) {
      contextsData = response.data
    } else if (Array.isArray(response.data?.data)) {
      contextsData = response.data.data
    }
    contexts.value = contextsData || []
  } catch (error) {
    contexts.value = []
  }
}

// Watch group prop to update form data
watch(() => props.group, (newVal) => {
  if (newVal && typeof newVal === 'object') {
    formData.type = newVal?.type || ''
    formData.context_id = newVal?.context_id || null
    formData.code = newVal?.code || ''
    formData.name = newVal?.name || ''
    formData.description = newVal?.description || ''
    formData.metadata = newVal?.metadata ? { ...newVal.metadata } : {}
    metadataJson.value = JSON.stringify(formData.metadata, null, 2)
  } else {
    resetForm()
  }
}, { immediate: true })

// Reset form
function resetForm() {
  formData.type = ''
  formData.context_id = null
  formData.code = ''
  formData.name = ''
  formData.description = ''
  formData.metadata = {}
  metadataJson.value = ''
  clearErrors()
}

// Load contexts on mount
onMounted(() => {
  loadContexts()
})

// Parse metadata JSON
function parseMetadataJson() {
  try {
    if (metadataJson.value.trim()) {
      formData.metadata = JSON.parse(metadataJson.value)
    } else {
      formData.metadata = {}
    }
  } catch (e) {
    // Invalid JSON, keep current metadata
  }
}

// Get type label
function getTypeLabel(type) {
  if (!type) return type
  // Capitalize first letter
  return type.charAt(0).toUpperCase() + type.slice(1)
}

// Validate and submit form
function validateAndSubmit() {
  if (!validateForm()) {
    return
  }
  
  isSubmitting.value = true
  
  try {
    // Prepare metadata based on type
    let metadata = {}
    if (formData.type === 'shop') {
      metadata = {
        address: formData.metadata.address || undefined,
        phone: formData.metadata.phone || undefined,
        email: formData.metadata.email || undefined
      }
      // Remove undefined values
      Object.keys(metadata).forEach(key => metadata[key] === undefined && delete metadata[key])
    } else if (formData.type === 'team') {
      metadata = {
        leader: formData.metadata.leader || undefined,
        members_count: formData.metadata.members_count || undefined
      }
      Object.keys(metadata).forEach(key => metadata[key] === undefined && delete metadata[key])
    } else if (formData.metadata && Object.keys(formData.metadata).length > 0) {
      metadata = formData.metadata
    }

    // Create submit data
    const submitData = {
      type: formData.type,
      code: formData.code,
      name: formData.name
    }

    // context_id là bắt buộc khi tạo mới
    if (!props.group && formData.context_id) {
      submitData.context_id = formData.context_id
    }

    if (formData.description) {
      submitData.description = formData.description
    }

    if (Object.keys(metadata).length > 0) {
      submitData.metadata = metadata
    }

    // For update, only send allowed fields (name, description, metadata)
    if (props.group) {
      const updateData = {}
      if (formData.name) updateData.name = formData.name
      if (formData.description !== undefined) updateData.description = formData.description
      if (Object.keys(metadata).length > 0) updateData.metadata = metadata
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

