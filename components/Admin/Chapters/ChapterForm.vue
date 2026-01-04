<template>
  <Modal v-model="modalVisible" :title="formTitle" :loading="loading" size="lg">
    <FormWrapper
      :default-values="defaultValues"
      :rules="validationRules"
      :api-errors="apiErrors"
      :submit-text="chapter ? 'Cập nhật' : 'Thêm mới'"
      @submit="handleSubmit"
      @cancel="onClose"
    >
      <template #default="{ form, errors, clearError, isSubmitting }">
        <div class="space-y-6">
          <!-- Thông tin chương -->
          <div class="space-y-4">
            <div class="border-b border-gray-200 pb-4">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                <svg class="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Thông tin chương
              </h3>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Truyện *</label>
                <SingleSelectEnhanced
                  v-model="form.comic_id"
                  :search-api="comicSearchApi"
                  label-field="title"
                  value-field="id"
                  placeholder="Chọn truyện..."
                  :error="errors.comic_id"
                  :disabled="!!chapter"
                />
                <p v-if="errors.comic_id" class="mt-1 text-sm text-red-600">{{ errors.comic_id }}</p>
              </div>

              <div class="md:col-span-2">
                <FormField
                  v-model="form.title"
                  label="Tiêu đề chương"
                  name="title"
                  :error="errors.title"
                  required
                  @update:model-value="clearError('title')"
                />
              </div>

              <FormField
                v-model="form.chapter_index"
                label="Số thứ tự chương"
                name="chapter_index"
                type="number"
                :error="errors.chapter_index"
                required
                :min="1"
                @update:model-value="clearError('chapter_index')"
              />

              <FormField
                v-model="form.chapter_label"
                label="Nhãn chương"
                name="chapter_label"
                :error="errors.chapter_label"
                placeholder="VD: Chapter 1, Ep. 1"
                @update:model-value="clearError('chapter_label')"
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
import SingleSelectEnhanced from '@/components/Core/Select/SingleSelectEnhanced.vue'
import { adminEndpoints } from '@/api/endpoints'

const props = defineProps({
  show: Boolean,
  chapter: Object,
  statusEnums: {
    type: Array,
    default: () => []
  },
  comicEnums: {
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

const formTitle = computed(() => props.chapter ? 'Chỉnh sửa chương' : 'Thêm chương mới')
const modalVisible = computed({
  get: () => props.show,
  set: () => onClose()
})

const defaultValues = computed(() => {
  const obj = props.chapter || {}
  
  return {
    comic_id: obj.comic_id || obj.comic?.id || null,
    title: obj.title || '',
    chapter_index: obj.chapter_index || 1,
    chapter_label: obj.chapter_label || '',
    status: obj.status || 'draft',
    ...obj
  }
})

const validationRules = computed(() => ({
  comic_id: [
    { required: 'Truyện là bắt buộc.' }
  ],
  title: [
    { required: 'Tiêu đề chương là bắt buộc.' },
    { max: [255, 'Tiêu đề chương không được vượt quá 255 ký tự.'] }
  ],
  chapter_index: [
    { required: 'Số thứ tự chương là bắt buộc.' },
    { min: [1, 'Số thứ tự chương phải lớn hơn hoặc bằng 1.'] }
  ],
  chapter_label: [
    { max: [50, 'Nhãn chương không được vượt quá 50 ký tự.'] }
  ]
}))

const statusOptions = computed(() => {
  const options = props.statusEnums?.map((opt: any) => ({
    value: opt.value,
    label: opt.label || opt.name
  })) || []
  return options
})

const comicSearchApi = computed(() => {
  return adminEndpoints.comics.simple || adminEndpoints.comics.list
})

function handleSubmit(form) {
  emit('submit', form)
}

function onClose() {
  emit('cancel')
}
</script>

