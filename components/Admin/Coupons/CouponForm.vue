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
            Nhập thông tin chung cho mã giảm giá
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Mã giảm giá -->
          <div>
            <label for="code" class="block text-sm font-medium text-gray-700 mb-1">
              Mã giảm giá <span class="text-red-500">*</span>
            </label>
            <input
              id="code"
              v-model="formData.code"
              type="text"
              placeholder="Ví dụ: WELCOME10, SUMMER2025"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              :class="{ 'border-red-500': validationErrors.code || apiErrorsSafe.code }"
              :disabled="!!item"
            />
            <p v-if="validationErrors.code" class="mt-1 text-sm text-red-600">{{ validationErrors.code }}</p>
            <p v-else-if="apiErrorsSafe.code" class="mt-1 text-sm text-red-600">{{ apiErrorsSafe.code[0] }}</p>
            <p v-if="item" class="mt-1 text-xs text-gray-500">Mã giảm giá không thể thay đổi sau khi tạo</p>
          </div>

          <!-- Tên mã giảm giá -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
              Tên mã giảm giá <span class="text-red-500">*</span>
            </label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              placeholder="Ví dụ: Giảm giá chào mừng"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              :class="{ 'border-red-500': validationErrors.name || apiErrorsSafe.name }"
            />
            <p v-if="validationErrors.name" class="mt-1 text-sm text-red-600">{{ validationErrors.name }}</p>
            <p v-else-if="apiErrorsSafe.name" class="mt-1 text-sm text-red-600">{{ apiErrorsSafe.name[0] }}</p>
          </div>
        </div>

        <!-- Mô tả -->
        <div>
          <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
            Mô tả
          </label>
          <textarea
            id="description"
            v-model="formData.description"
            rows="3"
            placeholder="Mô tả chi tiết về mã giảm giá..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            :class="{ 'border-red-500': validationErrors.description || apiErrorsSafe.description }"
          ></textarea>
          <p v-if="validationErrors.description" class="mt-1 text-sm text-red-600">{{ validationErrors.description }}</p>
          <p v-else-if="apiErrorsSafe.description" class="mt-1 text-sm text-red-600">{{ apiErrorsSafe.description[0] }}</p>
        </div>
      </div>

      <!-- Cấu hình giảm giá -->
      <div class="space-y-4">
        <div class="border-b border-gray-200 pb-4">
          <h3 class="text-lg font-semibold text-gray-900">
            Cấu hình giảm giá
          </h3>
          <p class="text-sm text-gray-600 mt-1">
            Thiết lập loại và giá trị giảm giá
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Loại giảm giá -->
          <div>
            <label for="type" class="block text-sm font-medium text-gray-700 mb-1">
              Loại giảm giá <span class="text-red-500">*</span>
            </label>
            <select
              id="type"
              v-model="formData.type"
              @change="handleTypeChange"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              :class="{ 'border-red-500': validationErrors.type || apiErrorsSafe.type }"
            >
              <option value="">-- Chọn loại giảm giá --</option>
              <option v-for="option in typeOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
            <p v-if="validationErrors.type" class="mt-1 text-sm text-red-600">{{ validationErrors.type }}</p>
            <p v-else-if="apiErrorsSafe.type" class="mt-1 text-sm text-red-600">{{ Array.isArray(apiErrorsSafe.type) ? apiErrorsSafe.type[0] : apiErrorsSafe.type }}</p>
          </div>

          <!-- Giá trị giảm giá -->
          <div>
            <label for="value" class="block text-sm font-medium text-gray-700 mb-1">
              Giá trị giảm giá <span class="text-red-500">*</span>
            </label>
            <input
              id="value"
              v-model.number="formData.value"
              type="number"
              step="0.01"
              min="0"
              :placeholder="typePlaceholder"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              :class="{ 'border-red-500': validationErrors.value || apiErrorsSafe.value }"
              :disabled="formData.type === 'free_shipping'"
            />
            <p v-if="validationErrors.value" class="mt-1 text-sm text-red-600">{{ validationErrors.value }}</p>
            <p v-else-if="apiErrorsSafe.value" class="mt-1 text-sm text-red-600">{{ apiErrorsSafe.value[0] }}</p>
            <p class="mt-1 text-xs text-gray-500">{{ typeHelpText }}</p>
          </div>
        </div>

        <!-- Giá trị đơn hàng tối thiểu -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="min_order_value" class="block text-sm font-medium text-gray-700 mb-1">
              Giá trị đơn hàng tối thiểu <span class="text-red-500">*</span>
            </label>
            <input
              id="min_order_value"
              v-model.number="formData.min_order_value"
              type="number"
              step="0.01"
              min="0"
              placeholder="0"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              :class="{ 'border-red-500': validationErrors.min_order_value || apiErrorsSafe.min_order_value }"
            />
            <p v-if="validationErrors.min_order_value" class="mt-1 text-sm text-red-600">{{ validationErrors.min_order_value }}</p>
            <p v-else-if="apiErrorsSafe.min_order_value" class="mt-1 text-sm text-red-600">{{ apiErrorsSafe.min_order_value[0] }}</p>
            <p class="mt-1 text-xs text-gray-500">Đơn hàng phải có giá trị tối thiểu này để áp dụng mã</p>
          </div>

          <!-- Giá trị giảm tối đa (chỉ hiển thị khi type = percentage) -->
          <div v-if="formData.type === 'percentage'">
            <label for="max_discount_amount" class="block text-sm font-medium text-gray-700 mb-1">
              Giá trị giảm tối đa
            </label>
            <input
              id="max_discount_amount"
              v-model.number="formData.max_discount_amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="Không giới hạn"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              :class="{ 'border-red-500': validationErrors.max_discount_amount || apiErrorsSafe.max_discount_amount }"
            />
            <p v-if="validationErrors.max_discount_amount" class="mt-1 text-sm text-red-600">{{ validationErrors.max_discount_amount }}</p>
            <p v-else-if="apiErrorsSafe.max_discount_amount" class="mt-1 text-sm text-red-600">{{ apiErrorsSafe.max_discount_amount[0] }}</p>
            <p class="mt-1 text-xs text-gray-500">Giới hạn số tiền giảm tối đa (chỉ áp dụng cho giảm theo phần trăm)</p>
          </div>
        </div>
      </div>

      <!-- Thời gian hiệu lực -->
      <div class="space-y-4">
        <div class="border-b border-gray-200 pb-4">
          <h3 class="text-lg font-semibold text-gray-900">
            Thời gian hiệu lực
          </h3>
          <p class="text-sm text-gray-600 mt-1">
            Thiết lập thời gian áp dụng mã giảm giá
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Ngày bắt đầu -->
          <div>
            <label for="start_date" class="block text-sm font-medium text-gray-700 mb-1">
              Ngày bắt đầu <span class="text-red-500">*</span>
            </label>
            <input
              id="start_date"
              v-model="formData.start_date"
              type="datetime-local"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              :class="{ 'border-red-500': validationErrors.start_date || apiErrorsSafe.start_date }"
            />
            <p v-if="validationErrors.start_date" class="mt-1 text-sm text-red-600">{{ validationErrors.start_date }}</p>
            <p v-else-if="apiErrorsSafe.start_date" class="mt-1 text-sm text-red-600">{{ apiErrorsSafe.start_date[0] }}</p>
          </div>

          <!-- Ngày kết thúc -->
          <div>
            <label for="end_date" class="block text-sm font-medium text-gray-700 mb-1">
              Ngày kết thúc <span class="text-red-500">*</span>
            </label>
            <input
              id="end_date"
              v-model="formData.end_date"
              type="datetime-local"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              :class="{ 'border-red-500': validationErrors.end_date || apiErrorsSafe.end_date }"
            />
            <p v-if="validationErrors.end_date" class="mt-1 text-sm text-red-600">{{ validationErrors.end_date }}</p>
            <p v-else-if="apiErrorsSafe.end_date" class="mt-1 text-sm text-red-600">{{ apiErrorsSafe.end_date[0] }}</p>
          </div>
        </div>
      </div>

      <!-- Giới hạn sử dụng -->
      <div class="space-y-4">
        <div class="border-b border-gray-200 pb-4">
          <h3 class="text-lg font-semibold text-gray-900">
            Giới hạn sử dụng
          </h3>
          <p class="text-sm text-gray-600 mt-1">
            Thiết lập số lần sử dụng mã giảm giá
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Số lần sử dụng tối đa -->
          <div>
            <label for="usage_limit" class="block text-sm font-medium text-gray-700 mb-1">
              Số lần sử dụng tối đa
            </label>
            <input
              id="usage_limit"
              v-model.number="formData.usage_limit"
              type="number"
              min="1"
              placeholder="Không giới hạn"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              :class="{ 'border-red-500': validationErrors.usage_limit || apiErrorsSafe.usage_limit }"
            />
            <p v-if="validationErrors.usage_limit" class="mt-1 text-sm text-red-600">{{ validationErrors.usage_limit }}</p>
            <p v-else-if="apiErrorsSafe.usage_limit" class="mt-1 text-sm text-red-600">{{ apiErrorsSafe.usage_limit[0] }}</p>
            <p class="mt-1 text-xs text-gray-500">Để trống nếu không giới hạn số lần sử dụng</p>
          </div>

          <!-- Số lần sử dụng mỗi khách hàng -->
          <div>
            <label for="usage_per_customer" class="block text-sm font-medium text-gray-700 mb-1">
              Số lần sử dụng mỗi khách hàng <span class="text-red-500">*</span>
            </label>
            <input
              id="usage_per_customer"
              v-model.number="formData.usage_per_customer"
              type="number"
              min="1"
              max="100"
              placeholder="1"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              :class="{ 'border-red-500': validationErrors.usage_per_customer || apiErrorsSafe.usage_per_customer }"
            />
            <p v-if="validationErrors.usage_per_customer" class="mt-1 text-sm text-red-600">{{ validationErrors.usage_per_customer }}</p>
            <p v-else-if="apiErrorsSafe.usage_per_customer" class="mt-1 text-sm text-red-600">{{ apiErrorsSafe.usage_per_customer[0] }}</p>
            <p class="mt-1 text-xs text-gray-500">Số lần tối đa mỗi khách hàng có thể sử dụng (1-100)</p>
          </div>
        </div>

        <!-- Chỉ áp dụng cho đơn hàng đầu tiên -->
        <div class="flex items-center">
          <input
            id="first_order_only"
            v-model="formData.first_order_only"
            type="checkbox"
            class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
          <label for="first_order_only" class="ml-2 text-sm text-gray-700">
            Chỉ áp dụng cho đơn hàng đầu tiên
          </label>
        </div>
      </div>

      <!-- Áp dụng cho sản phẩm/danh mục -->
      <div class="space-y-4">
        <div class="border-b border-gray-200 pb-4">
          <h3 class="text-lg font-semibold text-gray-900">
            Áp dụng cho sản phẩm/danh mục
          </h3>
          <p class="text-sm text-gray-600 mt-1">
            Thiết lập sản phẩm và danh mục áp dụng mã giảm giá (tùy chọn)
          </p>
        </div>

        <!-- Sản phẩm áp dụng -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Sản phẩm áp dụng
          </label>
          <MultipleSelectEnhanced
            v-model="formData.applicable_products"
            :search-api="adminEndpoints.products?.list || '/api/admin/products'"
            label=""
            label-field="name"
            value-field="id"
            placeholder="-- Chọn sản phẩm --"
            :error="apiErrorsSafe.applicable_products"
            help-text="Chọn các sản phẩm được áp dụng mã giảm giá. Để trống nếu áp dụng cho tất cả"
          />
        </div>

        <!-- Danh mục áp dụng -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Danh mục áp dụng
          </label>
          <MultipleSelectEnhanced
            v-model="formData.applicable_categories"
            :search-api="adminEndpoints.productCategories?.list || '/api/admin/product-categories'"
            label=""
            label-field="name"
            value-field="id"
            placeholder="-- Chọn danh mục --"
            :error="apiErrorsSafe.applicable_categories"
            help-text="Chọn các danh mục được áp dụng mã giảm giá. Để trống nếu áp dụng cho tất cả"
          />
        </div>

        <!-- Sản phẩm loại trừ -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Sản phẩm loại trừ
          </label>
          <MultipleSelectEnhanced
            v-model="formData.excluded_products"
            :search-api="adminEndpoints.products?.list || '/api/admin/products'"
            label=""
            label-field="name"
            value-field="id"
            placeholder="-- Chọn sản phẩm loại trừ --"
            :error="apiErrorsSafe.excluded_products"
            help-text="Chọn các sản phẩm không được áp dụng mã giảm giá"
          />
        </div>
      </div>

      <!-- Trạng thái -->
      <div class="space-y-4" v-if="item">
        <div class="border-b border-gray-200 pb-4">
          <h3 class="text-lg font-semibold text-gray-900">
            Trạng thái
          </h3>
          <p class="text-sm text-gray-600 mt-1">
            Thiết lập trạng thái hoạt động của mã giảm giá
          </p>
        </div>

        <div>
          <SingleSelectEnhanced
            v-model="formData.status"
            :search-api="statusApi"
            label="Trạng thái"
            label-field="label"
            value-field="value"
            placeholder="-- Chọn trạng thái --"
            :error="validationErrors.status || (apiErrorsSafe.status ? (Array.isArray(apiErrorsSafe.status) ? apiErrorsSafe.status[0] : apiErrorsSafe.status) : '')"
            help-text="Trạng thái hoạt động của mã giảm giá"
          />
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
          <span v-else>{{ item ? 'Cập nhật mã giảm giá' : 'Thêm mã giảm giá mới' }}</span>
        </button>
      </div>
    </form>
  </Modal>
</template>

<script setup>
import { ref, computed, reactive, watch, nextTick } from 'vue'
import Modal from '@/components/Core/Modal/Modal.vue'
import MultipleSelectEnhanced from '@/components/Core/Select/MultipleSelectEnhanced.vue'
import SingleSelectEnhanced from '@/components/Core/Select/SingleSelectEnhanced.vue'
import { adminEndpoints } from '@/api/endpoints'
import { useFormValidation } from '@/composables/utils/useFormValidation'

const props = defineProps({
  show: Boolean,
  coupon: Object,
  typeEnums: {
    type: Array,
    default: () => []
  },
  apiErrors: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['submit', 'cancel'])

// Type options - use static options from props
const typeOptions = computed(() => {
  return props.typeEnums && props.typeEnums.length > 0 
    ? props.typeEnums 
    : [
        { value: 'percentage', label: 'Phần trăm' },
        { value: 'fixed_amount', label: 'Số tiền cố định' },
        { value: 'free_shipping', label: 'Miễn phí vận chuyển' }
      ]
})

const statusApi = adminEndpoints.enums.byName('coupon_status')

// Alias for item prop
const item = computed(() => props.coupon)

// Đảm bảo luôn có object để tránh lỗi khi apiErrors là null
const apiErrorsSafe = computed(() => props.apiErrors || {})

// Form title
const formTitle = computed(() => item.value ? 'Chỉnh sửa mã giảm giá' : 'Thêm mã giảm giá mới')

// Modal visibility
const modalVisible = computed({
  get: () => props.show,
  set: () => onClose()
})

// Form data
const formData = reactive({
  code: '',
  name: '',
  description: '',
  type: 'percentage',
  value: 0,
  min_order_value: 0,
  max_discount_amount: null,
  usage_limit: null,
  usage_per_customer: 1,
  start_date: '',
  end_date: '',
  status: 'active',
  applicable_products: [],
  applicable_categories: [],
  excluded_products: [],
  first_order_only: false
})

// Form state
const isSubmitting = ref(false)

// Computed helpers
const typePlaceholder = computed(() => {
  if (formData.type === 'percentage') return 'Ví dụ: 10 (tức 10%)'
  if (formData.type === 'fixed_amount') return 'Ví dụ: 50000 (tức 50,000 VNĐ)'
  return ''
})

const typeHelpText = computed(() => {
  if (formData.type === 'percentage') return 'Nhập phần trăm giảm giá (ví dụ: 10 = 10%)'
  if (formData.type === 'fixed_amount') return 'Nhập số tiền giảm giá (VNĐ)'
  if (formData.type === 'free_shipping') return 'Miễn phí vận chuyển, không cần nhập giá trị'
  return ''
})

// Validation rules
const validationRules = computed(() => ({
  code: [
    { required: 'Mã giảm giá là bắt buộc' },
    { maxLength: 50, message: 'Mã giảm giá tối đa 50 ký tự' }
  ],
  name: [
    { required: 'Tên mã giảm giá là bắt buộc' },
    { maxLength: 255, message: 'Tên mã giảm giá tối đa 255 ký tự' }
  ],
  type: [
    { required: 'Loại giảm giá là bắt buộc' }
  ],
  value: [
    { required: 'Giá trị giảm giá là bắt buộc' },
    { min: 0, message: 'Giá trị giảm giá phải >= 0' }
  ],
  min_order_value: [
    { required: 'Giá trị đơn hàng tối thiểu là bắt buộc' },
    { min: 0, message: 'Giá trị đơn hàng tối thiểu phải >= 0' }
  ],
  usage_per_customer: [
    { required: 'Số lần sử dụng mỗi khách hàng là bắt buộc' },
    { min: 1, message: 'Số lần sử dụng mỗi khách hàng phải >= 1' },
    { max: 100, message: 'Số lần sử dụng mỗi khách hàng phải <= 100' }
  ],
  start_date: [
    { required: 'Ngày bắt đầu là bắt buộc' }
  ],
  end_date: [
    { required: 'Ngày kết thúc là bắt buộc' }
  ]
}))

// Use form validation composable
const { validationErrors, clearErrors, validateForm } = useFormValidation(ref(formData), validationRules)

// Watch item prop to update form data
watch(() => props.coupon, async (newVal) => {
  if (newVal) {
    formData.code = newVal.code || ''
    formData.name = newVal.name || ''
    formData.description = newVal.description || ''
    formData.type = newVal.type || 'percentage'
    formData.value = newVal.value ? parseFloat(newVal.value) : 0
    formData.min_order_value = newVal.min_order_value ? parseFloat(newVal.min_order_value) : 0
    formData.max_discount_amount = newVal.max_discount_amount ? parseFloat(newVal.max_discount_amount) : null
    formData.usage_limit = newVal.usage_limit || null
    formData.usage_per_customer = newVal.usage_per_customer || 1
    formData.start_date = newVal.start_date ? formatDateTimeLocal(newVal.start_date) : ''
    formData.end_date = newVal.end_date ? formatDateTimeLocal(newVal.end_date) : ''
    formData.status = newVal.status || 'active'
    formData.applicable_products = newVal.applicable_products || []
    formData.applicable_categories = newVal.applicable_categories || []
    formData.excluded_products = newVal.excluded_products || []
    formData.first_order_only = newVal.first_order_only || false

    await nextTick()
  } else {
    resetForm()
    clearErrors()
  }
}, { immediate: true })

// Handle type change
function handleTypeChange() {
  if (formData.type === 'free_shipping') {
    formData.value = 0
  }
}

// Format datetime to local datetime input format
function formatDateTimeLocal(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

// Format datetime local to ISO string
function formatDateTimeISO(dateTimeLocal) {
  if (!dateTimeLocal) return ''
  const date = new Date(dateTimeLocal)
  return date.toISOString()
}

// Reset form
function resetForm() {
  formData.code = ''
  formData.name = ''
  formData.description = ''
  formData.type = 'percentage'
  formData.value = 0
  formData.min_order_value = 0
  formData.max_discount_amount = null
  formData.usage_limit = null
  formData.usage_per_customer = 1
  formData.start_date = ''
  formData.end_date = ''
  formData.status = 'active'
  formData.applicable_products = []
  formData.applicable_categories = []
  formData.excluded_products = []
  formData.first_order_only = false
}

// Validate and submit form
function validateAndSubmit() {
  // Additional validation: end_date must be after start_date
  if (formData.start_date && formData.end_date) {
    const startDate = new Date(formData.start_date)
    const endDate = new Date(formData.end_date)
    if (endDate <= startDate) {
      validationErrors.value.end_date = 'Ngày kết thúc phải sau ngày bắt đầu'
      return
    }
  }

  if (!validateForm()) {
    return
  }
  
  isSubmitting.value = true

  try {
    // Create submit data
    const submitData = {
      code: formData.code,
      name: formData.name,
      type: formData.type,
      value: Number(formData.value),
      min_order_value: Number(formData.min_order_value),
      usage_per_customer: Number(formData.usage_per_customer),
      start_date: formatDateTimeISO(formData.start_date),
      end_date: formatDateTimeISO(formData.end_date)
    }

    // Optional fields
    if (formData.description) {
      submitData.description = formData.description
    }
    if (formData.max_discount_amount !== null && formData.type === 'percentage') {
      submitData.max_discount_amount = Number(formData.max_discount_amount)
    }
    if (formData.usage_limit !== null) {
      submitData.usage_limit = Number(formData.usage_limit)
    }
    if (formData.applicable_products && formData.applicable_products.length > 0) {
      submitData.applicable_products = normalizeIdArray(formData.applicable_products)
    }
    if (formData.applicable_categories && formData.applicable_categories.length > 0) {
      submitData.applicable_categories = normalizeIdArray(formData.applicable_categories)
    }
    if (formData.excluded_products && formData.excluded_products.length > 0) {
      submitData.excluded_products = normalizeIdArray(formData.excluded_products)
    }
    if (formData.first_order_only) {
      submitData.first_order_only = formData.first_order_only
    }
    if (item.value && formData.status) {
      submitData.status = formData.status
    }

    emit('submit', submitData)
  } finally {
    isSubmitting.value = false
  }
}

// Utilities
function normalizeIdArray(arr) {
  if (!Array.isArray(arr)) return []
  return arr
    .map((v) => Number(v))
    .filter((v) => !Number.isNaN(v))
}

// Close modal
function onClose() {
  emit('cancel')
}
</script>

