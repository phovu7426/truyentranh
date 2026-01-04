<template>
  <Modal v-model="modalVisible" :title="formTitle" :loading="loading">
    <FormWrapper
      ref="formRef"
      :default-values="defaultValues"
      :rules="validationRules"
      :api-errors="apiErrors"
      :submit-text="value ? 'Cập nhật' : 'Thêm mới'"
      @submit="handleSubmit"
      @cancel="onClose"
    >
      <template #default="{ form, errors, clearError }">
        <div class="space-y-6">
          <!-- Thuộc tính -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Thuộc tính</label>
            <SearchableSelect
              v-model="form.product_attribute_id"
              :search-api="attributeApi"
              label-field="name"
              value-field="id"
              placeholder="Chọn thuộc tính"
              :error="errors.product_attribute_id"
              @change="handleAttributeChange"
              @update:model-value="clearError('product_attribute_id')"
            />
            <div v-if="errors.product_attribute_id" class="mt-1 text-sm text-red-600">{{ errors.product_attribute_id }}</div>
            <div v-if="selectedAttribute" class="mt-2 text-xs text-gray-500 flex items-center space-x-2">
              <span class="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium">
                {{ selectedAttribute.name }}
              </span>
              <span v-if="selectedAttribute.type" class="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 uppercase text-[11px] tracking-wide">
                {{ selectedAttribute.type }}
              </span>
            </div>
          </div>

          <!-- Giá trị -->
          <FormField
            v-model="form.value"
            label="Giá trị hiển thị"
            name="value"
            required
            :error="errors.value"
            @update:model-value="clearError('value')"
          />

          <!-- Mã màu -->
          <div v-if="requiresColorInput" class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">Mã màu (#RRGGBB)</label>
            <div class="flex items-center space-x-3">
              <input
                v-model="form.color_code"
                type="color"
                class="h-10 w-16 border border-gray-200 rounded cursor-pointer"
                @input="clearError('color_code')"
              />
              <input
                v-model="form.color_code"
                type="text"
                placeholder="#FFFFFF"
                maxlength="7"
                class="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                :class="{ 'border-red-500': errors.color_code }"
                @input="handleColorInput"
              />
            </div>
            <p class="text-xs text-gray-500">Nhập mã màu hợp lệ theo định dạng #RRGGBB.</p>
            <p v-if="errors.color_code" class="text-sm text-red-600">{{ errors.color_code }}</p>
          </div>

          <!-- Ảnh minh họa -->
          <div v-if="requiresImageInput">
            <label class="block text-sm font-medium text-gray-700 mb-2">Ảnh minh họa</label>
            <ImageUploader
              v-model="form.image"
              :default-url="imagePreview"
              @remove="form.image = null"
            />
            <p class="text-xs text-gray-500 mt-1">Upload ảnh hoặc chọn từ media library trước khi lưu.</p>
            <p v-if="errors.image" class="text-sm text-red-600">{{ errors.image }}</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Thứ tự sắp xếp -->
            <FormField
              v-model="form.sort_order"
              label="Thứ tự sắp xếp"
              name="sort_order"
              type="number"
              min="0"
              :error="errors.sort_order"
              @update:model-value="clearError('sort_order')"
            />

            <!-- Trạng thái -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
              <select
                v-model="form.status"
                class="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                :class="{ 'border-red-500': errors.status }"
                @change="clearError('status')"
              >
                <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
              <p v-if="errors.status" class="text-sm text-red-600 mt-1">{{ errors.status }}</p>
            </div>
          </div>
        </div>
      </template>
    </FormWrapper>
  </Modal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import Modal from '@/components/Core/Modal/Modal.vue'
import FormWrapper from '@/components/Core/Form/FormWrapper.vue'
import FormField from '@/components/Core/Form/FormField.vue'
import SearchableSelect from '@/components/Core/Select/SearchableSelect.vue'
import ImageUploader from '@/components/Core/Image/ImageUploader.vue'
import { adminEndpoints } from '@/api/endpoints'
import { useGlobalApiClient } from '@/composables/api'

const props = defineProps({
  show: Boolean,
  value: Object,
  attributeEnums: {
    type: Array,
    default: () => []
  },
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
const formRef = ref(null)
const { apiClient } = useGlobalApiClient()

const formTitle = computed(() => props.value ? 'Chỉnh sửa giá trị thuộc tính' : 'Thêm giá trị thuộc tính')
const modalVisible = computed({
  get: () => props.show,
  set: () => onClose()
})

const attributeApi = computed(() => `${adminEndpoints.productAttributes.list}?status=active`)

const defaultValues = computed(() => {
  const obj = props.value || {}
  return {
    product_attribute_id: obj.product_attribute_id || obj.attribute_id || '',
    value: obj.value || '',
    color_code: obj.color_code || '',
    image: obj.image || null,
    sort_order: obj.sort_order ?? 0,
    status: obj.status || 'active'
  }
})

const statusOptions = computed(() => {
  if (!props.statusEnums || !Array.isArray(props.statusEnums)) return [
    { value: 'active', label: 'Hoạt động' },
    { value: 'inactive', label: 'Ngưng hoạt động' }
  ]
  return props.statusEnums.map(item => ({
    value: item.value ?? item.id,
    label: item.label ?? item.name ?? String(item.value ?? item.id)
  }))
})

const selectedAttribute = ref(props.value?.attribute || null)
const selectedAttributeId = ref(defaultValues.value.product_attribute_id)
const imagePreview = computed(() => props.value?.image || '')

const attributeType = computed(() => selectedAttribute.value?.type || null)
const requiresColorInput = computed(() => attributeType.value === 'color')
const requiresImageInput = computed(() => attributeType.value === 'image')

watch(() => props.value, (newVal) => {
  selectedAttribute.value = newVal?.attribute || null
  selectedAttributeId.value = newVal?.product_attribute_id || newVal?.attribute_id || defaultValues.value.product_attribute_id
}, { immediate: true, deep: true })

watch(selectedAttributeId, async (newId) => {
  if (!newId) {
    selectedAttribute.value = null
    return
  }
  const cached = props.attributeEnums?.find(attr => Number(attr.id) === Number(newId))
  if (cached) {
    selectedAttribute.value = cached
    return
  }
  try {
    const response = await apiClient.get(adminEndpoints.productAttributes.show(newId))
    if (response.data?.success) {
      selectedAttribute.value = response.data.data
    }
  } catch (e) {
    selectedAttribute.value = selectedAttribute.value || null
  }
}, { immediate: true })

watch(requiresColorInput, (isRequired) => {
  const form = formRef.value?.form
  if (!form) return
  if (!isRequired) {
    form.color_code = ''
  }
}, { immediate: true })

watch(requiresImageInput, (isRequired) => {
  const form = formRef.value?.form
  if (!form) return
  if (!isRequired) {
    form.image = null
  }
}, { immediate: true })

function handleAttributeChange(attributeId) {
  selectedAttributeId.value = attributeId
}

function handleColorInput(event) {
  const rawValue = event?.target?.value || ''
  const normalized = rawValue.startsWith('#') ? rawValue : `#${rawValue}`
  const formatted = normalized.toUpperCase().slice(0, 7)
  const form = formRef.value?.form
  if (form) {
    form.color_code = formatted
  }
}

const validationRules = computed(() => ({
  product_attribute_id: [
    { required: 'Thuộc tính là bắt buộc.' }
  ],
  value: [
    { required: 'Giá trị là bắt buộc.' },
    { max: 255, maxMessage: 'Giá trị không được vượt quá 255 ký tự.' }
  ],
  color_code: requiresColorInput.value
    ? [
        { required: 'Mã màu là bắt buộc với thuộc tính dạng màu.' },
        { pattern: /^#([0-9A-Fa-f]{6})$/, patternMessage: 'Sai định dạng, dùng #RRGGBB.' }
      ]
    : [],
  image: requiresImageInput.value
    ? [
        { required: 'Ảnh là bắt buộc với thuộc tính dạng hình ảnh.' }
      ]
    : [],
  sort_order: [
    { minValue: 0, minValueMessage: 'Thứ tự sắp xếp phải >= 0.' }
  ]
}))

function handleSubmit(form) {
  emit('submit', form)
}

function onClose() {
  emit('cancel')
}
</script>