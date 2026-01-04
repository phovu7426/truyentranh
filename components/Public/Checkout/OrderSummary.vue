<template>
  <div class="bg-white rounded-lg shadow-lg p-6 sticky top-6">
    <div class="bg-blue-600 -mx-6 -mt-6 px-6 py-4 rounded-t-lg mb-6">
      <h3 class="text-xl font-bold text-white flex items-center">
        <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        Tóm tắt đơn hàng
      </h3>
    </div>

    <div class="space-y-4">
      <!-- Cart Items Preview -->
      <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div class="flex items-center justify-between mb-3">
          <span class="font-semibold text-gray-700 flex items-center">
            <svg class="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Sản phẩm
          </span>
          <span class="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">{{ cartItems.length }}</span>
        </div>
        <div class="space-y-2 max-h-32 overflow-y-auto">
          <div v-for="item in cartItems.slice(0, 3)" :key="item.id" class="flex items-center justify-between text-sm">
            <span class="text-gray-600 truncate flex-1">{{ item.product_name }}</span>
            <span class="font-semibold text-gray-800 ml-2">{{ formatCurrency(item.total_price) }}</span>
          </div>
          <div v-if="cartItems.length > 3" class="text-xs text-gray-500 text-center pt-1">
            ... và {{ cartItems.length - 3 }} sản phẩm khác
          </div>
        </div>
      </div>

      <!-- Coupon Section -->
      <div class="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
        <h3 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
          <svg class="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path>
          </svg>
          Mã giảm giá
        </h3>
        
        <!-- Applied Coupon -->
        <div v-if="appliedCoupon" class="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <p class="font-medium text-green-800">{{ appliedCoupon.name }}</p>
              <p class="text-sm text-green-600">{{ appliedCoupon.code }}</p>
            </div>
            <button
              @click="$emit('remove-coupon')"
              class="ml-2 text-red-600 hover:text-red-800 transition-colors"
              title="Xóa mã giảm giá"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Coupon Input -->
        <div v-else class="space-y-3">
          <div class="flex gap-2">
            <input
              :value="couponCode"
              @input="$emit('update:couponCode', ($event.target as HTMLInputElement).value)"
              type="text"
              placeholder="Nhập mã giảm giá"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              @keyup.enter="$emit('apply-coupon')"
            />
            <button
              @click="$emit('apply-coupon')"
              :disabled="!couponCode?.trim() || isApplyingCoupon"
              class="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              <svg v-if="isApplyingCoupon" class="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Áp dụng
            </button>
          </div>
          
          <!-- Available Coupons -->
          <div v-if="hasAvailableCoupons" class="mt-3">
            <button
              @click="$emit('toggle-available-coupons')"
              class="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path>
              </svg>
              Xem mã giảm giá khả dụng ({{ usableCoupons.length }})
            </button>
            
            <div v-if="showAvailableCoupons" class="mt-2 space-y-2 max-h-40 overflow-y-auto">
              <div
                v-for="coupon in usableCoupons.slice(0, 3)"
                :key="coupon.id"
                class="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                @click="$emit('apply-coupon-code', coupon.code)"
              >
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <p class="font-medium text-sm text-gray-900">{{ coupon.name }}</p>
                    <p class="text-xs text-gray-600">{{ coupon.description }}</p>
                    <p class="text-xs text-blue-600 font-medium mt-1">{{ formatDiscountText(coupon) }}</p>
                  </div>
                  <button class="text-xs text-blue-600 hover:text-blue-800 font-medium">
                    Áp dụng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Price Breakdown -->
      <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-gray-600 flex items-center">
              <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Tạm tính:
            </span>
            <span class="font-semibold text-gray-800">{{ formatCurrency(subtotal) }}</span>
          </div>

          <!-- Discount (if any) -->
          <div v-if="discount > 0" class="flex justify-between items-center">
            <span class="text-green-600 flex items-center">
              <svg class="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Giảm giá:
            </span>
            <span class="font-semibold text-green-600">-{{ formatCurrency(discount) }}</span>
          </div>
        </div>
      </div>

      <!-- Total -->
      <div class="bg-green-50 rounded-lg p-4 border border-green-200">
        <div class="flex justify-between items-center">
          <span class="text-lg font-bold text-gray-800 flex items-center">
            <svg class="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Tổng cộng:
          </span>
          <span class="text-2xl font-bold text-green-600">
            {{ formatCurrency(subtotal - discount) }}
          </span>
        </div>
      </div>

      <!-- Selected Methods Summary -->
      <div v-if="showMethodsSummary" class="bg-purple-50 rounded-lg p-4 border border-purple-200">
        <h4 class="font-semibold text-gray-800 mb-3 text-sm">Phương thức đã chọn</h4>
        
        <!-- Shipping Method -->
        <div v-if="selectedShippingMethod" class="flex items-center justify-between mb-2">
          <div class="flex items-center text-sm">
            <svg class="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span class="text-gray-700">Vận chuyển:</span>
          </div>
          <span class="text-sm font-medium text-gray-900">{{ selectedShippingMethod.name }}</span>
        </div>
        
        <!-- Payment Method -->
        <div v-if="selectedPaymentMethod" class="flex items-center justify-between">
          <div class="flex items-center text-sm">
            <svg class="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span class="text-gray-700">Thanh toán:</span>
          </div>
          <span class="text-sm font-medium text-gray-900">{{ selectedPaymentMethod.name }}</span>
        </div>
      </div>

      <!-- Security Badge -->
      <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div class="flex items-center">
          <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-semibold text-blue-800">Bảo mật thanh toán</p>
            <p class="text-xs text-blue-600">Thông tin của bạn được bảo vệ tuyệt đối</p>
          </div>
        </div>
      </div>

      <!-- Action Button (for review step) -->
      <div v-if="showPlaceOrderButton" class="pt-4 border-t-2 border-gray-200">
        <button
          @click="$emit('place-order')"
          :disabled="isSubmitting || !canPlaceOrder"
          class="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          <svg v-if="isSubmitting" class="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span v-if="isSubmitting">Đang xử lý...</span>
          <span v-else>✓ Xác nhận đặt hàng</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatCurrency } from '~/utils/formatters'

interface CartItem {
  id: string
  product_name: string
  total_price: number
  quantity: number
}

interface ShippingMethod {
  id: number
  name: string
  base_cost: string
  calculated_cost?: number
}

interface PaymentMethod {
  id: number
  name: string
  code: string
}

interface Props {
  cartItems: CartItem[]
  subtotal: number
  shippingCost: number
  tax?: number
  discount?: number
  totalAmount: number
  selectedShippingMethod?: ShippingMethod | null
  selectedPaymentMethod?: PaymentMethod | null
  showMethodsSummary?: boolean
  showPlaceOrderButton?: boolean
  isSubmitting?: boolean
  canPlaceOrder?: boolean
  appliedCoupon?: any
  couponCode?: string
  isApplyingCoupon?: boolean
  hasAvailableCoupons?: boolean
  usableCoupons?: any[]
  showAvailableCoupons?: boolean
}

interface Emits {
  (e: 'place-order'): void
  (e: 'apply-coupon'): void
  (e: 'remove-coupon'): void
  (e: 'apply-coupon-code', code: string): void
  (e: 'toggle-available-coupons'): void
  (e: 'update:couponCode', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  tax: 0,
  discount: 0,
  showMethodsSummary: false,
  showPlaceOrderButton: false,
  isSubmitting: false,
  canPlaceOrder: true,
  appliedCoupon: null,
  couponCode: '',
  isApplyingCoupon: false,
  hasAvailableCoupons: false,
  usableCoupons: () => [],
  showAvailableCoupons: false
})

defineEmits<Emits>()

// Helper function to format discount text
const formatDiscountText = (coupon: any) => {
  if (coupon.discount_type === 'percentage') {
    return `Giảm ${coupon.discount_value}%`
  } else if (coupon.discount_type === 'fixed') {
    return `Giảm ${formatCurrency(coupon.discount_value)}`
  } else if (coupon.discount_type === 'shipping') {
    return 'Miễn phí vận chuyển'
  }
  return ''
}

// Computed property to display the current shipping cost
const displayShippingCost = computed(() => {
  // If we have a selected shipping method with calculated cost, use that
  if (props.selectedShippingMethod && props.selectedShippingMethod.calculated_cost !== undefined && props.selectedShippingMethod.calculated_cost !== null) {
    return Number(props.selectedShippingMethod.calculated_cost)
  }
  
  // Otherwise use the shipping cost prop
  return props.shippingCost
})
</script>