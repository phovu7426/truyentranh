<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Giỏ hàng của bạn</h1>
            <p class="mt-1 text-sm text-gray-600">{{ itemsCount }} sản phẩm trong giỏ hàng</p>
          </div>
          <NuxtLink
            to="/home/products"
            class="inline-flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            <span class="hidden sm:inline">Tiếp tục mua sắm</span>
            <span class="sm:hidden">Mua sắm</span>
          </NuxtLink>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center py-20">
        <div class="text-center">
          <div class="relative">
            <div class="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <p class="mt-4 text-gray-600 font-medium">Đang tải giỏ hàng...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="errorMessage" class="bg-red-50 border-l-4 border-red-400 p-6 mb-8 rounded-lg shadow-md">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg class="h-6 w-6 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-medium text-red-800">Đã xảy ra lỗi</h3>
            <div class="mt-2 text-sm text-red-700">
              <p>{{ errorMessage }}</p>
            </div>
            <button @click="initializeCart" class="mt-3 text-sm font-medium text-red-600 hover:text-red-500 underline">
              Thử lại
            </button>
          </div>
        </div>
      </div>

      <!-- Cart Content -->
      <div v-else-if="!isEmpty" class="lg:grid lg:grid-cols-3 lg:gap-8 lg:space-y-0 space-y-6">
        <!-- Mobile Order Summary (shown first on mobile) -->
        <div class="lg:hidden bg-white rounded-xl shadow-sm border border-gray-200 p-6 order-1">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900">Tóm tắt đơn hàng</h2>
            <span class="text-xl font-bold text-blue-600">{{ formatCurrency(subtotal) }}</span>
          </div>
          <NuxtLink
            to="/home/checkout"
            class="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 text-center block flex items-center justify-center shadow-sm hover:shadow-md mb-3"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"></path>
            </svg>
            Tiến hành thanh toán
          </NuxtLink>
          <button
            @click="toggleOrderDetails"
            class="w-full text-blue-600 py-2 px-4 rounded-lg font-medium hover:bg-blue-50 transition-colors duration-200 flex items-center justify-center"
          >
            <svg class="w-4 h-4 mr-2 transition-transform" :class="{ 'rotate-180': showOrderDetails }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
            {{ showOrderDetails ? 'Ẩn' : 'Hiện' }} chi tiết
          </button>
          
          <Transition name="slide-down">
            <div v-if="showOrderDetails" class="mt-4 pt-4 border-t border-gray-200 space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Tạm tính</span>
                <span class="font-semibold">{{ formatCurrency(subtotal) }}</span>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Cart Items Section -->
        <div class="lg:col-span-2 order-2 space-y-6">
          <!-- Cart Items List -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-b border-gray-200">
              <h2 class="text-base sm:text-lg font-semibold text-gray-900">Sản phẩm trong giỏ hàng</h2>
            </div>
            
            <div class="divide-y divide-gray-200">
              <TransitionGroup name="cart-item" tag="div">
                <div
                  v-for="item in items"
                  :key="item.id"
                  class="p-4 sm:p-6 hover:bg-gray-50 transition-colors duration-200"
                >
                  <ProductDisplay
                    :item="{
                      id: item.id,
                      product_name: item.product_name,
                      product_slug: item.product_slug,
                      product_image: item.product_image,
                      variant_name: item.variant_name,
                      price: item.price,
                      original_price: item.variant?.price || item.original_price,
                      quantity: item.quantity,
                      total_price: item.total_price,
                      savings: item.variant && item.variant.price > item.price ? (item.variant.price - item.price) * item.quantity : 0
                    }"
                    variant="cart"
                    :show-quantity-badge="true"
                    :show-quantity-selector="true"
                    :show-remove-button="true"
                    @update-quantity="(itemId, quantity) => handleUpdateQuantity(String(itemId), quantity)"
                    @remove="(itemId) => handleRemoveItem(String(itemId))"
                  />
                </div>
              </TransitionGroup>
            </div>
          </div>
        </div>

        <!-- Desktop Order Summary Section -->
        <div class="hidden lg:block lg:col-span-1 order-3">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-24">
            <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900">Tóm tắt đơn hàng</h2>
            </div>
            
            <div class="px-6 py-4 space-y-4">
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Tạm tính</span>
                <span class="font-semibold">{{ formatCurrency(subtotal) }}</span>
              </div>
              
              <div v-if="discountAmount > 0" class="flex justify-between items-center">
                <span class="text-gray-600">Giảm giá</span>
                <span class="font-semibold text-green-600">-{{ formatCurrency(discountAmount) }}</span>
              </div>
              
              <div class="pt-4 border-t border-gray-200">
                <div class="flex justify-between items-center">
                  <span class="text-lg font-bold text-gray-900">Tổng cộng</span>
                  <span class="text-xl font-bold text-blue-600">{{ formatCurrency(totalAmount) }}</span>
                </div>
              </div>
              
              <!-- Coupon Section -->
              <div class="pt-4 border-t border-gray-200 mt-4">
                <div v-if="hasAppliedCoupon" class="mb-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-sm font-medium text-green-800">Mã giảm giá: {{ appliedCoupon?.code }}</p>
                      <p class="text-xs text-green-600">{{ appliedCoupon?.name }}</p>
                    </div>
                    <button
                      @click="handleRemoveCoupon"
                      class="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
                <button
                  v-else
                  @click="showCouponSection = !showCouponSection"
                  class="w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  {{ showCouponSection ? 'Ẩn' : 'Có mã giảm giá?' }}
                </button>
                
                <div v-if="showCouponSection && !hasAppliedCoupon" class="mt-3 space-y-2">
                  <div class="flex gap-2">
                    <input
                      v-model="couponCode"
                      type="text"
                      placeholder="Nhập mã giảm giá"
                      class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      @keyup.enter="handleApplyCoupon"
                    />
                    <button
                      @click="handleApplyCoupon"
                      :disabled="isApplyingCoupon || !couponCode.trim()"
                      class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      Áp dụng
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="px-6 py-4 space-y-3 bg-gray-50 border-t border-gray-200">
              <NuxtLink
                to="/home/checkout"
                class="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 text-center block flex items-center justify-center shadow-sm hover:shadow-md transform hover:scale-[1.02] transition-transform"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"></path>
                </svg>
                Tiến hành thanh toán
              </NuxtLink>
              
              <button
                @click="handleClearCart"
                class="w-full bg-red-50 text-red-600 py-3 px-6 rounded-lg font-medium hover:bg-red-100 transition-colors duration-200 flex items-center justify-center border border-red-200"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                Xóa giỏ hàng
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty Cart State -->
      <div v-else class="text-center py-12 sm:py-20">
        <div class="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full mb-6">
          <svg class="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"></path>
          </svg>
        </div>
        <h3 class="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Giỏ hàng trống</h3>
        <p class="text-base sm:text-lg text-gray-600 mb-8 max-w-md mx-auto px-4">Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá các sản phẩm tuyệt vời của chúng tôi!</p>
        <NuxtLink
          to="/home/products"
          class="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white text-base sm:text-lg font-bold rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
        >
          <svg class="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"></path>
          </svg>
          Bắt đầu mua sắm
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useCart } from '~/composables/cart'
import { useDiscount } from '~/composables/discount'
import { useToast } from '~/composables/ui/useToast'
import ProductDisplay from '@/components/Common/Shared/ProductDisplay.vue'
import { formatCurrency } from '~/utils/formatters'
import type { UpdateCartItemRequest } from '~/types/cart'
import { useSeo } from '@/composables/seo'

// Page metadata
definePageMeta({
  layout: 'home'
})

// SEO configuration
useSeo({
  title: 'Giỏ hàng',
  description: 'Quản lý giỏ hàng của bạn',
  type: 'website',
  noindex: true
})

// Use cart composable
const {
  items,
  itemsCount,
  subtotal,
  tax,
  shippingCost,
  discountAmount,
  totalAmount,
  isEmpty,
  isLoading,
  errorMessage,
  updateCartItem,
  removeFromCart,
  clearCart,
  initializeCart,
  applyCoupon,
  removeCoupon,
  appliedCoupon,
  hasAppliedCoupon,
  cartUuid,
  cart
} = useCart()

// Use discount composable
const {
  availableCoupons,
  usableCoupons,
  hasAvailableCoupons,
  fetchAvailableCoupons,
  isLoading: discountLoading
} = useDiscount()

// Use toast
const { showSuccess, showError } = useToast()

// Local state
const couponCode = ref('')
const showOrderDetails = ref(false)
const showCouponSection = ref(false)
const isApplyingCoupon = ref(false)

// Coupon handlers
const handleApplyCoupon = async () => {
  if (!couponCode.value.trim()) {
    showError('Vui lòng nhập mã giảm giá')
    return
  }
  
  isApplyingCoupon.value = true
  try {
    await applyCoupon(couponCode.value.trim())
    couponCode.value = ''
    showCouponSection.value = false
    await initializeCart()
  } catch (error: any) {
    // Error already handled by composable
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
    await initializeCart()
  } catch (error: any) {
    // Error already handled by composable
  }
}

// Toggle order details on mobile
const toggleOrderDetails = () => {
  showOrderDetails.value = !showOrderDetails.value
}

// Handle update quantity
const handleUpdateQuantity = async (itemId: string, quantity: number) => {
  try {
    const request: UpdateCartItemRequest = { quantity }
    await updateCartItem(itemId, request)
  } catch (error) {
    showError('Không thể cập nhật số lượng sản phẩm')
  }
}

// Handle remove item
const handleRemoveItem = async (itemId: string) => {
  try {
    await removeFromCart(itemId)
  } catch (error) {
    showError('Không thể xóa sản phẩm khỏi giỏ hàng')
  }
}

// Handle clear cart
const handleClearCart = async () => {
  if (confirm('Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?')) {
    try {
      await clearCart()
    } catch (error) {
      showError('Không thể xóa giỏ hàng')
    }
  }
}


// Initialize cart on page load
onMounted(async () => {
  await initializeCart()
  await fetchAvailableCoupons()
})
</script>

<style scoped>
/* Cart item transitions */
.cart-item-enter-active,
.cart-item-leave-active {
  transition: all 0.3s ease;
}

.cart-item-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.cart-item-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.cart-item-move {
  transition: transform 0.3s ease;
}

/* Slide down animation for mobile order details */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.slide-down-enter-from {
  max-height: 0;
  opacity: 0;
}

.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
}

.slide-down-enter-to,
.slide-down-leave-from {
  max-height: 300px;
  opacity: 1;
}

/* Custom animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.fade-in {
  animation: fadeIn 0.5s ease-out;
}

.pulse {
  animation: pulse 2s infinite;
}

/* Hover effects */
.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

/* Loading shimmer effect */
.shimmer {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}

/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .cart-item-enter-from {
    transform: translateY(-20px);
  }
  
  .cart-item-leave-to {
    transform: translateY(20px);
  }
}

/* Focus styles for accessibility */
button:focus-visible,
input:focus-visible,
a:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .cart-item-enter-active,
  .cart-item-leave-active,
  .slide-down-enter-active,
  .slide-down-leave-active {
    transition: none;
  }
  
  .hover-lift:hover {
    transform: none;
  }
  
  .pulse,
  .shimmer {
    animation: none;
  }
}
</style>