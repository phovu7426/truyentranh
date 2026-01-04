<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
    <div class="max-w-2xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Thanh toán đơn hàng</h1>
        <p class="text-gray-600">Nhập thông tin thanh toán để hoàn tất đơn hàng</p>
      </div>

      <!-- Order Info Card -->
      <div v-if="orderInfo" class="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Thông tin đơn hàng</h2>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">Mã đơn hàng:</span>
            <span class="font-medium text-gray-900">{{ orderInfo.order_number }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Số tiền:</span>
            <span class="font-bold text-blue-600 text-lg">{{ formatCurrency(orderInfo.total_amount) }}</span>
          </div>
        </div>
      </div>

      <!-- Payment Form Card -->
      <div class="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div class="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <h2 class="text-xl font-bold text-white flex items-center">
            <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Thông tin thẻ thanh toán
          </h2>
        </div>

        <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
          <!-- Error Message -->
          <div v-if="error" class="bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-red-700">{{ error }}</p>
              </div>
            </div>
          </div>

          <!-- Card Number -->
          <div>
            <label for="cardNumber" class="block text-sm font-medium text-gray-700 mb-2">
              Số thẻ <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <input
                id="cardNumber"
                v-model="form.cardNumber"
                type="text"
                placeholder="1234 5678 9012 3456"
                maxlength="19"
                class="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-lg font-mono"
                @input="formatCardNumber"
                required
              />
              <div class="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
            </div>
            <p class="mt-1 text-xs text-gray-500">Ví dụ: 4111 1111 1111 1111 (Visa) hoặc 5555 5555 5555 4444 (Mastercard)</p>
          </div>

          <!-- Card Holder Name -->
          <div>
            <label for="cardHolder" class="block text-sm font-medium text-gray-700 mb-2">
              Tên chủ thẻ <span class="text-red-500">*</span>
            </label>
            <input
              id="cardHolder"
              v-model="form.cardHolder"
              type="text"
              placeholder="NGUYEN VAN A"
              class="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 uppercase"
              required
            />
          </div>

          <!-- Expiry Date and CVV -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="expiryDate" class="block text-sm font-medium text-gray-700 mb-2">
                Ngày hết hạn <span class="text-red-500">*</span>
              </label>
              <input
                id="expiryDate"
                v-model="form.expiryDate"
                type="text"
                placeholder="MM/YY"
                maxlength="5"
                class="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 font-mono"
                @input="formatExpiryDate"
                required
              />
            </div>
            <div>
              <label for="cvv" class="block text-sm font-medium text-gray-700 mb-2">
                CVV <span class="text-red-500">*</span>
              </label>
              <input
                id="cvv"
                v-model="form.cvv"
                type="text"
                placeholder="123"
                maxlength="4"
                class="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 font-mono"
                @input="formatCVV"
                required
              />
            </div>
          </div>

          <!-- Payment Method Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Phương thức thanh toán
            </label>
            <div class="grid grid-cols-3 gap-3">
              <button
                type="button"
                @click="form.gateway = 'vnpay'"
                :class="[
                  'p-4 border-2 rounded-lg transition-all',
                  form.gateway === 'vnpay'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                ]"
              >
                <div class="text-center">
                  <div class="text-xs font-medium text-gray-700 mb-1">VNPay</div>
                  <div class="text-xs text-gray-500">Thành công</div>
                </div>
              </button>
              <button
                type="button"
                @click="form.gateway = 'momo'"
                :class="[
                  'p-4 border-2 rounded-lg transition-all',
                  form.gateway === 'momo'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                ]"
              >
                <div class="text-center">
                  <div class="text-xs font-medium text-gray-700 mb-1">MoMo</div>
                  <div class="text-xs text-gray-500">Thành công</div>
                </div>
              </button>
              <button
                type="button"
                @click="form.gateway = 'test_fail'"
                :class="[
                  'p-4 border-2 rounded-lg transition-all',
                  form.gateway === 'test_fail'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                ]"
              >
                <div class="text-center">
                  <div class="text-xs font-medium text-gray-700 mb-1">Test</div>
                  <div class="text-xs text-red-500">Thất bại</div>
                </div>
              </button>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="pt-4">
            <button
              type="submit"
              :disabled="isSubmitting"
              class="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center"
            >
              <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span v-if="isSubmitting">Đang xử lý...</span>
              <span v-else>Thanh toán ngay</span>
            </button>
          </div>

          <!-- Cancel Button -->
          <div class="text-center">
            <NuxtLink
              :to="cancelUrl"
              class="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Hủy thanh toán
            </NuxtLink>
          </div>
        </form>
      </div>

      <!-- Info Box -->
      <div class="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-blue-800">Đây là trang thanh toán giả (Mock Payment)</h3>
            <div class="mt-2 text-sm text-blue-700">
              <p>Trang này được sử dụng để test luồng thanh toán. Bạn có thể nhập bất kỳ thông tin thẻ nào để test.</p>
              <p class="mt-1">Chọn VNPay hoặc MoMo để test thanh toán thành công, hoặc Test để test thanh toán thất bại.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePayments } from '~/composables/payments/usePayments'
import { useToast } from '~/composables/ui/useToast'
import { formatCurrency } from '~/utils/formatters'

const route = useRoute()
const router = useRouter()
const { verifyPayment } = usePayments()
const { showSuccess, showError } = useToast()

// Form state
const form = reactive({
  cardNumber: '',
  cardHolder: '',
  expiryDate: '',
  cvv: '',
  gateway: 'vnpay' // Default to vnpay
})

const isSubmitting = ref(false)
const error = ref('')
const orderInfo = ref<any>(null)
const cancelUrl = ref('/home/orders')

// Format card number with spaces
const formatCardNumber = (event: Event) => {
  const input = event.target as HTMLInputElement
  let value = input.value.replace(/\s/g, '')
  value = value.replace(/\D/g, '')
  
  if (value.length > 16) {
    value = value.slice(0, 16)
  }
  
  // Add spaces every 4 digits
  const formatted = value.match(/.{1,4}/g)?.join(' ') || value
  form.cardNumber = formatted
}

// Format expiry date as MM/YY
const formatExpiryDate = (event: Event) => {
  const input = event.target as HTMLInputElement
  let value = input.value.replace(/\D/g, '')
  
  if (value.length > 4) {
    value = value.slice(0, 4)
  }
  
  if (value.length >= 2) {
    value = value.slice(0, 2) + '/' + value.slice(2)
  }
  
  form.expiryDate = value
}

// Format CVV (only numbers, max 4 digits)
const formatCVV = (event: Event) => {
  const input = event.target as HTMLInputElement
  let value = input.value.replace(/\D/g, '')
  
  if (value.length > 4) {
    value = value.slice(0, 4)
  }
  
  form.cvv = value
}

// Handle form submission
const handleSubmit = async () => {
  try {
    isSubmitting.value = true
    error.value = ''

    // Validate form
    if (!form.cardNumber || form.cardNumber.replace(/\s/g, '').length < 13) {
      error.value = 'Vui lòng nhập số thẻ hợp lệ'
      isSubmitting.value = false
      return
    }

    if (!form.cardHolder || form.cardHolder.length < 3) {
      error.value = 'Vui lòng nhập tên chủ thẻ'
      isSubmitting.value = false
      return
    }

    if (!form.expiryDate || form.expiryDate.length !== 5) {
      error.value = 'Vui lòng nhập ngày hết hạn hợp lệ (MM/YY)'
      isSubmitting.value = false
      return
    }

    if (!form.cvv || form.cvv.length < 3) {
      error.value = 'Vui lòng nhập CVV hợp lệ'
      isSubmitting.value = false
      return
    }

    // Get order info from query params
    const orderId = route.query.order_id as string
    const orderNumber = route.query.order_number as string || `ORD-${Date.now()}`
    const amount = route.query.amount as string || '0'
    const returnUrl = route.query.return_url as string || '/home/order-success'

    // Prepare mock payment response data based on gateway
    const mockPaymentData: Record<string, string> = {
      vnp_Amount: (parseFloat(amount) * 100).toString(), // Convert to cents
      vnp_BankCode: 'NCB',
      vnp_CardType: 'ATM',
      vnp_OrderInfo: `Thanh toan don hang ${orderNumber}`,
      vnp_PayDate: new Date().toISOString().replace(/[-:]/g, '').split('.')[0] || '',
      vnp_ResponseCode: form.gateway === 'test_fail' ? '07' : '00', // 00 = success, 07 = failed
      vnp_TmnCode: 'TEST',
      vnp_TransactionNo: `TEST${Date.now()}`,
      vnp_TxnRef: orderNumber,
      vnp_SecureHash: 'mock_hash_' + Date.now()
    }

    // For MoMo, use different field names
    if (form.gateway === 'momo') {
      const newData: Record<string, string> = {}
      Object.keys(mockPaymentData).forEach(key => {
        const newKey = key.replace('vnp_', 'momo_')
        const value = mockPaymentData[key]
        if (value) {
          newData[newKey] = value
        }
      })
      newData.momo_ResponseCode = '0'
      Object.keys(mockPaymentData).forEach(key => delete mockPaymentData[key])
      Object.assign(mockPaymentData, newData)
    }

    // Call verify payment API
    try {
      const result = await verifyPayment(form.gateway === 'test_fail' ? 'vnpay' : form.gateway, mockPaymentData)
      
      if (result && result.payment_status === 'paid') {
        showSuccess('Thanh toán thành công!')
        // Redirect to return URL after a short delay
        // If returnUrl already has access_url, use it; otherwise add order_id
        const separator = returnUrl.includes('?') ? '&' : '?'
        const redirectUrl = returnUrl.includes('access_url') 
          ? returnUrl 
          : returnUrl + `${separator}order_id=${orderId || result.order_id}&payment_status=success`
        setTimeout(() => {
          router.push(redirectUrl)
        }, 1500)
      } else {
        throw new Error('Thanh toán thất bại')
      }
    } catch (verifyError: any) {
      // If verify fails, still redirect but with error status
      if (form.gateway === 'test_fail') {
        showError('Thanh toán thất bại (Test mode)')
        const separator = returnUrl.includes('?') ? '&' : '?'
        const redirectUrl = returnUrl.includes('access_url')
          ? returnUrl
          : returnUrl + `${separator}order_id=${orderId}&payment_status=failed`
        setTimeout(() => {
          router.push(redirectUrl)
        }, 1500)
      } else {
        throw verifyError
      }
    }

  } catch (err: any) {
    error.value = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi xử lý thanh toán'
    showError(error.value)
  } finally {
    isSubmitting.value = false
  }
}

// Load order info from query params
onMounted(() => {
  const orderId = route.query.order_id as string
  const orderNumber = route.query.order_number as string
  const amount = route.query.amount as string

  if (orderId || orderNumber || amount) {
    orderInfo.value = {
      order_id: orderId,
      order_number: orderNumber || `ORD-${orderId || 'N/A'}`,
      total_amount: amount || '0'
    }
  }

  // Set cancel URL
  if (route.query.cancel_url) {
    cancelUrl.value = route.query.cancel_url as string
  } else if (orderId) {
    cancelUrl.value = `/home/orders/${orderId}`
  }
})
</script>

<style scoped>
/* Hide scrollbar but keep functionality */
html {
  overflow-x: hidden;
}

body {
  overflow-x: hidden;
}

/* Custom input focus styles */
input:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

/* Card number font */
#cardNumber {
  letter-spacing: 0.1em;
}

/* Ensure no double scrollbars */
.max-w-2xl {
  overflow-x: hidden;
}

/* Hide scrollbar for webkit browsers */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
