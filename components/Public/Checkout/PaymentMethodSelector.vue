<template>
  <div class="bg-white rounded-lg shadow-lg overflow-hidden">
    <div class="bg-green-600 px-6 py-6">
      <h2 class="text-2xl font-bold text-white flex items-center">
        <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-3">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        Phương thức thanh toán
      </h2>
      <p class="text-green-100 text-sm mt-1">Chọn phương thức thanh toán phù hợp</p>
    </div>
    
    <div class="p-8">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-8">
        <LoadingSpinner size="md" />
        <p class="text-gray-500 mt-2">Đang tải phương thức thanh toán...</p>
      </div>

      <!-- Payment Methods -->
      <div v-else-if="paymentMethods.length > 0" class="space-y-3">
        <div
          v-for="method in paymentMethods"
          :key="method.id"
          class="relative flex items-start p-5 border rounded-lg cursor-pointer transition-all hover:shadow-md"
          :class="selectedMethodId === method.id
            ? 'border-green-500 bg-green-50 shadow-md'
            : 'border-gray-200 hover:border-green-300 bg-white'"
          @click="selectMethod(method.id)"
        >
          <div class="flex items-center h-6">
            <div class="relative">
              <input
                type="radio"
                :checked="selectedMethodId === method.id"
                class="w-5 h-5 text-green-600 border-2 border-gray-300 focus:ring-green-500"
                @click.stop
              />
              <div v-if="selectedMethodId === method.id" class="absolute inset-0 flex items-center justify-center pointer-events-none">
                <svg class="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          <div class="ml-4 flex-1">
            <div class="font-bold text-gray-800 text-lg">{{ method.name }}</div>
            <div class="text-sm text-gray-600 mt-2">{{ method.description }}</div>
            
            <!-- Payment Method Icons -->
            <div class="flex items-center mt-3">
              <div v-if="method.code === 'cod'" class="flex items-center text-sm text-gray-500">
                <svg class="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Thanh toán khi nhận hàng</span>
              </div>
              
              <div v-else-if="method.code === 'bank_transfer'" class="flex items-center text-sm text-gray-500">
                <svg class="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span>Chuyển khoản ngân hàng</span>
              </div>
              
              <div v-else-if="['vnpay', 'momo', 'zalopay'].includes(method.code)" class="flex items-center text-sm text-gray-500">
                <svg class="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span>Ví điện tử</span>
              </div>
              
              <div v-else class="flex items-center text-sm text-gray-500">
                <svg class="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span>Thẻ tín dụng/ghi nợ</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-8">
        <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        <p class="text-gray-500 text-lg">Không có phương thức thanh toán nào</p>
        <p class="text-gray-400 text-sm mt-1">Vui lòng thử lại sau</p>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mt-4 rounded-md bg-red-50 p-4">
        <div class="flex">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Lỗi tải phương thức thanh toán</h3>
            <div class="mt-1 text-sm text-red-700">{{ error }}</div>
          </div>
        </div>
      </div>

      <!-- Payment Details (conditional) -->
      <div v-if="selectedMethod && showPaymentDetails" class="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 class="text-sm font-medium text-gray-900 mb-4">Thông tin thanh toán</h4>
        
        <!-- COD Info -->
        <div v-if="selectedMethod.code === 'cod'" class="space-y-3">
          <div class="bg-blue-50 p-4 rounded-lg">
            <p class="text-sm text-blue-800">
              <strong>Thanh toán khi nhận hàng (COD)</strong><br>
              Bạn sẽ thanh toán khi nhận được sản phẩm. Vui lòng chuẩn bị đủ số tiền {{ formatCurrency(totalAmount) }}.
            </p>
          </div>
        </div>

        <!-- Bank Transfer Info -->
        <div v-else-if="selectedMethod.code === 'bank_transfer'" class="space-y-3">
          <div class="bg-white p-4 rounded border border-gray-200">
            <h5 class="font-medium text-gray-900 mb-2">Thông tin chuyển khoản</h5>
            <div class="text-sm text-gray-600 space-y-1">
              <p><strong>Ngân hàng:</strong> Vietcombank</p>
              <p><strong>Số tài khoản:</strong> 1234567890</p>
              <p><strong>Chủ tài khoản:</strong> CÔNG TY ABC</p>
              <p><strong>Nội dung:</strong> Thanh toán đơn hàng</p>
            </div>
          </div>
          <p class="text-xs text-gray-500">
            Vui lòng chuyển khoản và chúng tôi sẽ xác nhận sau khi nhận được thanh toán.
          </p>
        </div>

        <!-- E-wallet Info -->
        <div v-else-if="['vnpay', 'momo', 'zalopay'].includes(selectedMethod.code)" class="space-y-3">
          <div class="bg-white p-4 rounded border border-gray-200">
            <p class="text-sm text-gray-600">
              Bạn sẽ được chuyển đến trang thanh toán của {{ selectedMethod.name }} để hoàn tất thanh toán.
            </p>
          </div>
        </div>

        <!-- Card Payment Info -->
        <div v-else class="space-y-3">
          <div class="bg-white p-4 rounded border border-gray-200">
            <p class="text-sm text-gray-600">
              Bạn sẽ được chuyển đến trang thanh toán an toàn để nhập thông tin thẻ.
            </p>
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="flex justify-between mt-8 pt-6 border-t-2 border-gray-200">
        <button
          type="button"
          @click="$emit('previous')"
          class="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          ← Quay lại
        </button>
        
        <button
          type="button"
          @click="handleContinue"
          :disabled="!selectedMethodId || isSubmitting"
          class="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
        >
          <svg v-if="isSubmitting" class="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span v-if="isSubmitting">Đang xử lý...</span>
          <span v-else>Tiếp tục →</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { formatCurrency } from '~/utils/formatters'
import LoadingSpinner from '~/components/Core/Loading/LoadingSpinner.vue'

interface PaymentMethodData {
  id: number
  name: string
  description?: string
  code: string
  is_active: boolean
}

interface Props {
  modelValue?: number | null
  paymentMethods: PaymentMethodData[]
  totalAmount?: number
  loading?: boolean
  error?: string
  isSubmitting?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: number): void
  (e: 'method-selected', method: PaymentMethodData): void
  (e: 'continue'): void
  (e: 'previous'): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  totalAmount: 0,
  loading: false,
  isSubmitting: false,
  paymentMethods: () => []
})

const emit = defineEmits<Emits>()

const selectedMethodId = ref<number | null>(props.modelValue)

// Computed
const selectedMethod = computed(() => {
  return props.paymentMethods.find(m => m.id === selectedMethodId.value)
})

const showPaymentDetails = computed(() => {
  return selectedMethod.value !== undefined
})

// Methods
const selectMethod = (methodId: number) => {
  selectedMethodId.value = methodId
  emit('update:modelValue', methodId)
  
  const method = props.paymentMethods.find(m => m.id === methodId)
  if (method) {
    emit('method-selected', method)
  }
}

const handleContinue = () => {
  if (selectedMethodId.value) {
    emit('continue')
  }
}

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  selectedMethodId.value = newValue
})

// Auto-select first method if available and no method is selected
watch(() => props.paymentMethods, (newMethods) => {
  if (newMethods && newMethods.length > 0 && !selectedMethodId.value) {
    if (newMethods[0] && newMethods[0].id) {
      selectMethod(newMethods[0].id)
    }
  }
}, { immediate: true })
</script>