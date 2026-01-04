<template>
  <div class="container mx-auto p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Chi tiết đơn hàng</h1>
      <div class="flex space-x-2">
            <button
              @click="printOrder"
          class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              In đơn hàng
            </button>
            <NuxtLink
              to="/admin/orders"
          class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              Quay lại
            </NuxtLink>
          </div>
        </div>

    <div v-if="loading" class="flex justify-center items-center h-64">
      <LoadingSpinner size="lg" />
      </div>

    <div v-else-if="order" class="bg-white shadow-md rounded-lg overflow-hidden">
      <!-- Order Header -->
      <div class="p-6 border-b">
        <div class="flex items-start justify-between">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">Đơn hàng #{{ order.order_number }}</h2>
            <p class="text-sm text-gray-500 mt-1">Ngày tạo: {{ formatDate(order.created_at) }}</p>
            </div>
          <div class="flex items-center space-x-2">
            <OrderStatusBadge :status="order.status" size="lg" />
            <PaymentStatusBadge :status="order.payment_status" size="lg" />
            <ShippingStatusBadge :status="order.shipping_status" size="lg" />
          </div>
        </div>
      </div>

      <!-- Order Content -->
      <div class="p-6">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
            <!-- Quick Actions -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="text-sm font-medium text-gray-700 mb-3">Thao tác nhanh - Trạng thái đơn hàng</h3>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button
                  v-if="order.status === 'pending'"
                @click="confirmOrder"
                :disabled="actionLoading"
                  class="px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                Xác nhận
              </button>
              <button
                  v-if="order.status === 'confirmed'"
                @click="markAsProcessing"
                :disabled="actionLoading"
                  class="px-3 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                Đang xử lý
              </button>
              <button
                  v-if="order.status === 'processing'"
                @click="markAsShipped"
                :disabled="actionLoading"
                  class="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Giao hàng
              </button>
              <button
                  v-if="order.status === 'shipped'"
                @click="markAsDelivered"
                :disabled="actionLoading"
                  class="px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                Đã giao
              </button>
              <button
                  v-if="['pending', 'confirmed', 'processing'].includes(order.status)"
                @click="cancelOrder"
                :disabled="actionLoading"
                  class="px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-300 rounded-md hover:bg-red-100 disabled:opacity-50"
              >
                Hủy
              </button>
            </div>
          </div>

          <!-- Payment Status Actions -->
          <div v-if="order.payments && order.payments.length > 0" class="bg-gray-50 rounded-lg p-4">
            <h3 class="text-sm font-medium text-gray-700 mb-3">Trạng thái thanh toán</h3>
            <div class="space-y-2">
              <div v-for="payment in order.payments" :key="payment.id" class="flex items-center justify-between p-2 bg-white rounded border">
                <div class="flex-1">
                  <div class="text-sm font-medium text-gray-900">
                    {{ payment.payment_method?.name || `Payment #${payment.id}` }}
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ formatCurrency(payment.amount) }} - 
                    <PaymentStatusBadge :status="payment.status" size="xs" />
                  </div>
                  <div v-if="payment.transaction_id" class="text-xs text-gray-400 mt-1">
                    Mã GD: {{ payment.transaction_id }}
                  </div>
                </div>
                <div class="flex space-x-1 ml-2">
                  <button
                    v-if="payment.status === 'pending'"
                    @click="updatePaymentStatusHandler(payment.id, 'completed')"
                    :disabled="actionLoading"
                    class="px-2 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
                    title="Đánh dấu đã thanh toán"
                  >
                    Đã thanh toán
                  </button>
                  <button
                    v-if="payment.status === 'pending'"
                    @click="updatePaymentStatusHandler(payment.id, 'failed')"
                    :disabled="actionLoading"
                    class="px-2 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
                    title="Đánh dấu thất bại"
                  >
                    Thất bại
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Order Items -->
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-4">Sản phẩm</h3>
              <div class="border rounded-lg overflow-hidden">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đơn giá</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="item in order.order_items" :key="item.id">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">{{ item.product_name }}</div>
                        <div v-if="item.variant_name" class="text-sm text-gray-500">{{ item.variant_name }}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.product_sku }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ item.quantity }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatCurrency(item.unit_price) }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ formatCurrency(item.total_price) }}</td>
                    </tr>
                  </tbody>
                </table>
            </div>
          </div>

          <!-- Order Timeline -->
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-4">Lịch sử</h3>
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
                    <p class="text-sm text-gray-500">{{ formatDate(order.created_at) }}</p>
                  </div>
                </div>
                <div v-if="order.shipped_at" class="flex items-start">
                <div class="flex-shrink-0">
                  <div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg class="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                        <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-900">Đã giao cho vận chuyển</p>
                    <p class="text-sm text-gray-500">{{ formatDate(order.shipped_at) }}</p>
                  </div>
                </div>
                <div v-if="order.delivered_at" class="flex items-start">
                <div class="flex-shrink-0">
                  <div class="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <svg class="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-900">Đã giao thành công</p>
                    <p class="text-sm text-gray-500">{{ formatDate(order.delivered_at) }}</p>
                  </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-1 space-y-6">
          <!-- Customer Info -->
            <div class="border rounded-lg p-4">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Thông tin khách hàng</h3>
            <div class="space-y-3">
              <div>
                <p class="text-sm text-gray-600">Họ tên</p>
                  <p class="text-sm font-medium text-gray-900">{{ order.customer_name }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Email</p>
                  <p class="text-sm font-medium text-gray-900">{{ order.customer_email }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Điện thoại</p>
                  <p class="text-sm font-medium text-gray-900">{{ order.customer_phone }}</p>
              </div>
                <div v-if="order.user">
                <p class="text-sm text-gray-600">Tài khoản</p>
                  <p class="text-sm font-medium text-gray-900">{{ order.user.username || order.user.email }}</p>
                </div>
            </div>
          </div>

          <!-- Shipping Address -->
            <div class="border rounded-lg p-4">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Địa chỉ giao hàng</h3>
              <p class="text-sm text-gray-600">{{ formatAddress(shippingAddress) }}</p>
          </div>

          <!-- Order Summary -->
            <div class="border rounded-lg p-4">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Tóm tắt đơn hàng</h3>
            <div class="space-y-3">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Tạm tính:</span>
                  <span class="font-medium">{{ formatCurrency(order.subtotal || 0) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Phí vận chuyển:</span>
                  <span class="font-medium">{{ formatCurrency(order.shipping_amount || 0) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Thuế:</span>
                  <span class="font-medium">{{ formatCurrency(order.tax_amount || 0) }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Giảm giá:</span>
                  <span class="font-medium">{{ formatCurrency(order.discount_amount || 0) }}</span>
              </div>
              <div class="border-t pt-3">
                <div class="flex justify-between">
                  <span class="text-base font-medium text-gray-900">Tổng cộng:</span>
                    <span class="text-base font-bold text-gray-900">{{ formatCurrency(order.total_amount) }}</span>
                  </div>
                </div>
              </div>

              <div class="mt-4 pt-4 border-t">
                <div class="mb-3">
                  <p class="text-sm text-gray-600">Phương thức thanh toán:</p>
                  <p class="text-sm font-medium text-gray-900">{{ getPaymentMethodLabel(order.payment_method_id) }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Phương thức vận chuyển:</p>
                  <p class="text-sm font-medium text-gray-900">{{ getShippingMethodLabel(order.shipping_method) }}</p>
                </div>
              </div>
            </div>

            <!-- Notes -->
            <div v-if="order.notes" class="border rounded-lg p-4">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Ghi chú</h3>
              <p class="text-sm text-gray-600">{{ order.notes }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-8">
      <p class="text-gray-500">Không tìm thấy đơn hàng</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAdminOrders } from '@/composables/orders'
import OrderStatusBadge from '@/components/Common/Orders/Badges/OrderStatusBadge.vue'
import PaymentStatusBadge from '@/components/Common/Orders/Badges/PaymentStatusBadge.vue'
import ShippingStatusBadge from '@/components/Common/Orders/Badges/ShippingStatusBadge.vue'
import LoadingSpinner from '@/components/Core/Loading/LoadingSpinner.vue'

definePageMeta({
  layout: 'admin-layout',
  requiresAuth: true,
  requiresAdmin: true
})

const route = useRoute()
const router = useRouter()

// Use admin orders composable
const {
  currentOrder: order,
  loading,
  fetchOrder,
  updateOrderStatus,
  updatePaymentStatus,
  updateOrder
} = useAdminOrders()

const actionLoading = ref(false)

// Computed
const shippingAddress = computed(() => {
  if (!order.value?.shipping_address) return null
  try {
    return typeof order.value.shipping_address === 'string' 
      ? JSON.parse(order.value.shipping_address) 
      : order.value.shipping_address
  } catch {
    return null
  }
})

// Fetch order data
onMounted(async () => {
  const orderId = route.params.id
  if (orderId) {
    try {
      await fetchOrder(orderId)
    } catch (error) {
      // Error already handled in composable
    }
  }
})

// Order actions
const changeStatus = async (status, notes) => {
  if (!order.value) return

  actionLoading.value = true
  try {
    await updateOrderStatus(order.value.id, { status, notes })
    // Refresh order data
    await fetchOrder(order.value.id)
  } catch (error) {
    // Error already handled in composable
  } finally {
    actionLoading.value = false
  }
}

const confirmOrder = () => changeStatus('confirmed', 'Đã xác nhận đơn hàng')
const markAsProcessing = () => changeStatus('processing', 'Chuyển sang xử lý')

const markAsShipped = async () => {
  if (!order.value) return

  const trackingNumber = prompt('Nhập mã vận đơn (tuỳ chọn):') || undefined
  actionLoading.value = true
  try {
    // Cập nhật status trước
    await updateOrderStatus(order.value.id, {
      status: 'shipped',
      notes: trackingNumber ? `Đã giao cho vận chuyển - Mã vận đơn: ${trackingNumber}` : 'Đã giao cho vận chuyển'
    })
    // Nếu có tracking number, cập nhật thêm tracking_number
    if (trackingNumber) {
      await updateOrder(order.value.id, {
        tracking_number: trackingNumber
      }, false) // Don't show notification for this update
    }
    // Refresh order data
    await fetchOrder(order.value.id)
  } catch (error) {
    // Error already handled in composable
  } finally {
    actionLoading.value = false
  }
}

const markAsDelivered = () => changeStatus('delivered', 'Đã giao thành công')

const cancelOrder = async () => {
  if (!order.value) return

  const reason = prompt('Lý do hủy đơn hàng:')
  if (!reason) return

  await changeStatus('cancelled', reason)
}

// Update payment status
const updatePaymentStatusHandler = async (paymentId, status) => {
  if (!order.value) return

  // Confirm action
  const statusLabels = {
    'completed': 'Đã thanh toán',
    'failed': 'Thất bại',
    'processing': 'Đang xử lý'
  }
  const label = statusLabels[status] || status
  
  if (!confirm(`Xác nhận đánh dấu thanh toán là "${label}"?`)) {
    return
  }

  // Get notes if needed
  let notes = ''
  if (status === 'completed') {
    notes = prompt('Ghi chú (tùy chọn):') || undefined
  }

  actionLoading.value = true
  try {
    await updatePaymentStatus(paymentId, status, notes)
    // Refresh order data to get updated payment status
    await fetchOrder(order.value.id)
  } catch (error) {
    // Error already handled in composable
  } finally {
    actionLoading.value = false
  }
}

const printOrder = () => {
  window.print()
}

// Format helpers
const formatCurrency = (amount) => {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(value || 0)
}

const formatDate = (dateString) => {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatAddress = (address) => {
  if (!address) return '—'
  if (typeof address === 'string') {
    try {
      address = JSON.parse(address)
    } catch {
      return address
    }
  }
  const parts = [
    address.address,
    address.district,
    address.city
  ].filter(Boolean)
  return parts.length > 0 ? parts.join(', ') : '—'
}

const getPaymentMethodLabel = (methodId) => {
  if (!methodId) return '—'
  // You can enhance this to fetch payment method details if needed
  return `Phương thức #${methodId}`
}

const getShippingMethodLabel = (method) => {
  if (!method) return '—'
  if (typeof method === 'string') return method
  return method.name || method.code || '—'
}
</script>

<style scoped>
@media print {
  .no-print {
    display: none !important;
  }
}
</style>
