<template>
  <Modal v-model="modalVisible" :title="formTitle" :loading="loading" size="xl">
    <FormWrapper
      :default-values="defaultValues"
      :rules="validationRules"
      :api-errors="apiErrors"
      :submit-text="tag ? 'Cập nhật' : 'Thêm mới'"
      @submit="handleSubmit"
      @cancel="onClose"
    >
      <template #default="{ form, errors, clearError, isSubmitting }">
        <div class="space-y-8">
          <!-- Thông tin thẻ -->
          <div class="space-y-6">
            <div class="border-b border-gray-200 pb-4">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                <svg class="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                </svg>
                Thông tin thẻ
              </h3>
              <p class="text-sm text-gray-600 mt-1">Tên, mô tả và trạng thái</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                v-model="form.name"
                label="Tên thẻ"
                name="name"
                :error="errors.name"
                required
                @update:model-value="clearError('name')"
              />

              <FormField
                v-model="form.status"
                label="Trạng thái"
                name="status"
                type="select"
                :options="statusOptions"
                :error="errors.status"
                @update:model-value="clearError('status')"
              />
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">Mô tả</label>
              <CKEditor
                v-model="form.description"
                :height="'180px'"
                :placeholder="'Nhập mô tả thẻ...'"
                :upload-url="'/api/upload/image'"
                :max-file-size="5242880"
                :allowed-image-types="['image/jpeg', 'image/png', 'image/gif', 'image/webp']"
                :show-word-count="true"
                :enable-full-screen="true"
              />
              <p v-if="errors.description" class="mt-1 text-sm text-red-600">{{ errors.description }}</p>
            </div>
          </div>

          <!-- SEO -->
          <div class="space-y-6">
            <div class="border-b border-gray-200 pb-4">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                <svg class="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                </svg>
                SEO
              </h3>
              <p class="text-sm text-gray-600 mt-1">Tối ưu hiển thị trên công cụ tìm kiếm</p>
            </div>

            <!-- SEO Configuration -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Meta Title -->
              <div>
                <label for="meta_title" class="block text-sm font-medium text-gray-700 mb-2">
                  Meta Title
                </label>
                <input
                  id="meta_title"
                  v-model="form.meta_title"
                  type="text"
                  placeholder="Tiêu đề SEO"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-md transition-all duration-200"
                  :class="{ 'border-red-500 ring-2 ring-red-200': errors.meta_title }"
                  @input="clearError('meta_title')"
                />
                <p v-if="errors.meta_title" class="mt-2 text-sm text-red-600">{{ errors.meta_title }}</p>
                <p class="text-xs text-gray-500 mt-1">Tiêu đề hiển thị trên công cụ tìm kiếm</p>
              </div>

              <!-- Canonical URL -->
              <div>
                <label for="canonical_url" class="block text-sm font-medium text-gray-700 mb-2">
                  Canonical URL
                </label>
                <input
                  id="canonical_url"
                  v-model="form.canonical_url"
                  type="url"
                  placeholder="https://example.com/page"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-md transition-all duration-200"
                  :class="{ 'border-red-500 ring-2 ring-red-200': errors.canonical_url }"
                  @input="clearError('canonical_url')"
                />
                <p v-if="errors.canonical_url" class="mt-2 text-sm text-red-600">{{ errors.canonical_url }}</p>
                <p class="text-xs text-gray-500 mt-1">URL chính thức để tránh nội dung trùng lặp</p>
              </div>
            </div>

            <!-- Meta Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
              <div @click.stop>
                <CKEditor
                  id="meta_description"
                  v-model="form.meta_description"
                  placeholder="Mô tả SEO"
                  :height="'120px'"
                  :should-group-when-full="false"
                  :show-word-count="true"
                  :show-char-count="false"
                  :upload-url="'/api/admin/upload/image'"
                  :max-file-size="5 * 1024 * 1024"
                  :allowed-image-types="['image/jpeg', 'image/png', 'image/gif', 'image/webp']"
                  :auto-save="false"
                  :language="'vi'"
                />
              </div>
              <p v-if="errors.meta_description" class="mt-2 text-sm text-red-600">{{ errors.meta_description }}</p>
              <p class="text-xs text-gray-500 mt-1">Mô tả hiển thị trên công cụ tìm kiếm</p>
            </div>
          </div>
        </div>
      </template>
    </FormWrapper>
  </Modal>
</template>

<script setup>
import { computed } from 'vue'
import Modal from '@/components/Core/Modal/Modal.vue'
import FormWrapper from '@/components/Core/Form/FormWrapper.vue'
import FormField from '@/components/Core/Form/FormField.vue'
import CKEditor from '@/components/Core/Content/CKEditor.vue'

const props = defineProps({
  show: Boolean,
  tag: Object,
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

const formTitle = computed(() => props.tag ? 'Chỉnh sửa thẻ' : 'Thêm thẻ mới')
const modalVisible = computed({
  get: () => props.show,
  set: () => onClose()
})

const defaultValues = computed(() => {
  const obj = props.tag || {}
  
  return {
    name: obj.name || '',
    description: obj.description || '',
    meta_title: obj.meta_title || '',
    meta_description: obj.meta_description || '',
    canonical_url: obj.canonical_url || '',
    status: obj.status || 'active'
  }
})



const validationRules = computed(() => ({
  name: [
    { required: 'Tên thẻ là bắt buộc.' },
    { max: [255, 'Tên thẻ không được vượt quá 255 ký tự.'] }
  ],
  description: [
    { max: [500, 'Mô tả không được vượt quá 500 ký tự.'] }
  ],
  meta_title: [
    { max: [255, 'Meta title không được vượt quá 255 ký tự.'] }
  ],
  meta_description: [
    { max: [500, 'Meta description không được vượt quá 500 ký tự.'] }
  ],
  canonical_url: [
    { max: [255, 'Canonical URL không được vượt quá 255 ký tự.'] }
  ]
}))

const statusOptions = computed(() =>
  (props.statusEnums || []).map(opt => ({
    value: opt.value,
    label: opt.label
  }))
)

function handleSubmit(form) {
  // Loại bỏ slug khỏi dữ liệu gửi lên server (backend tự sinh)
  const { slug, ...formData } = form
  emit('submit', formData)
}

function onClose() {
  emit('cancel')
}
</script>
