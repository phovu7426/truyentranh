<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center min-h-[60vh]">
        <div class="text-center">
          <div class="spinner mx-auto mb-4"></div>
          <p class="text-gray-600 font-medium">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-white rounded-xl shadow-lg p-8 text-center">
        <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Không thể tải thông tin đơn hàng</h1>
        <p class="text-gray-600 mb-6">{{ error }}</p>
        <div class="flex gap-4 justify-center">
          <NuxtLink
            to="/home"
            class="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Về trang chủ
          </NuxtLink>
          <button
            @click="fetchOrderData"
            class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>

      <!-- Order Details -->
      <div v-else-if="orderData" class="space-y-6">
        <!-- Status Header -->
        <div
          :class="[
            'rounded-xl shadow-lg overflow-hidden',
            getStatusHeaderClass()
          ]"
        >
          <div class="p-8 text-center">
            <div class="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
              <svg v-if="orderData.payment_status === 'paid'" class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <svg v-else-if="orderData.payment_status === 'failed' || orderData.payment_status === 'cancelled'" class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <svg v-else class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 class="text-3xl font-bold text-white mb-2">{{ getStatusTitle() }}</h1>
            <p class="text-white/90 text-lg">{{ getStatusMessage() }}</p>
          </div>
        </div>

        <!-- Order Info Card -->
        <div class="bg-white rounded-xl shadow-lg p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <svg class="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Thông tin đơn hàng
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div>
                <span class="text-sm font-medium text-gray-500">Mã đơn hàng</span>
                <p class="text-lg font-bold text-gray-900 mt-1">{{ orderData.order_number }}</p>
              </div>
              <div>
                <span class="text-sm font-medium text-gray-500">Ngày đặt hàng</span>
                <p class="text-lg text-gray-900 mt-1">{{ formatDate(orderData.created_at) }}</p>
              </div>
              <div>
                <span class="text-sm font-medium text-gray-500">Trạng thái đơn hàng</span>
                <p class="text-lg mt-1">
                  <span :class="getStatusBadgeClass(orderData.status)">
                    {{ getStatusText(orderData.status) }}
                  </span>
                </p>
              </div>
            </div>
            
            <div class="space-y-4">
              <div>
                <span class="text-sm font-medium text-gray-500">Tổng tiền</span>
                <p class="text-2xl font-bold text-blue-600 mt-1">
                  {{ formatCurrency(Number(orderData.total_amount)) }}
                </p>
              </div>
              <div>
                <span class="text-sm font-medium text-gray-500">Trạng thái thanh toán</span>
                <p class="text-lg mt-1">
                  <span :class="getPaymentStatusBadgeClass(orderData.payment_status)">
                    {{ getPaymentStatusText(orderData.payment_status) }}
                  </span>
                </p>
              </div>
              <div>
                <span class="text-sm font-medium text-gray-500">Trạng thái vận chuyển</span>
                <p class="text-lg mt-1">
                  <span :class="getShippingStatusBadgeClass(orderData.shipping_status)">
                    {{ getShippingStatusText(orderData.shipping_status) }}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Customer Info -->
        <div class="bg-white rounded-xl shadow-lg p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <svg class="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Thông tin khách hàng
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span class="text-sm font-medium text-gray-500">Họ tên</span>
              <p class="text-lg font-semibold text-gray-900 mt-1">{{ orderData.customer_name }}</p>
            </div>
            <div>
              <span class="text-sm font-medium text-gray-500">Số điện thoại</span>
              <p class="text-lg text-gray-900 mt-1">{{ orderData.customer_phone }}</p>
            </div>
            <div v-if="orderData.customer_email" class="md:col-span-2">
              <span class="text-sm font-medium text-gray-500">Email</span>
              <p class="text-lg text-gray-900 mt-1">{{ orderData.customer_email }}</p>
            </div>
          </div>
        </div>

        <!-- Order Items -->
        <div class="bg-white rounded-xl shadow-lg p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <svg class="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Sản phẩm đã đặt ({{ orderData.items?.length || 0 }})
          </h2>
          
          <div class="space-y-4">
            <div
              v-for="item in orderData.items"
              :key="item.id"
              class="flex gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div class="flex-1">
                <h3 class="font-bold text-gray-900 text-lg">{{ item.product_name }}</h3>
                <p v-if="item.variant_name" class="text-sm text-gray-600 mt-1">{{ item.variant_name }}</p>
                <p v-if="item.product_sku" class="text-xs text-gray-500 mt-1">SKU: {{ item.product_sku }}</p>
                <div class="flex items-center gap-4 mt-3">
                  <span class="text-sm text-gray-600">Số lượng: <strong>{{ item.quantity }}</strong></span>
                  <span class="text-sm text-gray-600">Đơn giá: <strong>{{ formatCurrency(Number(item.unit_price)) }}</strong></span>
                </div>
              </div>
              <div class="text-right">
                <p class="text-xl font-bold text-gray-900">{{ formatCurrency(Number(item.total_price)) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Shipping & Payment Methods -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Shipping Method -->
          <div class="bg-white rounded-xl shadow-lg p-6">
            <h2 class="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <svg class="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Phương thức vận chuyển
            </h2>
            <div v-if="orderData.shipping_method" class="space-y-2">
              <p class="font-semibold text-gray-900">{{ orderData.shipping_method.name }}</p>
              <p class="text-sm text-gray-600">{{ orderData.shipping_method.description }}</p>
              <p class="text-sm text-gray-500">Thời gian dự kiến: {{ orderData.shipping_method.estimated_days }} ngày</p>
            </div>
          </div>

          <!-- Payment Method -->
          <div class="bg-white rounded-xl shadow-lg p-6">
            <h2 class="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Phương thức thanh toán
            </h2>
            <div v-if="orderData.payment_method" class="space-y-2">
              <p class="font-semibold text-gray-900">{{ orderData.payment_method.name }}</p>
              <p class="text-sm text-gray-600">{{ orderData.payment_method.description }}</p>
            </div>
          </div>
        </div>

        <!-- Payment Info -->
        <div v-if="orderData.payments && orderData.payments.length > 0" class="bg-white rounded-xl shadow-lg p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <svg class="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Thông tin thanh toán
          </h2>
          
          <div
            v-for="payment in orderData.payments"
            :key="payment.id"
            class="border border-gray-200 rounded-lg p-4 space-y-2"
          >
            <div class="flex justify-between items-start">
              <div>
                <p class="font-semibold text-gray-900">Mã giao dịch: {{ payment.transaction_id }}</p>
                <p class="text-sm text-gray-600 mt-1">Loại: {{ payment.payment_type === 'online' ? 'Thanh toán online' : 'Thanh toán khi nhận hàng' }}</p>
              </div>
              <span :class="getPaymentStatusBadgeClass(payment.status)">
                {{ getPaymentStatusText(payment.status) }}
              </span>
            </div>
            <div class="flex justify-between items-center pt-2 border-t border-gray-200">
              <span class="text-sm text-gray-600">Số tiền</span>
              <span class="text-lg font-bold text-gray-900">{{ formatCurrency(Number(payment.amount)) }}</span>
            </div>
            <div v-if="payment.paid_at" class="text-sm text-gray-500">
              Đã thanh toán: {{ formatDate(payment.paid_at) }}
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4">
          <NuxtLink
            to="/home"
            class="flex-1 text-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
          >
            Tiếp tục mua sắm
          </NuxtLink>
          <NuxtLink
            :to="`/home/orders/${orderData.order_id}`"
            class="flex-1 text-center px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Xem chi tiết đơn hàng
          </NuxtLink>
          <NuxtLink
            to="/home/orders"
            class="flex-1 text-center px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Lịch sử đơn hàng
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useApiClient } from '~/composables/api/useApiClient'
import { formatCurrency } from '~/utils/formatters'
import { useToast } from '~/composables/ui/useToast'
import { useSeo } from '@/composables/seo'

definePageMeta({
  layout: 'home',
  middleware: 'auth'
})

// SEO configuration
useSeo({
  title: 'Đặt hàng thành công',
  description: 'Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đã được xử lý thành công.',
  type: 'website',
  noindex: true
})

const route = useRoute()
const { apiClient } = useApiClient()
const { showError } = useToast()

interface OrderItem {
  id: string
  product_id: string
  product_variant_id: string
  product_name: string
  product_sku?: string
  variant_name: string
  quantity: number
  unit_price: string
  total_price: string
  product_attributes?: any
}

interface ShippingMethod {
  id: string
  name: string
  code: string
  description: string
  base_cost: string
  estimated_days: number
  status: string
}

interface PaymentMethod {
  id: string
  name: string
  code: string
  description: string
  provider?: string
  status: string
}

interface Payment {
  id: string
  order_id: string
  payment_method_id: string
  status: string
  payment_type: string
  amount: string
  transaction_id: string
  payment_code?: string
  paid_at?: string
  refunded_at?: string
  notes?: string
}

interface OrderData {
  order_id: string
  order_number: string
  status: string
  payment_status: string
  shipping_status: string
  customer_name: string
  customer_email?: string
  customer_phone: string
  total_amount: string
  currency: string
  created_at: string
  items: OrderItem[]
  shipping_method?: ShippingMethod
  payment_method?: PaymentMethod
  payments?: Payment[]
}

const loading = ref(true)
const error = ref('')
const orderData = ref<OrderData | null>(null)

// Get access_url from query params
const accessUrl = computed(() => {
  return route.query.access_url as string | undefined
})

// Fetch order data from access_url
const fetchOrderData = async () => {
  if (!accessUrl.value) {
    error.value = 'Thiếu thông tin truy cập đơn hàng'
    loading.value = false
    return
  }

  try {
    loading.value = true
    error.value = ''

    // Call the access_url API
    const response = await apiClient.get(accessUrl.value)

    if (response.data.success && response.data.data) {
      orderData.value = response.data.data
    } else {
      error.value = response.data.message || 'Không thể tải thông tin đơn hàng'
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi tải thông tin đơn hàng'
    showError(error.value)
  } finally {
    loading.value = false
  }
}

// Status helpers
const getStatusHeaderClass = () => {
  const paymentStatus = orderData.value?.payment_status
  if (paymentStatus === 'paid') {
    return 'bg-gradient-to-r from-green-600 to-emerald-600'
  } else if (paymentStatus === 'failed' || paymentStatus === 'cancelled') {
    return 'bg-gradient-to-r from-red-600 to-rose-600'
  } else if (paymentStatus === 'pending') {
    return 'bg-gradient-to-r from-yellow-500 to-orange-500'
  }
  return 'bg-gradient-to-r from-blue-600 to-indigo-600'
}


const getStatusTitle = () => {
  const paymentStatus = orderData.value?.payment_status
  if (paymentStatus === 'paid') {
    return 'Thanh toán thành công!'
  } else if (paymentStatus === 'failed') {
    return 'Thanh toán thất bại'
  } else if (paymentStatus === 'cancelled') {
    return 'Đơn hàng đã bị hủy'
  } else if (paymentStatus === 'pending') {
    return 'Đang chờ thanh toán'
  }
  return 'Đặt hàng thành công!'
}

const getStatusMessage = () => {
  const paymentStatus = orderData.value?.payment_status
  if (paymentStatus === 'paid') {
    return 'Đơn hàng của bạn đã được thanh toán thành công và đang được xử lý.'
  } else if (paymentStatus === 'failed') {
    return 'Thanh toán không thành công. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.'
  } else if (paymentStatus === 'cancelled') {
    return 'Đơn hàng đã bị hủy. Nếu bạn đã thanh toán, tiền sẽ được hoàn lại trong vòng 3-5 ngày làm việc.'
  } else if (paymentStatus === 'pending') {
    return 'Đơn hàng đã được tạo. Vui lòng hoàn tất thanh toán để chúng tôi có thể xử lý đơn hàng của bạn.'
  }
  return 'Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đang được xử lý.'
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: 'Chờ xử lý',
    processing: 'Đang xử lý',
    shipped: 'Đã giao hàng',
    delivered: 'Đã nhận hàng',
    cancelled: 'Đã hủy',
    completed: 'Hoàn thành'
  }
  return statusMap[status] || status
}

const getStatusBadgeClass = (status: string) => {
  const classMap: Record<string, string> = {
    pending: 'px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800',
    processing: 'px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800',
    shipped: 'px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-800',
    delivered: 'px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800',
    cancelled: 'px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800',
    completed: 'px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-800'
  }
  return classMap[status] || 'px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-800'
}

const getPaymentStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: 'Chờ thanh toán',
    paid: 'Đã thanh toán',
    failed: 'Thanh toán thất bại',
    cancelled: 'Đã hủy',
    refunded: 'Đã hoàn tiền',
    partial: 'Thanh toán một phần'
  }
  return statusMap[status] || status
}

const getPaymentStatusBadgeClass = (status: string) => {
  const classMap: Record<string, string> = {
    pending: 'px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800',
    paid: 'px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800',
    failed: 'px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800',
    cancelled: 'px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-800',
    refunded: 'px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800',
    partial: 'px-3 py-1 rounded-full text-sm font-semibold bg-orange-100 text-orange-800'
  }
  return classMap[status] || 'px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-800'
}

const getShippingStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: 'Chờ xử lý',
    processing: 'Đang chuẩn bị',
    shipped: 'Đã giao hàng',
    delivered: 'Đã nhận hàng',
    cancelled: 'Đã hủy'
  }
  return statusMap[status] || status
}

const getShippingStatusBadgeClass = (status: string) => {
  const classMap: Record<string, string> = {
    pending: 'px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800',
    processing: 'px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800',
    shipped: 'px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-800',
    delivered: 'px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800',
    cancelled: 'px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800'
  }
  return classMap[status] || 'px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-800'
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchOrderData()
})

// SEO Meta
useHead({
  title: computed(() => orderData.value ? `Đơn hàng ${orderData.value.order_number}` : 'Kết quả đơn hàng'),
  meta: [
    { name: 'description', content: 'Xem kết quả và thông tin chi tiết đơn hàng của bạn' }
  ]
})
</script>

<style scoped>
.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
