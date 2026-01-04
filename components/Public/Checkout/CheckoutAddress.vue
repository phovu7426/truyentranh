<template>
  <div class="bg-white rounded-lg shadow-lg overflow-hidden">
    <div class="bg-blue-600 px-6 py-6">
      <h2 class="text-2xl font-bold text-white flex items-center">
        <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-3">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        Thông tin giao hàng
      </h2>
      <p class="text-blue-100 text-sm mt-1">Nhập thông tin nhận hàng của bạn</p>
    </div>
    
    <form @submit.prevent="handleSubmit" class="p-8">
      <div class="space-y-6">
        <!-- Customer Name -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
            <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Họ và tên <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <input
              v-model="form.name"
              type="text"
              class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pl-12 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              placeholder="Nguyễn Văn A"
              :class="{ 'border-red-500 focus:ring-red-200': errors.name }"
            />
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <span v-if="errors.name" class="text-red-500 text-sm mt-1 flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ errors.name }}
          </span>
        </div>

        <!-- Customer Email -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
            <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Email <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <input
              v-model="form.email"
              type="email"
              class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pl-12 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              placeholder="email@example.com"
              :class="{ 'border-red-500 focus:ring-red-200': errors.email }"
            />
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <span v-if="errors.email" class="text-red-500 text-sm mt-1 flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ errors.email }}
          </span>
        </div>

        <!-- Customer Phone -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
            <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Số điện thoại <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <input
              v-model="form.phone"
              type="tel"
              class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pl-12 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              placeholder="0901234567"
              :class="{ 'border-red-500 focus:ring-red-200': errors.phone }"
            />
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
          </div>
          <span v-if="errors.phone" class="text-red-500 text-sm mt-1 flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ errors.phone }}
          </span>
        </div>

        <!-- Shipping Address -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
            <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Địa chỉ <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <input
              v-model="form.address"
              type="text"
              class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pl-12 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              placeholder="Số nhà, tên đường, phường"
              :class="{ 'border-red-500 focus:ring-red-200': errors.address }"
            />
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <span v-if="errors.address" class="text-red-500 text-sm mt-1 flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ errors.address }}
          </span>
        </div>

        <!-- District and City -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Quận/Huyện <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <input
                v-model="form.district"
                type="text"
                class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pl-12 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                placeholder="Quận 1"
                :class="{ 'border-red-500 focus:ring-red-200': errors.district }"
              />
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            <span v-if="errors.district" class="text-red-500 text-sm mt-1 flex items-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ errors.district }}
            </span>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Tỉnh/Thành phố <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <input
                v-model="form.city"
                type="text"
                class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pl-12 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                placeholder="TP. Hồ Chí Minh"
                :class="{ 'border-red-500 focus:ring-red-200': errors.city }"
                @blur="$emit('city-changed', form.city)"
              />
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <span v-if="errors.city" class="text-red-500 text-sm mt-1 flex items-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ errors.city }}
            </span>
          </div>
        </div>

        <!-- Notes -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
            <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Ghi chú
          </label>
          <div class="relative">
            <textarea
              v-model="form.notes"
              rows="3"
              class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pl-12 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none transition-all"
              placeholder="Ghi chú thêm cho đơn hàng (tùy chọn)..."
            ></textarea>
            <div class="absolute top-4 left-4 flex items-start pointer-events-none">
              <svg class="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="flex justify-end mt-8 pt-6 border-t-2 border-gray-200">
        <button
          type="submit"
          :disabled="isSubmitting"
          class="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
        >
          <svg v-if="isSubmitting" class="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span v-if="isSubmitting">Đang lưu...</span>
          <span v-else>Lưu và tiếp tục →</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'

interface AddressForm {
  name: string
  email: string
  phone: string
  address: string
  district: string
  city: string
  notes: string
}

interface Props {
  initialData?: Partial<AddressForm>
  isSubmitting?: boolean
}

interface Emits {
  (e: 'submit', data: AddressForm): void
  (e: 'city-changed', city: string): void
}

const props = withDefaults(defineProps<Props>(), {
  isSubmitting: false
})

const emit = defineEmits<Emits>()

// Form state
const form = reactive<AddressForm>({
  name: props.initialData?.name || '',
  email: props.initialData?.email || '',
  phone: props.initialData?.phone || '',
  address: props.initialData?.address || '',
  district: props.initialData?.district || '',
  city: props.initialData?.city || '',
  notes: props.initialData?.notes || ''
})

const errors = reactive<Record<string, string>>({})

// Validation
const validateAddressForm = (): boolean => {
  const newErrors: Record<string, string> = {}

  if (!form.name.trim()) {
    newErrors.name = 'Vui lòng nhập họ và tên'
  }

  if (!form.email.trim()) {
    newErrors.email = 'Vui lòng nhập email'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    newErrors.email = 'Email không hợp lệ'
  }

  if (!form.phone.trim()) {
    newErrors.phone = 'Vui lòng nhập số điện thoại'
  } else if (!/^[0-9]{10,11}$/.test(form.phone.replace(/\s/g, ''))) {
    newErrors.phone = 'Số điện thoại không hợp lệ'
  }

  if (!form.address.trim()) {
    newErrors.address = 'Vui lòng nhập địa chỉ'
  }

  if (!form.district.trim()) {
    newErrors.district = 'Vui lòng nhập quận/huyện'
  }

  if (!form.city.trim()) {
    newErrors.city = 'Vui lòng nhập tỉnh/thành phố'
  }

  // Clear previous errors and set new ones
  Object.keys(errors).forEach(key => delete errors[key])
  Object.assign(errors, newErrors)

  return Object.keys(newErrors).length === 0
}

// Submit handler
const handleSubmit = () => {
  if (validateAddressForm()) {
    emit('submit', { ...form })
  }
}

// Initialize form with initial data
const initializeForm = () => {
  if (props.initialData) {
    // Only update fields that are empty in the current form
    // This prevents overwriting user input when parent component updates
    if (!form.name && props.initialData.name) form.name = props.initialData.name
    if (!form.email && props.initialData.email) form.email = props.initialData.email
    if (!form.phone && props.initialData.phone) form.phone = props.initialData.phone
    if (!form.address && props.initialData.address) form.address = props.initialData.address
    if (!form.district && props.initialData.district) form.district = props.initialData.district
    if (!form.notes && props.initialData.notes) form.notes = props.initialData.notes
    
    // Always update city as it might trigger shipping calculation
    if (props.initialData.city !== undefined) form.city = props.initialData.city
  }
}

// Watch for initial data changes
watch(() => props.initialData, (newData) => {
  if (newData) {
    initializeForm()
  }
}, { deep: true })

// Initialize form on component mount
onMounted(() => {
  initializeForm()
})
</script>