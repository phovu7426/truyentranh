<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <!-- Page Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Chi tiết đơn hàng</h1>
            <p v-if="orderData" class="mt-2 text-gray-600">
              Mã đơn hàng: {{ orderData.order_number }}
            </p>
          </div>
          <NuxtLink
            to="/home/orders"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Quay lại danh sách
          </NuxtLink>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mb-6">
        <div class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                Đã có lỗi xảy ra
              </h3>
              <div class="mt-2 text-sm text-red-700">
                {{ error }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <LoadingSpinner size="lg" />
        <p class="mt-4 text-gray-600">Đang tải thông tin đơn hàng...</p>
      </div>

      <!-- Order Details -->
      <div v-else-if="orderData" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Order Status -->
          <div class="bg-white shadow rounded-lg p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Trạng thái đơn hàng</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p class="text-sm text-gray-600 mb-1">Trạng thái</p>
                <OrderStatusBadge :status="orderData.status" size="lg" />
              </div>
              <div>
                <p class="text-sm text-gray-600 mb-1">Thanh toán</p>
                <PaymentStatusBadge :status="orderData.payment_status" size="lg" />
              </div>
              <div>
                <p class="text-sm text-gray-600 mb-1">Vận chuyển</p>
                <ShippingStatusBadge :status="orderData.shipping_status" size="lg" />
              </div>
            </div>
            
            <!-- Order Timeline -->
            <div class="mt-6">
              <h3 class="text-sm font-medium text-gray-900 mb-3">Lịch sử</h3>
              <div class="space-y-3">
                <div class="flex items-start">
                  <div class="flex-shrink-0">
                    <div class="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <svg class="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div class="ml-4">
                    <p class="text-sm font-medium text-gray-900">Đặt hàng thành công</p>
                    <p class="text-sm text-gray-500">{{ formatDate(orderData.created_at) }}</p>
                  </div>
                </div>
                
                <div v-if="orderData.shipped_at" class="flex items-start">
                  <div class="flex-shrink-0">
                    <div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg class="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M3 3a1 1 0 000 2h1l1.21 6.042a3 3 0 002.958 2.458h6.664a3 3 0 002.83-1.983l1.179-3.536A1 1 0 0018.884 6H6.21l-.25-1.249A3 3 0 003.958 2H3z" clip-rule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div class="ml-4">
                    <p class="text-sm font-medium text-gray-900">Đã giao cho vận chuyển</p>
                    <p class="text-sm text-gray-500">{{ formatDate(orderData.shipped_at) }}</p>
                  </div>
                </div>
                
                <div v-if="orderData.delivered_at" class="flex items-start">
                  <div class="flex-shrink-0">
                    <div class="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <svg class="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div class="ml-4">
                    <p class="text-sm font-medium text-gray-900">Đã giao thành công</p>
                    <p class="text-sm text-gray-500">{{ formatDate(orderData.delivered_at) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Order Items -->
          <div class="bg-white shadow rounded-lg p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Sản phẩm</h2>
            <div v-if="orderItems && orderItems.length > 0" class="space-y-4">
              <OrderItem
                v-for="item in orderItems"
                :key="item.id"
                :item="item"
              />
            </div>
            <div v-else class="text-center py-8 text-gray-500">
              <p>Chưa có sản phẩm trong đơn hàng này</p>
            </div>
          </div>

          <!-- Notes -->
          <div v-if="orderData.notes" class="bg-white shadow rounded-lg p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Ghi chú</h2>
            <p class="text-sm text-gray-600">{{ orderData.notes }}</p>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-1 space-y-6">
          <!-- Customer Info -->
          <div class="bg-white shadow rounded-lg p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Thông tin khách hàng</h2>
            <div class="space-y-3">
              <div>
                <p class="text-sm text-gray-600">Họ tên</p>
                <p class="text-sm font-medium text-gray-900">{{ orderData.customer_name }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Email</p>
                <p class="text-sm font-medium text-gray-900">{{ orderData.customer_email }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Điện thoại</p>
                <p class="text-sm font-medium text-gray-900">{{ orderData.customer_phone }}</p>
              </div>
            </div>
          </div>

          <!-- Shipping Address -->
          <div class="bg-white shadow rounded-lg p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Địa chỉ giao hàng</h2>
            <p class="text-sm text-gray-600">{{ formatAddress(orderData.shipping_address) }}</p>
          </div>

          <!-- Order Summary -->
          <div class="bg-white shadow rounded-lg p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Tóm tắt đơn hàng</h2>
            <div class="space-y-3">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Tạm tính:</span>
                <span class="font-medium">{{ formatCurrencySafe(orderData.subtotal || 0) }}</span>
              </div>
              
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Phí vận chuyển:</span>
                <span class="font-medium">{{ formatCurrencySafe(orderData.shipping_amount || 0) }}</span>
              </div>
              
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Thuế:</span>
                <span class="font-medium">{{ formatCurrencySafe(orderData.tax_amount || 0) }}</span>
              </div>
              
              <div v-if="orderData.discount_amount && parseFloat(orderData.discount_amount) > 0" class="flex justify-between text-sm">
                <span class="text-gray-600">Giảm giá:</span>
                <span class="font-medium text-green-600">-{{ formatCurrencySafe(orderData.discount_amount) }}</span>
              </div>
              
              <div class="border-t pt-3">
                <div class="flex justify-between">
                  <span class="text-base font-medium text-gray-900">Tổng cộng:</span>
                  <span class="text-base font-bold text-gray-900">{{ formatCurrencySafe(orderData.total_amount) }}</span>
                </div>
              </div>
            </div>

            <!-- Payment Method -->
            <div class="mt-4 pt-4 border-t">
              <p class="text-sm text-gray-600">Phương thức thanh toán:</p>
              <p class="text-sm font-medium text-gray-900">{{ getPaymentMethodLabel(paymentMethod) }}</p>
            </div>

            <!-- Shipping Method -->
            <div class="mt-3">
              <p class="text-sm text-gray-600">Phương thức vận chuyển:</p>
              <p class="text-sm font-medium text-gray-900">{{ getShippingMethodLabel(shippingMethod) }}</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="bg-white shadow rounded-lg p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Thao tác</h2>
            <div class="space-y-3">
              <button
                v-if="orderData.status === 'pending' || orderData.status === 'confirmed'"
                @click="cancelOrder"
                class="w-full px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100"
              >
                Hủy đơn hàng
              </button>
              
              <button
                v-if="orderData.payment_status === 'pending' && paymentMethod?.code !== 'cod'"
                @click="processPayment"
                class="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Thanh toán ngay
              </button>
              
              <button
                @click="printOrder"
                class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                In đơn hàng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGlobalApiClient } from '~/composables/api'
import { publicEndpoints } from '~/api/endpoints'
import { usePayments } from '~/composables/payments/usePayments'
import { useToast } from '~/composables/ui/useToast'
import OrderStatusBadge from '@/components/Common/Orders/Badges/OrderStatusBadge.vue'
import PaymentStatusBadge from '@/components/Common/Orders/Badges/PaymentStatusBadge.vue'
import ShippingStatusBadge from '@/components/Common/Orders/Badges/ShippingStatusBadge.vue'
import OrderItem from '~/components/Home/components/orders/OrderItem.vue'
import LoadingSpinner from '~/components/Core/Loading/LoadingSpinner.vue'
import { formatCurrency, formatDate } from '~/utils/formatters'
import { useSeo } from '@/composables/seo'

definePageMeta({
  layout: 'home',
  middleware: 'auth'
})

// SEO configuration - sẽ được cập nhật khi load order
useSeo({
  title: 'Chi tiết đơn hàng',
  description: 'Xem chi tiết đơn hàng của bạn',
  type: 'website',
  noindex: true
})

const route = useRoute()
const router = useRouter()
const { apiClient } = useGlobalApiClient()
const { createPaymentUrl } = usePayments()
const { showSuccess, showError } = useToast()

// State
const orderData = ref<any>(null)
const orderItems = ref<any[]>([])
const paymentMethod = ref<any>(null)
const shippingMethod = ref<any>(null)
const loading = ref(false)
const error = ref<string | null>(null)

// Fetch order data
const fetchOrder = async (orderId: number) => {
  loading.value = true
  error.value = null
  
  try {
    const response = await apiClient.get(publicEndpoints.orders.show(orderId))
    
    if (!response || !response.data) {
      throw new Error('Không nhận được dữ liệu từ server')
    }

    const responseData = response.data
    
    // Handle API response format: { success: true, data: {...}, ... }
    let data: any = null
    
    if (responseData.success === false) {
      throw new Error(responseData.message || 'Không thể tải thông tin đơn hàng')
    }
    
    // Extract order data from response
    if (responseData.data) {
      data = responseData.data
    } else if (responseData.id || responseData.order_number) {
      data = responseData
    } else {
      throw new Error('Định dạng dữ liệu không hợp lệ')
    }

    // Validate order data
    if (!data || (!data.id && !data.order_number)) {
      throw new Error('Dữ liệu đơn hàng không hợp lệ')
    }

    // Parse shipping_address if it's a JSON string
    if (typeof data.shipping_address === 'string') {
      try {
        data.shipping_address = JSON.parse(data.shipping_address)
      } catch (e) {
        // If parsing fails, create a basic address object
        data.shipping_address = {
          address: data.shipping_address,
          district: '',
          city: '',
          province: '',
          postal_code: ''
        }
      }
    } else if (!data.shipping_address) {
      data.shipping_address = {
        address: '',
        district: '',
        city: '',
        province: '',
        postal_code: ''
      }
    }

    // Parse billing_address if it's a JSON string
    if (typeof data.billing_address === 'string') {
      try {
        data.billing_address = JSON.parse(data.billing_address)
      } catch (e) {
        data.billing_address = data.shipping_address || {
          address: '',
          district: '',
          city: '',
          province: '',
          postal_code: ''
        }
      }
    } else if (!data.billing_address) {
      data.billing_address = data.shipping_address || {
        address: '',
        district: '',
        city: '',
        province: '',
        postal_code: ''
      }
    }

    // Set order data
    orderData.value = data
    
    // Fetch order items if not included
    if (data.order_items && Array.isArray(data.order_items) && data.order_items.length > 0) {
      orderItems.value = data.order_items
    } else {
      // Try to fetch order items separately if needed
      orderItems.value = []
    }

    // Fetch payment method if needed
    if (data.payment_method_id) {
      try {
        const paymentMethodsResponse = await apiClient.get(publicEndpoints.paymentMethods.list)
        if (paymentMethodsResponse?.data?.data) {
          const methods = paymentMethodsResponse.data.data
          paymentMethod.value = methods.find((m: any) => m.id === data.payment_method_id) || null
        }
      } catch (e) {
        // Ignore error
      }
    }

    // Fetch shipping method if needed
    if (data.shipping_method_id) {
      try {
        const shippingMethodsResponse = await apiClient.get(publicEndpoints.shippingMethods.list)
        if (shippingMethodsResponse?.data?.data) {
          const methods = shippingMethodsResponse.data.data
          shippingMethod.value = methods.find((m: any) => m.id === data.shipping_method_id) || null
        }
      } catch (e) {
        // Ignore error
      }
    }

  } catch (err: any) {
    const errorMessage = err.response?.data?.message || err.message || 'Không thể tải thông tin đơn hàng'
    error.value = errorMessage
    showError(errorMessage)
  } finally {
    loading.value = false
  }
}

const formatCurrencySafe = (amount: string | number | null | undefined) => {
  if (amount === null || amount === undefined) return ''
  const value = typeof amount === 'string' ? parseFloat(amount) : amount
  return formatCurrency(value || 0)
}

const formatAddress = (address: any) => {
  if (!address) return ''
  if (typeof address === 'string') return address
  
  const parts = [
    address.address,
    address.ward,
    address.district,
    address.city,
    address.province,
    address.postal_code
  ].filter(Boolean)
  return parts.join(', ')
}

const getPaymentMethodLabel = (method?: any) => {
  if (!method) return '—'
  if (typeof method === 'string') {
    const labels: Record<string, string> = {
      cod: 'Thanh toán khi nhận hàng',
      bank_transfer: 'Chuyển khoản ngân hàng',
      credit_card: 'Thẻ tín dụng',
      debit_card: 'Thẻ ghi nợ',
      ewallet: 'Ví điện tử'
    }
    return labels[method] || method
  }
  return method.name || method.code || '—'
}

const getShippingMethodLabel = (method?: any) => {
  if (!method) return '—'
  if (typeof method === 'string') return method
  return method.name || method.code || '—'
}

const cancelOrder = async () => {
  if (!orderData.value) return
  
  if (confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
    try {
      const orderId = typeof orderData.value.id === 'string' 
        ? parseInt(orderData.value.id) 
        : orderData.value.id
      
      await apiClient.put(publicEndpoints.orders.cancel(orderId))
      showSuccess('Hủy đơn hàng thành công')
      router.push('/home/orders')
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Không thể hủy đơn hàng'
      showError(errorMessage)
    }
  }
}

const processPayment = async () => {
  if (!orderData.value || !paymentMethod.value) return
  
  try {
    const orderId = typeof orderData.value.id === 'string' 
      ? parseInt(orderData.value.id) 
      : orderData.value.id
    
    const paymentUrlData = await createPaymentUrl({
      order_id: orderId,
      payment_method_id: paymentMethod.value.id,
      return_url: `${window.location.origin}/home/orders/${orderId}`,
      cancel_url: `${window.location.origin}/home/orders/${orderId}`
    })
    
    window.location.href = paymentUrlData.payment_url
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || err.message || 'Không thể xử lý thanh toán'
    showError(errorMessage)
  }
}

const printOrder = () => {
  window.print()
}

onMounted(async () => {
  const orderId = route.params.id as string
  if (orderId) {
    const orderIdNum = parseInt(orderId)
    if (isNaN(orderIdNum)) {
      error.value = 'Mã đơn hàng không hợp lệ'
      showError('Mã đơn hàng không hợp lệ')
      return
    }
    await fetchOrder(orderIdNum)
  }
})
</script>

<style scoped>
@media print {
  .no-print {
    display: none !important;
  }
}
</style>
