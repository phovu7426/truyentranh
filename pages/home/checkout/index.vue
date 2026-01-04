<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Progress Steps -->
      <div class="mb-8">
        <CheckoutProgress
          :steps="steps"
          :current-step="currentStepId"
          @step-change="handleStepChange"
        />
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mb-6 rounded-lg bg-red-50 border-l-4 border-red-400 p-6 shadow-lg">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg class="h-6 w-6 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-medium text-red-800">Có lỗi xảy ra</h3>
            <div class="mt-2 text-sm text-red-700">{{ error }}</div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-20">
        <div class="text-center">
          <LoadingSpinner size="xl" />
          <p class="mt-4 text-gray-600 font-medium">Đang tải thông tin thanh toán...</p>
        </div>
      </div>

      <!-- Main Content -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Steps Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Step 1: Shipping Address -->
          <CheckoutAddress
            v-if="currentStepId === 'address'"
            key="address-step"
            :initial-data="addressForm"
            :is-submitting="addressSubmitting"
            @submit="handleAddressSubmit"
            @city-changed="handleCityChanged"
          />

          <!-- Step 2: Shipping Method -->
          <ShippingMethodSelector
            v-if="currentStepId === 'shipping'"
            key="shipping-step"
            v-model="selectedShippingMethodId"
            :shipping-methods="shippingMethods as any[]"
            :loading="shippingMethodsLoading"
            :error="shippingMethodsError || undefined"
            :is-submitting="shippingSubmitting"
            @method-selected="handleShippingMethodSelected"
            @continue="handleShippingContinue"
            @previous="previousStep"
          />

          <!-- Step 3: Payment Method -->
          <PaymentMethodSelector
            v-if="currentStepId === 'payment'"
            key="payment-step"
            v-model="selectedPaymentMethodId"
            :payment-methods="paymentMethods as any[]"
            :total-amount="orderTotalAmount"
            :loading="paymentMethodsLoading"
            :error="paymentMethodsError || undefined"
            :is-submitting="paymentSubmitting"
            @method-selected="handlePaymentMethodSelected"
            @continue="handlePaymentContinue"
            @previous="previousStep"
          />

          <!-- Step 4: Review & Confirm -->
          <div v-if="currentStepId === 'review'" class="bg-white rounded-xl shadow-lg overflow-hidden" key="review-step">
            <div class="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-6">
              <h2 class="text-2xl font-bold text-white flex items-center">
                <div class="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mr-3">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                Xác nhận đơn hàng
              </h2>
              <p class="text-green-100 text-sm mt-1">Kiểm tra lại thông tin trước khi đặt hàng</p>
            </div>
            
            <div class="p-8">
              <!-- Shipping Info Review -->
              <div class="mb-6 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 shadow-lg">
                <h3 class="font-bold text-gray-800 mb-4 flex items-center text-lg">
                  <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  Thông tin giao hàng
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div class="flex items-center">
                    <span class="font-semibold text-gray-700 mr-2">Người nhận:</span>
                    <span class="text-gray-900 font-medium">{{ addressForm.name }}</span>
                  </div>
                  <div class="flex items-center">
                    <span class="font-semibold text-gray-700 mr-2">SĐT:</span>
                    <span class="text-gray-900 font-medium">{{ addressForm.phone }}</span>
                  </div>
                  <div v-if="addressForm.email" class="flex items-center">
                    <span class="font-semibold text-gray-700 mr-2">Email:</span>
                    <span class="text-gray-900 font-medium">{{ addressForm.email }}</span>
                  </div>
                  <div class="flex items-center">
                    <span class="font-semibold text-gray-700 mr-2">Thời gian giao:</span>
                    <span class="text-gray-900 font-medium">{{ selectedShippingMethod?.estimated_delivery || '2-3 ngày làm việc' }}</span>
                  </div>
                  <div class="md:col-span-2">
                    <span class="font-semibold text-gray-700">Địa chỉ:</span>
                    <span class="text-gray-900 font-medium ml-2">{{ addressForm.address }}, {{ addressForm.district }}, {{ addressForm.city }}</span>
                  </div>
                  <div v-if="addressForm.notes" class="md:col-span-2">
                    <span class="font-semibold text-gray-700">Ghi chú:</span>
                    <span class="text-gray-900 font-medium ml-2">{{ addressForm.notes }}</span>
                  </div>
                </div>
              </div>

              <!-- Methods Review -->
              <div class="mb-6 p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200 shadow-lg">
                <h3 class="font-bold text-gray-800 mb-4 flex items-center text-lg">
                  <div class="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  Phương thức đã chọn
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="bg-white p-4 rounded-lg border border-green-200 shadow-sm">
                    <div class="flex items-center mb-2">
                      <svg class="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      <span class="font-semibold text-gray-700">Vận chuyển:</span>
                    </div>
                    <p class="text-gray-900 font-medium">{{ selectedShippingMethod?.name }}</p>
                    <p class="text-blue-600 font-bold mt-1">{{ formatCurrency(Number(selectedShippingMethod?.calculated_cost || selectedShippingMethod?.base_cost || shippingCost || 0)) }}</p>
                    <p v-if="selectedShippingMethod?.description" class="text-xs text-gray-600 mt-1">{{ selectedShippingMethod.description }}</p>
                  </div>
                  <div class="bg-white p-4 rounded-lg border border-green-200 shadow-sm">
                    <div class="flex items-center mb-2">
                      <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <span class="font-semibold text-gray-700">Thanh toán:</span>
                    </div>
                    <p class="text-gray-900 font-medium">{{ selectedPaymentMethod?.name }}</p>
                    <p v-if="selectedPaymentMethod?.description" class="text-xs text-gray-600 mt-1">{{ selectedPaymentMethod.description }}</p>
                  </div>
                </div>
              </div>

              <!-- Cart Items Review -->
              <div class="mb-6 p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200 shadow-lg">
                <h3 class="font-bold text-gray-800 mb-4 flex items-center text-lg">
                  <div class="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  Sản phẩm ({{ cartItems.length }})
                </h3>
                <div class="space-y-3 max-h-80 overflow-y-auto pr-2">
                  <div v-for="item in cartItems" :key="item.id" class="flex gap-4 p-3 bg-white rounded-lg border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                    <img
                      v-if="item.product_image"
                      :src="item.product_image"
                      :alt="item.product_name"
                      class="w-20 h-20 object-cover rounded-lg shadow-sm"
                    />
                    <div class="flex-1 min-w-0">
                      <div class="font-bold text-gray-800 text-lg truncate">{{ item.product_name }}</div>
                      <div class="text-sm text-gray-600 mt-1">{{ item.variant_name }}</div>
                      <div class="flex items-center justify-between mt-2">
                        <div>
                          <span class="text-sm font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded">SL: {{ item.quantity }}</span>
                          <span class="text-sm text-gray-500 ml-2">{{ formatCurrency(item.price) }}/sp</span>
                        </div>
                        <span class="text-lg font-bold text-gray-900">{{ formatCurrency(item.total_price) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Order Summary -->
              <div class="mb-6 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 shadow-lg">
                <h3 class="font-bold text-gray-800 mb-4 flex items-center text-lg">
                  <div class="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center mr-3">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  Tóm tắt đơn hàng
                </h3>
                <div class="space-y-2">
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Tạm tính ({{ cartItems.length }} sản phẩm):</span>
                    <span class="font-medium">{{ formatCurrency(cartSubtotal) }}</span>
                  </div>
                  <div class="border-t pt-2 mt-2">
                    <div class="flex justify-between">
                      <span class="font-bold text-gray-800">Tổng cộng:</span>
                      <span class="font-bold text-lg text-green-600">{{ formatCurrency(Number(cartSubtotal) - Number(discountAmount)) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Navigation Buttons -->
              <div class="flex justify-between mt-8 pt-6 border-t-2 border-gray-200">
                <button
                  @click="previousStep"
                  class="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-all duration-300 transform hover:scale-105"
                >
                  ← Quay lại
                </button>

                <button
                  @click="handlePlaceOrder"
                  :disabled="submitting"
                  class="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 flex items-center shadow-lg"
                >
                  <svg v-if="submitting" class="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span v-if="submitting">Đang xử lý...</span>
                  <span v-else>✓ Xác nhận đặt hàng</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Summary Sidebar -->
        <div class="lg:col-span-1">
          <OrderSummary
            :cart-items="cartItems"
            :subtotal="cartSubtotal"
            :shipping-cost="0"
            :discount="discountAmount"
            :total-amount="orderTotalAmount"
            :selected-shipping-method="selectedShippingMethod"
            :selected-payment-method="selectedPaymentMethod"
            :show-methods-summary="currentStepId !== 'address'"
            :show-place-order-button="currentStepId === 'review'"
            :is-submitting="submitting"
            :can-place-order="!!canPlaceOrder"
            :applied-coupon="appliedCoupon"
            :coupon-code="appliedCoupon?.code || couponCode"
            :is-applying-coupon="isApplyingCoupon"
            :has-available-coupons="hasAvailableCoupons"
            :usable-coupons="usableCoupons"
            :show-available-coupons="showAvailableCoupons"
            @place-order="handlePlaceOrder"
            @apply-coupon="handleApplyCoupon"
            @remove-coupon="handleRemoveCoupon"
            @apply-coupon-code="applyCouponCode"
            @toggle-available-coupons="showAvailableCoupons = !showAvailableCoupons"
            @update:couponCode="couponCode = $event"
          />
        </div>
      </div>
    </div>

    <!-- Payment Modal -->
    <PaymentModal
      :is-open="isPaymentModalOpen"
      :payment-url="paymentUrl"
      :order-id="currentOrderId || undefined"
      :order-number="currentOrderNumber"
      @close="handlePaymentModalClose"
      @payment-success="handlePaymentSuccess"
      @payment-cancel="handlePaymentCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCart } from '~/composables/cart'
import { useDiscount } from '~/composables/discount'
import { usePayments } from '~/composables/payments/usePayments'
import useCheckout from '~/composables/orders/useCheckout'
import { useApiClient } from '~/composables/api/useApiClient'
import { publicEndpoints } from '@/api/endpoints'
import { useToast } from '~/composables/ui/useToast'
import { formatCurrency } from '~/utils/formatters'
import LoadingSpinner from '~/components/Core/Loading/LoadingSpinner.vue'
import CheckoutProgress from '@/components/Public/Checkout/CheckoutProgress.vue'
import CheckoutAddress from '@/components/Public/Checkout/CheckoutAddress.vue'
import ShippingMethodSelector from '@/components/Public/Checkout/ShippingMethodSelector.vue'
import PaymentMethodSelector from '@/components/Public/Checkout/PaymentMethodSelector.vue'
import OrderSummary from '@/components/Public/Checkout/OrderSummary.vue'
import PaymentModal from '~/components/Home/components/checkout/PaymentModal.vue'
import { useSeo } from '@/composables/seo'

definePageMeta({
  layout: 'home',
  middleware: 'auth'
})

// SEO configuration
useSeo({
  title: 'Thanh toán',
  description: 'Hoàn tất đơn hàng của bạn',
  type: 'website',
  noindex: true
})

const router = useRouter()
const route = useRoute()
const { apiClient } = useApiClient()
const {
  items: cartItems,
  subtotal: cartSubtotal,
  discountAmount,
  totalAmount,
  appliedCoupon,
  hasAppliedCoupon,
  isLoading,
  fetchCart: initializeCart,
  cartUuid,
  cart
} = useCart()

// Use discount composable
const {
  availableCoupons,
  usableCoupons,
  hasAvailableCoupons,
  validateCoupon,
  formatDiscountText,
  fetchAvailableCoupons,
  applyCoupon,
  removeCoupon
} = useDiscount()

// Use payments composable
const { createPaymentUrl } = usePayments()

// Initialize checkout composable
const checkout = useCheckout({
  immediate: true
})

const { showSuccess, showError } = useToast()

// Steps configuration
const steps = [
  { id: 'address', name: 'Địa chỉ', shortName: 'Địa chỉ', description: 'Nhập thông tin giao hàng' },
  { id: 'shipping', name: 'Vận chuyển', shortName: 'Vận chuyển', description: 'Chọn phương thức vận chuyển' },
  { id: 'payment', name: 'Thanh toán', shortName: 'Thanh toán', description: 'Chọn phương thức thanh toán' },
  { id: 'review', name: 'Xác nhận', shortName: 'Xác nhận', description: 'Kiểm tra lại thông tin' }
]

// State
const currentStepId = ref('address')
const loading = ref(true)
const submitting = ref(false)
const error = ref('')
const couponCode = ref('')
const isApplyingCoupon = ref(false)
const showAvailableCoupons = ref(false)

// Form states
const addressForm = ref({
  name: '',
  email: '',
  phone: '',
  address: '',
  district: '',
  city: '',
  notes: ''
})

const addressSubmitting = ref(false)
const shippingSubmitting = ref(false)
const paymentSubmitting = ref(false)

// Payment modal state
const isPaymentModalOpen = ref(false)
const paymentUrl = ref('')
const currentOrderId = ref<string | number | null>(null)
const currentOrderNumber = ref('')
const currentAccessUrl = ref('')

// Methods
const selectedShippingMethodId = ref<number | null>(null)
const selectedPaymentMethodId = ref<number | null>(null)
const shippingCost = ref(0)

// Use checkout composable state
const shippingMethods = computed(() => checkout.shippingMethods.value || [])
const paymentMethods = computed(() => checkout.paymentMethods.value || [])

// Loading states
const shippingMethodsLoading = computed(() => checkout.isLoading.value)
const paymentMethodsLoading = computed(() => checkout.isLoading.value)
const shippingMethodsError = computed(() => checkout.errorMessage.value)
const paymentMethodsError = computed(() => checkout.errorMessage.value)

// Computed
const currentStepIndex = computed(() => {
  return steps.findIndex(step => step.id === currentStepId.value)
})

const selectedShippingMethod = computed(() => {
  return shippingMethods.value.find(m => m.id === selectedShippingMethodId.value)
})

const selectedPaymentMethod = computed(() => {
  return paymentMethods.value.find(m => m.id === selectedPaymentMethodId.value)
})

const orderTotalAmount = computed(() => {
  // Ensure cartSubtotal is a valid number
  const subtotal = Number(cartSubtotal.value) || 0
  const discount = Number(discountAmount.value) || 0
  
  // Ensure both values are valid numbers before calculating
  const validSubtotal = isNaN(subtotal) ? 0 : subtotal
  const validDiscount = isNaN(discount) ? 0 : discount
  
  return validSubtotal - validDiscount
})

const canPlaceOrder = computed(() => {
  return (
    addressForm.value.name &&
    addressForm.value.phone &&
    addressForm.value.address &&
    addressForm.value.district &&
    addressForm.value.city &&
    selectedShippingMethodId.value &&
    selectedPaymentMethodId.value
  )
})

// Navigation
const nextStep = () => {
  const nextIndex = Math.min(currentStepIndex.value + 1, steps.length - 1)
  if (steps[nextIndex]) {
    currentStepId.value = steps[nextIndex].id
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const previousStep = () => {
  const prevIndex = Math.max(currentStepIndex.value - 1, 0)
  if (steps[prevIndex]) {
    currentStepId.value = steps[prevIndex].id
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleStepChange = (stepIndex: number) => {
  if (stepIndex <= currentStepIndex.value) {
    if (steps[stepIndex]) {
      currentStepId.value = steps[stepIndex].id
    }
  }
}

// Address handlers
const handleAddressSubmit = async (data: any) => {
  try {
    addressSubmitting.value = true
    error.value = ''
    
    // Validate address data
    if (!data.name || !data.phone || !data.address || !data.district || !data.city) {
      throw new Error('Vui lòng điền đầy đủ thông tin bắt buộc')
    }
    
    // Validate email format if provided
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      throw new Error('Email không hợp lệ')
    }
    
    // Validate phone format
    if (!/^[0-9]{10,11}$/.test(data.phone.replace(/\s/g, ''))) {
      throw new Error('Số điện thoại không hợp lệ')
    }
    
    // Update form data without triggering reactivity
    Object.assign(addressForm.value, data)
    
    // Load shipping methods after address is submitted
    await checkout.fetchShippingMethods()
    
    nextStep()
  } catch (err: any) {
    error.value = err.message || 'Không thể lưu thông tin địa chỉ'
    showError(error.value)
  } finally {
    addressSubmitting.value = false
  }
}

const handleCityChanged = async (city: string) => {
  // Update city without triggering reactivity issues
  if (addressForm.value.city !== city) {
    addressForm.value.city = city
  }
  
  // Calculate shipping for all available methods when city changes
  // This will update the shipping costs in the OrderSummary component
  if (city && cartUuid.value && shippingMethods.value && shippingMethods.value.length > 0) {
    try {
      // Calculate shipping for all methods to show updated costs
      for (const method of shippingMethods.value) {
        if (method && method.id) {
          const res = await apiClient.post(`${publicEndpoints.shippingMethods.calculate}?cart_uuid=${cartUuid.value}`, {
            shipping_method_id: method.id,
            cart_value: cartSubtotal.value,
            destination: city
          })
          
          if (res.data.success) {
            // Update the method's calculated cost
            method.calculated_cost = parseFloat(res.data.data.shipping_cost || method.base_cost || '0')
          }
        }
      }
      
      // If a shipping method is already selected, update its cost
      if (selectedShippingMethodId.value) {
        await calculateShipping()
      }
    } catch (err) {
      // Failed to calculate shipping costs
    }
  }
}

// Shipping handlers
const handleShippingMethodSelected = async (method: any) => {
  try {
    selectedShippingMethodId.value = method.id
    await calculateShipping()
  } catch (err: any) {
    error.value = err.message || 'Không thể chọn phương thức vận chuyển'
    showError(error.value)
  }
}

const handleShippingContinue = async () => {
  try {
    shippingSubmitting.value = true
    error.value = ''
    
    // Validate shipping method selection
    if (!selectedShippingMethodId.value) {
      throw new Error('Vui lòng chọn phương thức vận chuyển')
    }
    
    // Load payment methods
    await checkout.fetchPaymentMethods()
    
    nextStep()
  } catch (err: any) {
    error.value = err.message || 'Không thể tiếp tục'
    showError(error.value)
  } finally {
    shippingSubmitting.value = false
  }
}

// Payment handlers
const handlePaymentMethodSelected = (method: any) => {
  try {
    selectedPaymentMethodId.value = method.id
  } catch (err: any) {
    error.value = err.message || 'Không thể chọn phương thức thanh toán'
    showError(error.value)
  }
}

const handlePaymentContinue = () => {
  try {
    error.value = ''
    
    // Validate payment method selection
    if (!selectedPaymentMethodId.value) {
      throw new Error('Vui lòng chọn phương thức thanh toán')
    }
    
    nextStep()
  } catch (err: any) {
    error.value = err.message || 'Không thể tiếp tục'
    showError(error.value)
  }
}

// Coupon handlers
const handleApplyCoupon = async () => {
  if (!couponCode.value.trim()) {
    showError('Vui lòng nhập mã giảm giá')
    return
  }
  
  isApplyingCoupon.value = true
  try {
    const cartId = cart.value?.id
    await applyCoupon(cartUuid.value || '', couponCode.value.trim(), cartId)
    couponCode.value = ''
    showAvailableCoupons.value = false
    
    // Refresh cart to get updated totals
    await initializeCart()
  } catch (error: any) {
    // Error is already handled by the composable
  } finally {
    isApplyingCoupon.value = false
  }
}

const handleRemoveCoupon = async () => {
  try {
    const cartIdOrUuid = cart.value?.id || cartUuid.value
    if (!cartIdOrUuid) {
      showError('Không tìm thấy giỏ hàng')
      return
    }
    await removeCoupon(cartIdOrUuid)
    
    // Refresh cart to get updated totals
    await initializeCart()
  } catch (error: any) {
    // Error is already handled by the composable
  }
}

const applyCouponCode = (code: string) => {
  couponCode.value = code
  handleApplyCoupon()
}

// API methods
const loadInitialData = async () => {
  try {
    loading.value = true
    error.value = ''

    // Initialize cart first to get cart data and ensure cartUuid is available
    await initializeCart()
    
    // Wait a bit to ensure cartUuid is properly set
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Check if cartUuid is available
    if (!cartUuid.value) {
      throw new Error('Cart UUID not available')
    }

    // Load available coupons
    await fetchAvailableCoupons()

  } catch (err: any) {
    error.value = err.message || 'Không thể tải dữ liệu checkout'
  } finally {
    loading.value = false
  }
}

const calculateShipping = async () => {
  if (!selectedShippingMethodId.value) return

  const method = shippingMethods.value.find(m => m.id === selectedShippingMethodId.value)
  if (!method) return

  // Use base cost first
  const baseCost = parseFloat(method.base_cost || '0')
  
  // Only update if different to avoid unnecessary reactivity
  if (shippingCost.value !== baseCost) {
    shippingCost.value = baseCost
  }

  // Calculate if city is provided
  if (addressForm.value.city && cartUuid.value) {
    try {
      const res = await apiClient.post(`${publicEndpoints.shippingMethods.calculate}?cart_uuid=${cartUuid.value}`, {
        shipping_method_id: selectedShippingMethodId.value,
        cart_value: cartSubtotal.value,
        destination: addressForm.value.city
      })

      if (res.data.success) {
        // Only update shipping cost if it's different from current cost
        const calculatedCost = parseFloat(res.data.data.shipping_cost || '0')
        if (calculatedCost !== shippingCost.value) {
          shippingCost.value = calculatedCost
        }
        
        // Update the method's calculated_cost property
        method.calculated_cost = calculatedCost
      }
    } catch (err) {
      // Silent fail, keep base cost
    }
  }
}

const handlePlaceOrder = async () => {
  try {
    submitting.value = true
    error.value = ''

    // Validate all required fields
    if (!cartUuid.value) {
      throw new Error('Cart UUID not available for placing order')
    }

    if (!addressForm.value.name || !addressForm.value.phone || !addressForm.value.address || !addressForm.value.district || !addressForm.value.city) {
      throw new Error('Vui lòng điền đầy đủ thông tin giao hàng')
    }

    if (!selectedShippingMethodId.value) {
      throw new Error('Vui lòng chọn phương thức vận chuyển')
    }

    if (!selectedPaymentMethodId.value) {
      throw new Error('Vui lòng chọn phương thức thanh toán')
    }

    // Validate cart has items
    if (cartItems.value.length === 0) {
      throw new Error('Giỏ hàng của bạn đang trống')
    }

    const orderData = {
      customer_name: addressForm.value.name,
      customer_email: addressForm.value.email,
      customer_phone: addressForm.value.phone,
      shipping_address: {
        name: addressForm.value.name,
        phone: addressForm.value.phone,
        address: addressForm.value.address,
        district: addressForm.value.district,
        city: addressForm.value.city
      },
      shipping_method_id: selectedShippingMethodId.value,
      payment_method_id: selectedPaymentMethodId.value,
      notes: addressForm.value.notes,
      cart_uuid: cartUuid.value
    }

    const res = await apiClient.post(`${publicEndpoints.orders.create}`, orderData)

    if (res.data.success) {
      const orderData = res.data.data
      const orderId = orderData.order_id || orderData.id
      const orderNumber = orderData.order_number
      const accessUrl = orderData.access_url
      
      // Show success message
      showSuccess('Đặt hàng thành công! Đơn hàng của bạn đang được xử lý.')
      
      // Clear form after successful order
      addressForm.value = {
        name: '',
        email: '',
        phone: '',
        address: '',
        district: '',
        city: '',
        notes: ''
      }
      selectedShippingMethodId.value = null
      selectedPaymentMethodId.value = null
      shippingCost.value = 0

      // Store access_url for later use
      if (accessUrl) {
        currentAccessUrl.value = accessUrl
      }

      // Check if payment_url is provided in response (for online payments)
      if (orderData.payment_url) {
        // Open payment modal with payment URL
        currentOrderId.value = orderId
        currentOrderNumber.value = orderNumber
        paymentUrl.value = orderData.payment_url
        isPaymentModalOpen.value = true
      } else {
        // Check if payment method requires online payment (fallback to create payment URL)
        const selectedPaymentMethod = paymentMethods.value.find(m => m.id === selectedPaymentMethodId.value)
        const isOnlinePayment = selectedPaymentMethod?.code && ['vnpay', 'momo', 'zalopay'].includes(selectedPaymentMethod.code.toLowerCase())

        if (isOnlinePayment && orderId) {
          try {
            // Check if we should use mock payment (development/test mode)
            const useMockPayment = route.query.mock_payment === 'true' || process.env.NODE_ENV === 'development'
            
            if (useMockPayment) {
              // Redirect to mock payment page with access_url
              const returnUrl = accessUrl 
                ? `${window.location.origin}/home/order-success?access_url=${encodeURIComponent(accessUrl)}`
                : `${window.location.origin}/home/order-success?order_id=${orderId}`
              const mockPaymentUrl = `/home/payment/mock?order_id=${orderId}&order_number=${orderNumber}&amount=${orderTotalAmount.value}&return_url=${encodeURIComponent(returnUrl)}&cancel_url=${encodeURIComponent(`${window.location.origin}/home/checkout`)}`
              setTimeout(() => {
                router.push(mockPaymentUrl)
              }, 2000)
            } else {
              // Create payment URL for online payment
              const returnUrl = accessUrl 
                ? `${window.location.origin}/home/order-success?access_url=${encodeURIComponent(accessUrl)}`
                : `${window.location.origin}/home/order-success?order_id=${orderId}`
              const paymentUrlData = await createPaymentUrl({
                order_id: orderId,
                payment_method_id: selectedPaymentMethodId.value!,
                return_url: returnUrl,
                cancel_url: `${window.location.origin}/home/checkout`
              })
              
              // Open payment modal with payment URL
              currentOrderId.value = orderId
              currentOrderNumber.value = orderNumber
              if (accessUrl) {
                currentAccessUrl.value = accessUrl
              }
              paymentUrl.value = paymentUrlData.payment_url
              isPaymentModalOpen.value = true
            }
          } catch (error: any) {
            // If payment URL creation fails, redirect to order success page with access_url
            showError('Không thể tạo payment URL. Vui lòng thanh toán sau.')
            const redirectUrl = accessUrl 
              ? `/home/order-success?access_url=${encodeURIComponent(accessUrl)}`
              : `/home/order-success?order_id=${orderId}`
            setTimeout(() => {
              router.push(redirectUrl)
            }, 2000)
          }
        } else {
          // COD or other offline payment methods - redirect to order success page with access_url
          const redirectUrl = accessUrl 
            ? `/home/order-success?access_url=${encodeURIComponent(accessUrl)}`
            : `/home/order-success?order_id=${orderId}`
          setTimeout(() => {
            router.push(redirectUrl)
          }, 2000)
        }
      }
    } else {
      error.value = res.data.message || 'Đặt hàng thất bại'
      showError(error.value)
    }

  } catch (err: any) {
    error.value = err.message || 'Không thể đặt hàng'
    showError(error.value)
  } finally {
    submitting.value = false
  }
}

// Payment modal handlers
const handlePaymentModalClose = () => {
  isPaymentModalOpen.value = false
  // Redirect to order success page when modal is closed
  const redirectUrl = currentAccessUrl.value
    ? `/home/order-success?access_url=${encodeURIComponent(currentAccessUrl.value)}`
    : currentOrderId.value
    ? `/home/order-success?order_id=${currentOrderId.value}`
    : '/home/orders'
  setTimeout(() => {
    router.push(redirectUrl)
  }, 500)
}

const handlePaymentSuccess = () => {
  isPaymentModalOpen.value = false
  showSuccess('Thanh toán thành công!')
  // Redirect to order success page with access_url if available
  const redirectUrl = currentAccessUrl.value
    ? `/home/order-success?access_url=${encodeURIComponent(currentAccessUrl.value)}`
    : currentOrderId.value
    ? `/home/order-success?order_id=${currentOrderId.value}`
    : '/home/orders'
  setTimeout(() => {
    router.push(redirectUrl)
  }, 1000)
}

const handlePaymentCancel = () => {
  isPaymentModalOpen.value = false
  showError('Bạn đã hủy thanh toán')
  // Redirect to order success page with access_url if available
  const redirectUrl = currentAccessUrl.value
    ? `/home/order-success?access_url=${encodeURIComponent(currentAccessUrl.value)}`
    : currentOrderId.value
    ? `/home/order-success?order_id=${currentOrderId.value}`
    : '/home/orders'
  setTimeout(() => {
    router.push(redirectUrl)
  }, 1000)
}

onMounted(() => {
  loadInitialData()
})

// Watch for cart changes to update validation
watch(() => cartItems.value.length, (newLength) => {
  if (newLength === 0 && currentStepId.value !== 'address') {
    // Redirect to cart if cart becomes empty
    router.push('/home/cart')
  }
})

// Watch for shipping method changes to recalculate shipping cost
watch(selectedShippingMethodId, async (newMethodId) => {
  if (newMethodId && addressForm.value.city) {
    await calculateShipping()
  }
})

// Watch for city changes to recalculate shipping costs for all methods
watch(() => addressForm.value.city, async (newCity) => {
  if (newCity && shippingMethods.value.length > 0) {
    // Calculate shipping for all methods when city changes
    for (const method of shippingMethods.value) {
      if (method && method.id) {
        try {
          const res = await apiClient.post(`${publicEndpoints.shippingMethods.calculate}?cart_uuid=${cartUuid.value}`, {
            shipping_method_id: method.id,
            cart_value: cartSubtotal.value,
            destination: newCity
          })
          
          if (res.data.success) {
            // Update the method's calculated cost
            method.calculated_cost = parseFloat(res.data.data.shipping_cost || method.base_cost || '0')
          }
        } catch (err) {
          // Failed to calculate shipping for method
        }
      }
    }
    
    // If a shipping method is already selected, update its cost
    if (selectedShippingMethodId.value) {
      await calculateShipping()
    }
  }
})
</script>