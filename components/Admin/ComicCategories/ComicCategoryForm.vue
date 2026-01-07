<template>
  <Modal v-model="modalVisible" :title="formTitle" :loading="loading" size="lg">
    <FormWrapper
      :default-values="defaultValues"
      :rules="validationRules"
      :api-errors="apiErrors"
      :submit-text="category ? 'Cập nhật' : 'Thêm mới'"
      @submit="handleSubmit"
      @cancel="onClose"
    >
      <template #default="{ form, errors, clearError, isSubmitting }">
        <div class="space-y-6">
          <!-- Thông tin danh mục -->
          <div class="space-y-4">
            <div class="border-b border-gray-200 pb-4">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                <svg class="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path>
                </svg>
                Thông tin danh mục
              </h3>
            </div>

            <div class="space-y-4">
              <FormField
                v-model="form.name"
                label="Tên danh mục"
                name="name"
                :error="errors.name"
                required
                @update:model-value="clearError('name')"
              />

              <FormField
                v-model="form.slug"
                label="Slug (URL)"
                name="slug"
                :error="errors.slug"
                placeholder="Để trống để tự động tạo từ tên"
                @update:model-value="clearError('slug')"
              />

              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">Mô tả</label>
                <textarea
                  v-model="form.description"
                  rows="4"
                  placeholder="Nhập mô tả danh mục..."
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  :class="{ 'border-red-500 ring-2 ring-red-200': errors.description }"
                  @input="clearError('description')"
                />
                <p v-if="errors.description" class="mt-1 text-sm text-red-600">{{ errors.description }}</p>
              </div>
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

const props = defineProps({
  show: Boolean,
  category: Object,
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
    slug: obj.slug || '',
    description: obj.description || '',
    ...obj
  }
})

const validationRules = computed(() => ({
  name: [
    { required: 'Tên danh mục là bắt buộc.' },
    { max: [255, 'Tên danh mục không được vượt quá 255 ký tự.'] }
  ],
  slug: [
    { max: [255, 'Slug không được vượt quá 255 ký tự.'] }
  ],
  description: []
}))

function handleSubmit(form) {
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



