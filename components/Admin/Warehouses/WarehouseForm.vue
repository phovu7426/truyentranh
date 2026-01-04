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
            Nhập thông tin chung cho kho hàng
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Mã kho -->
          <div>
            <label for="code" class="block text-sm font-medium text-gray-700 mb-1">
              Mã kho <span class="text-red-500">*</span>
            </label>
            <input
              id="code"
              v-model="formData.code"
              type="text"
              placeholder="Ví dụ: WH-HCM-01, WH-HN-01"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              :class="{ 'border-red-500': validationErrors.code || apiErrorsSafe.code }"
              :disabled="!!warehouse"
            />
            <p v-if="validationErrors.code" class="mt-1 text-sm text-red-600">{{ validationErrors.code }}</p>
            <p v-else-if="apiErrorsSafe.code" class="mt-1 text-sm text-red-600">{{ apiErrorsSafe.code[0] }}</p>
            <p v-if="warehouse" class="mt-1 text-xs text-gray-500">Mã kho không thể thay đổi sau khi tạo</p>
          </div>

          <!-- Tên kho -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
              Tên kho <span class="text-red-500">*</span>
            </label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              placeholder="Ví dụ: Kho Chính - TP.HCM"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              :class="{ 'border-red-500': validationErrors.name || apiErrorsSafe.name }"
            />
            <p v-if="validationErrors.name" class="mt-1 text-sm text-red-600">{{ validationErrors.name }}</p>
            <p v-else-if="apiErrorsSafe.name" class="mt-1 text-sm text-red-600">{{ apiErrorsSafe.name[0] }}</p>
          </div>
        </div>
      </div>

      <!-- Địa chỉ -->
      <div class="space-y-4">
        <div class="border-b border-gray-200 pb-4">
          <h3 class="text-lg font-semibold text-gray-900">
            Địa chỉ
          </h3>
          <p class="text-sm text-gray-600 mt-1">
            Thông tin địa chỉ và liên hệ của kho
          </p>
        </div>

        <!-- Địa chỉ -->
        <div>
          <label for="address" class="block text-sm font-medium text-gray-700 mb-1">
            Địa chỉ
          </label>
          <input
            id="address"
            v-model="formData.address"
            type="text"
            placeholder="Ví dụ: 123 Nguyễn Văn Linh, Quận 7"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            :class="{ 'border-red-500': validationErrors.address || apiErrorsSafe.address }"
          />
          <p v-if="validationErrors.address" class="mt-1 text-sm text-red-600">{{ validationErrors.address }}</p>
          <p v-else-if="apiErrorsSafe.address" class="mt-1 text-sm text-red-600">{{ apiErrorsSafe.address[0] }}</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Thành phố -->
          <div>
            <label for="city" class="block text-sm font-medium text-gray-700 mb-1">
              Thành phố
            </label>
            <input
              id="city"
              v-model="formData.city"
              type="text"
              placeholder="Ví dụ: TP. Hồ Chí Minh"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              :class="{ 'border-red-500': validationErrors.city || apiErrorsSafe.city }"
            />
            <p v-if="validationErrors.city" class="mt-1 text-sm text-red-600">{{ validationErrors.city }}</p>
            <p v-else-if="apiErrorsSafe.city" class="mt-1 text-sm text-red-600">{{ apiErrorsSafe.city[0] }}</p>
          </div>

          <!-- Quận/Huyện -->
          <div>
            <label for="district" class="block text-sm font-medium text-gray-700 mb-1">
              Quận/Huyện
            </label>
            <input
              id="district"
              v-model="formData.district"
              type="text"
              placeholder="Ví dụ: Quận 7"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              :class="{ 'border-red-500': validationErrors.district || apiErrorsSafe.district }"
            />
            <p v-if="validationErrors.district" class="mt-1 text-sm text-red-600">{{ validationErrors.district }}</p>
            <p v-else-if="apiErrorsSafe.district" class="mt-1 text-sm text-red-600">{{ apiErrorsSafe.district[0] }}</p>
          </div>
        </div>

        <!-- Tọa độ -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Vĩ độ -->
          <div>
            <label for="latitude" class="block text-sm font-medium text-gray-700 mb-1">
              Vĩ độ
            </label>
            <input
              id="latitude"
              v-model.number="formData.latitude"
              type="number"
              step="0.0000001"
              placeholder="Ví dụ: 10.7300000"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              :class="{ 'border-red-500': validationErrors.latitude || apiErrorsSafe.latitude }"
            />
            <p v-if="validationErrors.latitude" class="mt-1 text-sm text-red-600">{{ validationErrors.latitude }}</p>
            <p v-else-if="apiErrorsSafe.latitude" class="mt-1 text-sm text-red-600">{{ apiErrorsSafe.latitude[0] }}</p>
          </div>

          <!-- Kinh độ -->
          <div>
            <label for="longitude" class="block text-sm font-medium text-gray-700 mb-1">
              Kinh độ
            </label>
            <input
              id="longitude"
              v-model.number="formData.longitude"
              type="number"
              step="0.0000001"
              placeholder="Ví dụ: 106.7200000"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              :class="{ 'border-red-500': validationErrors.longitude || apiErrorsSafe.longitude }"
            />
            <p v-if="validationErrors.longitude" class="mt-1 text-sm text-red-600">{{ validationErrors.longitude }}</p>
            <p v-else-if="apiErrorsSafe.longitude" class="mt-1 text-sm text-red-600">{{ apiErrorsSafe.longitude[0] }}</p>
          </div>
        </div>

        <!-- Số điện thoại -->
        <div>
          <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
            Số điện thoại
          </label>
          <input
            id="phone"
            v-model="formData.phone"
            type="text"
            placeholder="Ví dụ: 02812345678"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            :class="{ 'border-red-500': validationErrors.phone || apiErrorsSafe.phone }"
          />
          <p v-if="validationErrors.phone" class="mt-1 text-sm text-red-600">{{ validationErrors.phone }}</p>
          <p v-else-if="apiErrorsSafe.phone" class="mt-1 text-sm text-red-600">{{ apiErrorsSafe.phone[0] }}</p>
        </div>
      </div>

      <!-- Thông tin quản lý -->
      <div class="space-y-4">
        <div class="border-b border-gray-200 pb-4">
          <h3 class="text-lg font-semibold text-gray-900">
            Thông tin quản lý
          </h3>
          <p class="text-sm text-gray-600 mt-1">
            Thiết lập thông tin quản lý và ưu tiên
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Tên người quản lý -->
          <div>
            <label for="manager_name" class="block text-sm font-medium text-gray-700 mb-1">
              Tên người quản lý
            </label>
            <input
              id="manager_name"
              v-model="formData.manager_name"
              type="text"
              placeholder="Ví dụ: Nguyễn Văn A"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              :class="{ 'border-red-500': validationErrors.manager_name || apiErrorsSafe.manager_name }"
            />
            <p v-if="validationErrors.manager_name" class="mt-1 text-sm text-red-600">{{ validationErrors.manager_name }}</p>
            <p v-else-if="apiErrorsSafe.manager_name" class="mt-1 text-sm text-red-600">{{ apiErrorsSafe.manager_name[0] }}</p>
          </div>

          <!-- Độ ưu tiên -->
          <div>
            <label for="priority" class="block text-sm font-medium text-gray-700 mb-1">
              Độ ưu tiên
            </label>
            <input
              id="priority"
              v-model.number="formData.priority"
              type="number"
              min="0"
              placeholder="0"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              :class="{ 'border-red-500': validationErrors.priority || apiErrorsSafe.priority }"
            />
            <p v-if="validationErrors.priority" class="mt-1 text-sm text-red-600">{{ validationErrors.priority }}</p>
            <p v-else-if="apiErrorsSafe.priority" class="mt-1 text-sm text-red-600">{{ apiErrorsSafe.priority[0] }}</p>
            <p class="mt-1 text-xs text-gray-500">Kho có độ ưu tiên cao hơn sẽ được ưu tiên khi phân phối</p>
          </div>
        </div>

        <!-- Trạng thái hoạt động -->
        <div class="flex items-center">
          <input
            id="is_active"
            v-model="formData.is_active"
            type="checkbox"
            class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
          <label for="is_active" class="ml-2 text-sm text-gray-700">
            Kho đang hoạt động
          </label>
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
          <span v-else>{{ warehouse ? 'Cập nhật kho hàng' : 'Thêm kho hàng mới' }}</span>
        </button>
      </div>
    </form>
  </Modal>
</template>

<script setup>
import { ref, computed, reactive, watch, nextTick } from 'vue'
import Modal from '@/components/Core/Modal/Modal.vue'
import { useFormValidation } from '@/composables/utils/useFormValidation'

const props = defineProps({
  show: Boolean,
  warehouse: Object,
  apiErrors: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['submit', 'cancel'])

// Đảm bảo luôn có object để tránh lỗi khi apiErrors là null
const apiErrorsSafe = computed(() => props.apiErrors || {})

// Form title
const formTitle = computed(() => props.warehouse ? 'Chỉnh sửa kho hàng' : 'Thêm kho hàng mới')

// Modal visibility
const modalVisible = computed({
  get: () => props.show,
  set: () => onClose()
})

// Form data
const formData = reactive({
  code: '',
  name: '',
  address: '',
  city: '',
  district: '',
  latitude: null,
  longitude: null,
  phone: '',
  manager_name: '',
  priority: 0,
  is_active: true
})

// Form state
const isSubmitting = ref(false)

// Validation rules
const validationRules = computed(() => ({
  code: [
    { required: 'Mã kho là bắt buộc' },
    { maxLength: 100, message: 'Mã kho tối đa 100 ký tự' }
  ],
  name: [
    { required: 'Tên kho là bắt buộc' },
    { maxLength: 255, message: 'Tên kho tối đa 255 ký tự' }
  ],
  city: [
    { maxLength: 100, message: 'Thành phố tối đa 100 ký tự' }
  ],
  district: [
    { maxLength: 100, message: 'Quận/Huyện tối đa 100 ký tự' }
  ],
  phone: [
    { maxLength: 20, message: 'Số điện thoại tối đa 20 ký tự' }
  ],
  manager_name: [
    { maxLength: 255, message: 'Tên người quản lý tối đa 255 ký tự' }
  ],
  priority: [
    { min: 0, message: 'Độ ưu tiên phải >= 0' }
  ]
}))

// Use form validation composable
const { validationErrors, clearErrors, validateForm } = useFormValidation(ref(formData), validationRules)

// Watch warehouse prop to update form data
watch(() => props.warehouse, async (newVal) => {
  if (newVal) {
    formData.code = newVal.code || ''
    formData.name = newVal.name || ''
    formData.address = newVal.address || ''
    formData.city = newVal.city || ''
    formData.district = newVal.district || ''
    formData.latitude = newVal.latitude ? parseFloat(newVal.latitude) : null
    formData.longitude = newVal.longitude ? parseFloat(newVal.longitude) : null
    formData.phone = newVal.phone || ''
    formData.manager_name = newVal.manager_name || ''
    formData.priority = newVal.priority || 0
    formData.is_active = newVal.is_active !== undefined ? newVal.is_active : true

    await nextTick()
  } else {
    resetForm()
    clearErrors()
  }
}, { immediate: true })

// Reset form
function resetForm() {
  formData.code = ''
  formData.name = ''
  formData.address = ''
  formData.city = ''
  formData.district = ''
  formData.latitude = null
  formData.longitude = null
  formData.phone = ''
  formData.manager_name = ''
  formData.priority = 0
  formData.is_active = true
}

// Validate and submit form
function validateAndSubmit() {
  if (!validateForm()) {
    return
  }
  
  isSubmitting.value = true

  try {
    // Create submit data
    const submitData = {
      code: formData.code,
      name: formData.name
    }

    // Optional fields
    if (formData.address) {
      submitData.address = formData.address
    }
    if (formData.city) {
      submitData.city = formData.city
    }
    if (formData.district) {
      submitData.district = formData.district
    }
    if (formData.latitude !== null) {
      submitData.latitude = formData.latitude
    }
    if (formData.longitude !== null) {
      submitData.longitude = formData.longitude
    }
    if (formData.phone) {
      submitData.phone = formData.phone
    }
    if (formData.manager_name) {
      submitData.manager_name = formData.manager_name
    }
    if (formData.priority !== undefined) {
      submitData.priority = formData.priority
    }
    if (formData.is_active !== undefined) {
      submitData.is_active = formData.is_active
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

