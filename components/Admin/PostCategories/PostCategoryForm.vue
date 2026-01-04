<template>
  <Modal v-model="modalVisible" :title="formTitle" :loading="loading" size="xl">
    <FormWrapper
      :default-values="defaultValues"
      :rules="validationRules"
      :api-errors="apiErrors"
      :submit-text="category ? 'Cập nhật' : 'Thêm mới'"
      @submit="handleSubmit"
      @cancel="onClose"
    >
      <template #default="{ form, errors, clearError, isSubmitting }">
        <div class="space-y-8">
          <!-- Thông tin danh mục -->
          <div class="space-y-6">
            <div class="border-b border-gray-200 pb-4">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                <svg class="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path>
                </svg>
                Thông tin danh mục
              </h3>
              <p class="text-sm text-gray-600 mt-1">Tên, mô tả và hình ảnh danh mục</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="md:col-span-2">
                <FormField
                  v-model="form.name"
                  label="Tên danh mục"
                  name="name"
                  :error="errors.name"
                  required
                  @update:model-value="clearError('name')"
                />
              </div>

              <div class="md:col-span-2 space-y-2">
                <label class="block text-sm font-medium text-gray-700">Mô tả</label>
                <CKEditor
                  v-model="form.description"
                  :height="'200px'"
                  :placeholder="'Nhập mô tả danh mục...'"
                  :upload-url="'/api/upload/image'"
                  :max-file-size="5242880"
                  :allowed-image-types="['image/jpeg', 'image/png', 'image/gif', 'image/webp']"
                  :show-word-count="true"
                  :enable-full-screen="true"
                />
                <p v-if="errors.description" class="mt-1 text-sm text-red-600">{{ errors.description }}</p>
              </div>

              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700 mb-1" for="category-image">Ảnh danh mục</label>
                <ImageUploader
                  v-model="form.image"
                  :default-url="imageUrl"
                  @remove="form.remove_image = true"
                />
              </div>

              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700 mb-1" for="og-image">OG Image</label>
                <ImageUploader
                  v-model="form.og_image"
                  :default-url="ogImageUrl"
                  @remove="form.remove_og_image = true"
                />
              </div>
            </div>
          </div>

          <!-- Phân loại & trạng thái -->
          <div class="space-y-6">
            <div class="border-b border-gray-200 pb-4">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                Phân loại & hiển thị
              </h3>
              <p class="text-sm text-gray-600 mt-1">Thiết lập trạng thái và thứ tự hiển thị</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                v-model="form.status"
                label="Trạng thái"
                name="status"
                type="select"
                :options="statusOptions"
                :error="errors.status"
                @update:model-value="clearError('status')"
              />

              <FormField
                v-model="form.sort_order"
                label="Thứ tự sắp xếp"
                name="sort_order"
                type="number"
                :error="errors.sort_order"
                @update:model-value="clearError('sort_order')"
              />

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2" for="parent_id">Danh mục cha</label>
                <SingleSelectEnhanced
                  v-model="form.parent_id"
                  :search-api="searchApi"
                  label-field="name"
                  value-field="id"
                  placeholder="-- Chọn danh mục cha --"
                  :error="errors.parent_id"
                />
                <p v-if="errors.parent_id" class="mt-2 text-sm text-red-600">{{ errors.parent_id }}</p>
                <p class="text-xs text-gray-500 mt-1">Chọn danh mục cha để tạo cấu trúc phân cấp</p>
              </div>
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
import ImageUploader from '@/components/Core/Image/ImageUploader.vue'
import SingleSelectEnhanced from '@/components/Core/Select/SingleSelectEnhanced.vue'
import CKEditor from '@/components/Core/Content/CKEditor.vue'
import { adminEndpoints } from '@/api/endpoints'
// 
const props = defineProps({
  show: Boolean,
  category: Object,
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

const formTitle = computed(() => props.category ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới')
const modalVisible = computed({
  get: () => props.show,
  set: () => onClose()
})

const defaultValues = computed(() => {
  const obj = props.category || {}
  
  return {
    name: obj.name || '',
    description: obj.description || '',
    image: obj.image || null,
    status: obj.status || 'active',
    sort_order: obj.sort_order || 0,
    parent_id: obj.parent_id || null,
    meta_title: obj.meta_title || '',
    meta_description: obj.meta_description || '',
    canonical_url: obj.canonical_url || '',
    og_image: obj.og_image || null,
    remove_image: false,
    remove_og_image: false,
    ...obj
  }
})

const imageUrl = computed(() => {
  if (props.category?.image) {
    return props.category.image
  }
  return null
})

const ogImageUrl = computed(() => {
  if (props.category?.og_image) {
    return props.category.og_image
  }
  return null
})

const validationRules = computed(() => ({
  name: [
    { required: 'Tên danh mục là bắt buộc.' },
    { max: [255, 'Tên danh mục không được vượt quá 255 ký tự.'] }
  ],
  description: [
    { max: [500, 'Mô tả không được vượt quá 500 ký tự.'] }
  ],
  sort_order: [
    { min: [0, 'Thứ tự sắp xếp phải lớn hơn hoặc bằng 0.'] }
  ],
  meta_title: [
    { max: [255, 'Meta title không được vượt quá 255 ký tự.'] }
  ],
  meta_description: [
    { max: [500, 'Meta description không được vượt quá 500 ký tự.'] }
  ],
  canonical_url: [
    { max: [500, 'Canonical URL không được vượt quá 500 ký tự.'] }
  ]
}))

const statusOptions = computed(() =>
  (props.statusEnums || []).map(opt => ({
    value: opt.value,
    label: opt.label
  }))
)

const searchApi = computed(() => {
  // API endpoint để tìm kiếm danh mục cha
  return adminEndpoints.postCategories.list
})

function handleSubmit(form) {
  // Loại bỏ slug khỏi dữ liệu gửi lên server (backend tự sinh)
  const { slug, ...formData } = form
  emit('submit', formData)
}

function onClose() {
  emit('cancel')
}
</script>
