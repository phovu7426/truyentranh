<template>
  <Modal v-model="modalVisible" :title="formTitle" size="xl" :loading="isSubmitting">
    <form @submit.prevent="validateAndSubmit" class="space-y-6" @click.stop>
      <!-- Thông tin cơ bản -->
      <div class="space-y-4">
        <div class="border-b border-gray-200 pb-4">
          <h3 class="text-lg font-semibold text-gray-900">
            Thông tin cơ bản
          </h3>
          <p class="text-sm text-gray-600 mt-1">
            Nhập thông tin chung cho biến thể sản phẩm
          </p>
        </div>

        <!-- Sản phẩm & tên/SKU -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Sản phẩm -->
          <div class="md:col-span-2">
            <label for="product_id" class="block text-sm font-medium text-gray-700 mb-1">
              Sản phẩm cha <span class="text-red-500">*</span>
            </label>
            <SearchableSelect
              id="product_id"
              v-model="formData.product_id"
              :search-api="adminEndpoints.products?.list || '/api/admin/products'"
              label-field="name"
              value-field="id"
              placeholder="Chọn sản phẩm"
              :disabled="!!variant"
              :error="validationErrors.product_id || apiErrorsSafe.product_id"
            />
            <p v-if="validationErrors.product_id" class="mt-1 text-sm text-red-600">{{ validationErrors.product_id }}</p>
            <p v-else-if="apiErrorsSafe.product_id" class="mt-1 text-sm text-red-600">{{ apiErrorsSafe.product_id[0] }}</p>
          </div>

          <!-- Tên biến thể -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
              Tên biến thể <span class="text-red-500">*</span>
            </label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              placeholder="Ví dụ: iPhone 15 Pro - 512GB - Trắng"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              :class="{ 'border-red-500': validationErrors.name || apiErrorsSafe.name }"
            />
            <p v-if="validationErrors.name" class="mt-1 text-sm text-red-600">{{ validationErrors.name }}</p>
            <p v-else-if="apiErrorsSafe.name" class="mt-1 text-sm text-red-600">{{ apiErrorsSafe.name[0] }}</p>
          </div>

          <!-- SKU -->
          <div>
            <label for="sku" class="block text-sm font-medium text-gray-700 mb-1">
              SKU <span class="text-red-500">*</span>
            </label>
            <input
              id="sku"
              v-model="formData.sku"
              type="text"
              placeholder="Mã SKU duy nhất, ví dụ IP15PRO-512GB-WHITE"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              :class="{ 'border-red-500': validationErrors.sku || apiErrorsSafe.sku }"
            />
            <p v-if="validationErrors.sku" class="mt-1 text-sm text-red-600">{{ validationErrors.sku }}</p>
            <p v-else-if="apiErrorsSafe.sku" class="mt-1 text-sm text-red-600">{{ apiErrorsSafe.sku[0] }}</p>
          </div>
        </div>
      </div>

      <!-- Giá & tồn kho -->
      <div class="space-y-4">
        <div class="border-b border-gray-200 pb-4">
          <h3 class="text-lg font-semibold text-gray-900">
            Giá và tồn kho
          </h3>
          <p class="text-sm text-gray-600 mt-1">
            Thiết lập giá bán, khuyến mãi và tồn kho cho biến thể
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Giá gốc -->
          <div>
            <label for="price" class="block text-sm font-medium text-gray-700 mb-1">
              Giá bán (VND) <span class="text-red-500">*</span>
            </label>
            <input
              id="price"
              v-model="formData.price"
              type="number"
              min="0"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              :class="{ 'border-red-500': validationErrors.price || apiErrorsSafe.price }"
            />
            <p v-if="validationErrors.price" class="mt-1 text-sm text-red-600">{{ validationErrors.price }}</p>
            <p v-else-if="apiErrorsSafe.price" class="mt-1 text-sm text-red-600">{{ apiErrorsSafe.price[0] }}</p>
          </div>

          <!-- Giá khuyến mãi -->
          <div>
            <label for="sale_price" class="block text-sm font-medium text-gray-700 mb-1">
              Giá khuyến mãi (VND)
            </label>
            <input
              id="sale_price"
              v-model="formData.sale_price"
              type="number"
              min="0"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              :class="{ 'border-red-500': validationErrors.sale_price || apiErrorsSafe.sale_price }"
            />
            <p v-if="validationErrors.sale_price" class="mt-1 text-sm text-red-600">{{ validationErrors.sale_price }}</p>
            <p v-else-if="apiErrorsSafe.sale_price" class="mt-1 text-sm text-red-600">{{ apiErrorsSafe.sale_price[0] }}</p>
          </div>

          <!-- Giá vốn -->
          <div>
            <label for="cost_price" class="block text-sm font-medium text-gray-700 mb-1">
              Giá vốn (VND)
            </label>
            <input
              id="cost_price"
              v-model="formData.cost_price"
              type="number"
              min="0"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              :class="{ 'border-red-500': validationErrors.cost_price || apiErrorsSafe.cost_price }"
            />
            <p v-if="validationErrors.cost_price" class="mt-1 text-sm text-red-600">{{ validationErrors.cost_price }}</p>
            <p v-else-if="apiErrorsSafe.cost_price" class="mt-1 text-sm text-red-600">{{ apiErrorsSafe.cost_price[0] }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Số lượng tồn kho -->
          <div>
            <label for="stock_quantity" class="block text-sm font-medium text-gray-700 mb-1">
              Số lượng tồn kho <span class="text-red-500">*</span>
            </label>
            <input
              id="stock_quantity"
              v-model="formData.stock_quantity"
              type="number"
              min="0"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              :class="{ 'border-red-500': validationErrors.stock_quantity || apiErrorsSafe.stock_quantity }"
            />
            <p v-if="validationErrors.stock_quantity" class="mt-1 text-sm text-red-600">{{ validationErrors.stock_quantity }}</p>
            <p v-else-if="apiErrorsSafe.stock_quantity" class="mt-1 text-sm text-red-600">{{ apiErrorsSafe.stock_quantity[0] }}</p>
          </div>
        </div>
      </div>

      <!-- Thuộc tính biến thể -->
      <div class="space-y-4">
        <div class="border-b border-gray-200 pb-4">
          <h3 class="text-lg font-semibold text-gray-900">
            Thuộc tính biến thể
          </h3>
          <p class="text-sm text-gray-600 mt-1">
            Chọn các thuộc tính cấu thành biến thể (Màu sắc, Dung lượng, ...)
          </p>
        </div>

        <div class="space-y-4">
          <div
            v-for="(attribute, index) in formData.attributes"
            :key="index"
            class="flex items-center space-x-4"
          >
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">Thuộc tính</label>
              <SearchableSelect
                v-model="attribute.attribute_id"
                :search-api="adminEndpoints.productAttributes?.list || '/api/admin/product-attributes'"
                label-field="name"
                value-field="id"
                placeholder="Chọn thuộc tính"
                :error="validationErrors[`attributes.${index}.attribute_id`] || apiErrorsSafe[`attributes.${index}.attribute_id`]"
                @update:model-value="loadAttributeValues(index)"
              />
              <p v-if="validationErrors[`attributes.${index}.attribute_id`]" class="mt-1 text-sm text-red-600">
                {{ validationErrors[`attributes.${index}.attribute_id`] }}
              </p>
              <p v-else-if="apiErrorsSafe[`attributes.${index}.attribute_id`]" class="mt-1 text-sm text-red-600">
                {{ apiErrorsSafe[`attributes.${index}.attribute_id`][0] }}
              </p>
            </div>

            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">Giá trị</label>
              <SearchableSelect
                v-model="attribute.attribute_value_id"
                :search-api="getAttributeValueApi(index)"
                label-field="value"
                value-field="id"
                placeholder="Chọn giá trị"
                :disabled="!attribute.attribute_id"
                :error="validationErrors[`attributes.${index}.attribute_value_id`] || apiErrorsSafe[`attributes.${index}.attribute_value_id`]"
              />
              <p v-if="validationErrors[`attributes.${index}.attribute_value_id`]" class="mt-1 text-sm text-red-600">
                {{ validationErrors[`attributes.${index}.attribute_value_id`] }}
              </p>
              <p v-else-if="apiErrorsSafe[`attributes.${index}.attribute_value_id`]" class="mt-1 text-sm text-red-600">
                {{ apiErrorsSafe[`attributes.${index}.attribute_value_id`][0] }}
              </p>
            </div>

            <div class="pt-6">
              <button
                type="button"
                @click="removeAttribute(index)"
                class="px-3 py-2 text-red-600 hover:text-red-800 focus:outline-none"
                :disabled="formData.attributes.length <= 1"
              >
                Xóa
              </button>
            </div>
          </div>

          <button
            type="button"
            @click="addAttribute"
            class="px-4 py-2 text-blue-600 hover:text-blue-800 focus:outline-none"
          >
            + Thêm thuộc tính
          </button>
        </div>
      </div>

      <!-- Hình ảnh -->
      <div class="space-y-4">
        <div class="border-b border-gray-200 pb-4">
          <h3 class="text-lg font-semibold text-gray-900">
            Hình ảnh
          </h3>
          <p class="text-sm text-gray-600 mt-1">
            Ảnh đại diện cho biến thể
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Ảnh đại diện</label>
          <ImageUploader
            v-model="formData.image"
            :defaultUrl="imageUrl"
            @remove="formData.image = null"
          />
          <p v-if="validationErrors.image" class="mt-1 text-sm text-red-600">{{ validationErrors.image }}</p>
          <p v-else-if="apiErrorsSafe.image" class="mt-1 text-sm text-red-600">{{ apiErrorsSafe.image[0] }}</p>
        </div>
      </div>

      <!-- Trạng thái -->
      <div class="space-y-4">
        <div class="border-b border-gray-200 pb-4">
          <h3 class="text-lg font-semibold text-gray-900">
            Trạng thái
          </h3>
          <p class="text-sm text-gray-600 mt-1">
            Thiết lập trạng thái hoạt động của biến thể
          </p>
        </div>

        <div>
          <label for="status" class="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
          <SearchableSelect
            id="status"
            v-model="formData.status"
            :search-api="statusApi"
            label-field="label"
            value-field="value"
            placeholder="-- Chọn trạng thái --"
            :error="validationErrors.status || apiErrorsSafe.status"
          />
          <p v-if="validationErrors.status" class="mt-1 text-sm text-red-600">{{ validationErrors.status }}</p>
          <p v-else-if="apiErrorsSafe.status" class="mt-1 text-sm text-red-600">{{ apiErrorsSafe.status[0] }}</p>
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
          class="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
          :disabled="isSubmitting"
        >
          <span v-if="isSubmitting">Đang xử lý...</span>
          <span v-else>{{ variant ? 'Cập nhật biến thể' : 'Thêm biến thể mới' }}</span>
        </button>
      </div>
    </form>
  </Modal>
</template>

<script setup>
import { ref, computed, reactive, watch, nextTick } from 'vue'
import Modal from '@/components/Core/Modal/Modal.vue'
import ImageUploader from '@/components/Core/Image/ImageUploader.vue'
import SearchableSelect from '@/components/Core/Select/SearchableSelect.vue'
import { adminEndpoints } from '@/api/endpoints'
import { useFormValidation } from '@/composables/utils/useFormValidation'
import { useGlobalApiClient } from '@/composables/api'

const props = defineProps({
  show: Boolean,
  variant: Object,
  statusEnums: {
    type: Array,
    default: () => []
  },
  productEnums: {
    type: Array,
    default: () => []
  },
  attributeEnums: {
    type: Array,
    default: () => []
  },
  apiErrors: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['submit', 'cancel'])

const { apiClient } = useGlobalApiClient()

// API cho enum trạng thái
const statusApi = adminEndpoints.enums.byName('product_status')

// Đảm bảo luôn có object để tránh lỗi khi apiErrors là null
const apiErrorsSafe = computed(() => props.apiErrors || {})

// Form title
const formTitle = computed(() => props.variant ? 'Chỉnh sửa biến thể' : 'Thêm biến thể mới')

// Modal visibility
const modalVisible = computed({
  get: () => props.show,
  set: () => onClose()
})

// Image URLs for ImageUploader
const imageUrl = computed(() => {
  if (props.variant?.image) {
    return props.variant.image
  }
  return null
})

// Form data
const formData = reactive({
  product_id: '',
  name: '',
  sku: '',
  price: '',
  sale_price: '',
  cost_price: '',
  stock_quantity: '',
  // Theo tài liệu API: attributes = [{ attribute_id, attribute_value_id }]
  attributes: [
    { attribute_id: '', attribute_value_id: '' }
  ],
  image: null,
  status: 'active',
  track_inventory: true,
  allow_backorder: false,
  requires_shipping: true,
  taxable: true
})

// Form state
const isSubmitting = ref(false)

// Validation rules
const validationRules = computed(() => ({
  product_id: [
    { required: 'Sản phẩm là bắt buộc' }
  ],
  name: [
    { required: 'Tên biến thể là bắt buộc' }
  ],
  sku: [
    { required: 'SKU là bắt buộc' }
  ],
  price: [
    { required: 'Giá bán là bắt buộc' }
  ],
  stock_quantity: [
    { required: 'Số lượng tồn kho là bắt buộc' }
  ]
}))

// Use form validation composable
const { validationErrors, clearErrors, validateForm } = useFormValidation(ref(formData), validationRules)

// Watch variant prop to update form data
watch(() => props.variant, async (newVal) => {
  if (newVal) {
    formData.product_id = newVal.product_id || ''
    formData.name = newVal.name || ''
    formData.sku = newVal.sku || ''
    formData.price = newVal.price || ''
    formData.sale_price = newVal.sale_price || ''
    formData.cost_price = newVal.cost_price || ''
    formData.stock_quantity = newVal.stock_quantity || ''
    formData.image = (newVal.image && !newVal.image.includes('via.placeholder')) ? newVal.image : null

    // Xử lý attributes - API trả về product_attribute_id và product_attribute_value_id
    if (newVal.attributes && Array.isArray(newVal.attributes) && newVal.attributes.length > 0) {
      formData.attributes = newVal.attributes.map(attr => ({
        attribute_id: String(attr.product_attribute_id || attr.attribute_id || attr.attribute?.id || ''),
        attribute_value_id: String(attr.product_attribute_value_id || attr.attribute_value_id || attr.value?.id || '')
      }))
    } else {
      formData.attributes = [{ attribute_id: '', attribute_value_id: '' }]
    }

    formData.status = newVal.status !== undefined ? newVal.status : 'active'
    formData.track_inventory = newVal.track_inventory !== undefined ? newVal.track_inventory : true
    formData.allow_backorder = newVal.allow_backorder !== undefined ? newVal.allow_backorder : false
    formData.requires_shipping = newVal.requires_shipping !== undefined ? newVal.requires_shipping : true
    formData.taxable = newVal.taxable !== undefined ? newVal.taxable : true

    // Đảm bảo DOM được cập nhật
    await nextTick()
  } else {
    // Khi tạo mới, set giá trị mặc định
    resetForm()
    clearErrors()
  }
}, { immediate: true })

// Reset form
function resetForm() {
  formData.product_id = ''
  formData.name = ''
  formData.sku = ''
  formData.price = ''
  formData.sale_price = ''
  formData.cost_price = ''
  formData.stock_quantity = ''
  formData.attributes = [{ attribute_id: '', attribute_value_id: '' }]
  formData.image = null
  formData.status = 'active'
  formData.track_inventory = true
  formData.allow_backorder = false
  formData.requires_shipping = true
  formData.taxable = true
}

// Attribute management
function addAttribute() {
  formData.attributes.push({ attribute_id: '', attribute_value_id: '' })
}

function removeAttribute(index) {
  if (formData.attributes.length > 1) {
    formData.attributes.splice(index, 1)
  }
}

async function loadAttributeValues(index) {
  const attributeId = formData.attributes[index].attribute_id
  if (!attributeId) {
    return
  }

  // Reset value when attribute changes
  formData.attributes[index].attribute_value_id = ''
}

function getAttributeValueApi(index) {
  const attributeId = formData.attributes[index].attribute_id
  if (!attributeId) return null

  // Theo tài liệu: GET /api/admin/product-attribute-values?attribute_id={id}
  // Tuy nhiên trong endpoints đã có sẵn helper:
  return adminEndpoints.productAttributeValues.getByAttribute(attributeId)
}

// Validate and submit form
function validateAndSubmit() {
  if (!validateForm()) {
    return
  }
  
  isSubmitting.value = true

  try {
    // Filter out empty attributes
    const attributes = formData.attributes
      .filter(av => av.attribute_id && av.attribute_value_id)
      .map(av => ({
        attribute_id: parseInt(av.attribute_id),
        attribute_value_id: parseInt(av.attribute_value_id)
      }))

    // Create submit data theo spec API (chỉ gửi field có giá trị hợp lệ)
    const submitData = {
      product_id: parseInt(formData.product_id),
      sku: formData.sku,
      name: formData.name,
      price: parseFloat(formData.price),
      stock_quantity: parseInt(formData.stock_quantity),
      status: formData.status,
      track_inventory: formData.track_inventory,
      allow_backorder: formData.allow_backorder,
      requires_shipping: formData.requires_shipping,
      taxable: formData.taxable,
      attributes
    }

    if (formData.sale_price) {
      submitData.sale_price = parseFloat(formData.sale_price)
    }
    if (formData.cost_price) {
      submitData.cost_price = parseFloat(formData.cost_price)
    }

    // Map image sang image_url đúng spec
    if (formData.image) {
      submitData.image_url = formData.image
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
