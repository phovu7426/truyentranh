<template>
  <Modal v-model="modalVisible" :title="formTitle" size="xl" :loading="loading">
    <FormWrapper
      :default-values="defaultValues"
      :rules="validationRules"
      :api-errors="apiErrors"
      :submit-text="attribute ? 'Cập nhật' : 'Thêm mới'"
      @submit="handleSubmit"
      @cancel="onClose"
    >
      <template #default="{ form, errors, clearError }">
        <div class="space-y-8">
          <!-- Thông tin thuộc tính -->
          <div class="space-y-6">
            <div class="border-b border-gray-200 pb-4">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                </svg>
                Thông tin thuộc tính
              </h3>
              <p class="text-sm text-gray-600 mt-1">Tên, mã code và loại thuộc tính</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="md:col-span-2">
                <FormField
                  v-model="form.name"
                  label="Tên thuộc tính"
                  name="name"
                  :error="errors.name"
                  required
                  @update:model-value="clearError('name')"
                />
              </div>

              <div>
                <FormField
                  v-model="form.code"
                  label="Mã code"
                  name="code"
                  :error="errors.code"
                  :disabled="!!attribute"
                  @update:model-value="clearError('code')"
                />
                <p v-if="attribute" class="mt-1 text-xs text-gray-500">Không thể thay đổi mã code sau khi tạo</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2" for="type">Loại thuộc tính</label>
                <SingleSelectEnhanced
                  v-model="form.type"
                  :options="typeOptions"
                  label-field="label"
                  value-field="value"
                  placeholder="-- Chọn loại thuộc tính --"
                  :error="errors.type"
                  required="required"
                />
                <p v-if="errors.type" class="mt-2 text-sm text-red-600">{{ errors.type }}</p>
              </div>
            </div>
          </div>

          <!-- Trạng thái -->
          <div class="space-y-6">
            <div class="border-b border-gray-200 pb-4">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                <svg class="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Trạng thái
              </h3>
              <p class="text-sm text-gray-600 mt-1">Thiết lập trạng thái hoạt động</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
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

<script setup>
import { computed } from 'vue'
import Modal from '@/components/Core/Modal/Modal.vue'
import FormWrapper from '@/components/Core/Form/FormWrapper.vue'
import FormField from '@/components/Core/Form/FormField.vue'
import SingleSelectEnhanced from '@/components/Core/Select/SingleSelectEnhanced.vue'

const props = defineProps({
  show: Boolean,
  attribute: Object,
  statusEnums: {
    type: Array,
    default: () => []
  },
  typeEnums: {
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

const formTitle = computed(() => props.attribute ? 'Chỉnh sửa thuộc tính' : 'Thêm thuộc tính mới')
const modalVisible = computed({
  get: () => props.show,
  set: () => onClose()
})

const defaultValues = computed(() => {
  const obj = props.attribute || {}
  
  return {
    name: obj.name || '',
    code: obj.code || obj.slug || '',
    type: obj.type || '',
    status: obj.status || 'active',
    ...obj
  }
})

const validationRules = computed(() => ({
  name: [
    { required: 'Tên thuộc tính là bắt buộc.' },
    { max: [255, 'Tên thuộc tính không được vượt quá 255 ký tự.'] }
  ],
  code: [
    { max: [255, 'Mã code không được vượt quá 255 ký tự.'] }
  ],
  type: [
    { required: 'Loại thuộc tính là bắt buộc.' }
  ],
  status: [
    { required: 'Trạng thái là bắt buộc.' }
  ]
}))

const statusOptions = computed(() => {
  if (!props.statusEnums || !Array.isArray(props.statusEnums)) return [
    { value: 'active', label: 'Hoạt động' },
    { value: 'inactive', label: 'Ngưng hoạt động' }
  ]
  return props.statusEnums.map(opt => ({
    value: opt.value ?? opt.id,
    label: opt.label ?? opt.name ?? String(opt.value ?? opt.id)
  }))
})

const typeOptions = computed(() => {
  if (!props.typeEnums || !Array.isArray(props.typeEnums)) return [
    { value: 'text', label: 'Text' },
    { value: 'select', label: 'Select' },
    { value: 'color', label: 'Color' },
    { value: 'image', label: 'Image' }
  ]
  return props.typeEnums.map(opt => ({
    value: opt.value ?? opt.id,
    label: opt.label ?? opt.name ?? String(opt.value ?? opt.id)
  }))
})

function handleSubmit(form) {
  emit('submit', form)
}

function onClose() {
  emit('cancel')
}
</script>

