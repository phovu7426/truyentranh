<template>
  <Modal v-model="modalVisible" :title="formTitle" :loading="loading" size="xl">
    <FormWrapper
      :default-values="defaultValues"
      :rules="validationRules"
      :api-errors="apiErrors"
      :submit-text="comic ? 'Cập nhật' : 'Thêm mới'"
      @submit="handleSubmit"
      @cancel="onClose"
    >
      <template #default="{ form, errors, clearError, isSubmitting }">
        <div class="space-y-6">
          <!-- Thông tin truyện -->
          <div class="space-y-4">
            <div class="border-b border-gray-200 pb-4">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                <svg class="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                Thông tin truyện
              </h3>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2">
                <FormField
                  v-model="form.title"
                  label="Tiêu đề"
                  name="title"
                  :error="errors.title"
                  required
                  @update:model-value="clearError('title')"
                />
              </div>

              <div class="md:col-span-2">
                <FormField
                  v-model="form.slug"
                  label="Slug (URL)"
                  name="slug"
                  :error="errors.slug"
                  placeholder="Để trống để tự động tạo từ tiêu đề"
                  @update:model-value="clearError('slug')"
                />
              </div>

              <div class="md:col-span-2 space-y-2">
                <label class="block text-sm font-medium text-gray-700">Mô tả</label>
                <textarea
                  v-model="form.description"
                  rows="4"
                  placeholder="Nhập mô tả truyện..."
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  :class="{ 'border-red-500 ring-2 ring-red-200': errors.description }"
                  @input="clearError('description')"
                />
                <p v-if="errors.description" class="mt-1 text-sm text-red-600">{{ errors.description }}</p>
              </div>

              <FormField
                v-model="form.author"
                label="Tác giả"
                name="author"
                :error="errors.author"
                @update:model-value="clearError('author')"
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

              <div class="md:col-span-2 space-y-2">
                <label class="block text-sm font-medium text-gray-700">Danh mục</label>
                <MultipleSelectEnhanced
                  v-model="form.category_ids"
                  :search-api="categorySearchApi"
                  label-field="name"
                  value-field="id"
                  placeholder="Chọn danh mục..."
                  :error="errors.category_ids"
                />
                <p v-if="errors.category_ids" class="mt-1 text-sm text-red-600">{{ errors.category_ids }}</p>
              </div>
            </div>
          </div>
        </div>
      </template>
    </FormWrapper>
  </Modal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Modal from '@/components/Core/Modal/Modal.vue'
import FormWrapper from '@/components/Core/Form/FormWrapper.vue'
import FormField from '@/components/Core/Form/FormField.vue'
import MultipleSelectEnhanced from '@/components/Core/Select/MultipleSelectEnhanced.vue'
import { adminEndpoints } from '@/api/endpoints'

const props = defineProps({
  show: Boolean,
  comic: Object,
  statusEnums: {
    type: Array,
    default: () => []
  },
  categoryEnums: {
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

const formTitle = computed(() => props.comic ? 'Chỉnh sửa truyện' : 'Thêm truyện mới')
const modalVisible = computed({
  get: () => props.show,
  set: () => onClose()
})

const defaultValues = computed(() => {
  const obj = props.comic || {}
  
  // Ưu tiên dùng category_ids nếu có, nếu không thì map từ categories
  let categoryIds: number[] = []
  if (obj.category_ids && Array.isArray(obj.category_ids) && obj.category_ids.length > 0) {
    categoryIds = obj.category_ids
  } else if (obj.categories && Array.isArray(obj.categories) && obj.categories.length > 0) {
    categoryIds = obj.categories.map((c: any) => c.id)
  }
  
  return {
    title: obj.title || '',
    slug: obj.slug || '',
    description: obj.description || '',
    author: obj.author || '',
    status: obj.status || 'draft',
    category_ids: categoryIds,
    ...obj
  }
})

const validationRules = computed(() => ({
  title: [
    { required: 'Tiêu đề là bắt buộc.' },
    { max: [255, 'Tiêu đề không được vượt quá 255 ký tự.'] }
  ],
  slug: [
    { max: [255, 'Slug không được vượt quá 255 ký tự.'] }
  ],
  author: [
    { max: [255, 'Tác giả không được vượt quá 255 ký tự.'] }
  ],
  description: []
}))

const statusOptions = computed(() => {
  const options = props.statusEnums?.map((opt: any) => ({
    value: opt.value,
    label: opt.label || opt.name
  })) || []
  return options
})

const categorySearchApi = computed(() => {
  return adminEndpoints.comicCategories.list
})

function handleSubmit(form: any) {
  // Nếu slug rỗng, không gửi lên (để API tự sinh)
  const formData = { ...form }
  if (!formData.slug || formData.slug.trim() === '') {
    delete formData.slug
  }
  emit('submit', formData)
}

function onClose() {
  emit('cancel')
}
</script>

