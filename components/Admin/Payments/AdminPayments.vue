<template>
  <div class="admin-payments">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">{{ title }}</h1>
    </div>

    <!-- Filter (allow override via named slot) -->
    <slot
      name="filter"
      :filters="localFilters"
      :on-update="applyFilters"
      :on-reset="resetFilters"
      :debounced-search="debouncedSearch"
    >
      <!-- Default filter -->
      <div class="mb-6 bg-white shadow rounded-lg p-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label for="order_id" class="block text-sm font-medium text-gray-700">
              Mã đơn hàng
            </label>
            <input
              id="order_id"
              v-model="localFilters.order_id"
              type="number"
              placeholder="ID đơn hàng"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              @input="debouncedSearch"
            />
          </div>
          
          <div>
            <label for="status" class="block text-sm font-medium text-gray-700">
              Trạng thái
            </label>
            <select
              id="status"
              v-model="localFilters.status"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              @change="applyFilters"
            >
              <option value="">Tất cả</option>
              <option value="pending">Chờ thanh toán</option>
              <option value="processing">Đang xử lý</option>
              <option value="completed">Đã thanh toán</option>
              <option value="failed">Thất bại</option>
            </select>
          </div>
          
          <div class="flex items-end">
            <button
              @click="resetFilters"
              class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Đặt lại
            </button>
          </div>
        </div>
      </div>
    </slot>

    <!-- Table (allow override via slot) -->
    <slot
      name="table"
      :items="items"
      :loading="loading"
      :get-serial-number="getSerialNumber"
      :format-currency="formatCurrency"
      :format-date="formatDate"
      :on-update-status="updatePaymentStatus"
    >
      <!-- Default table -->
      <div class="bg-white shadow-md rounded-lg overflow-hidden">
        <SkeletonLoader v-if="loading" type="table" :rows="5" :columns="8" />
        <table v-else class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã thanh toán</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đơn hàng</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phương thức</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số tiền</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã GD</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(payment, index) in items" :key="payment.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ getSerialNumber(index) }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">#{{ payment.id }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <NuxtLink
                  :to="`/admin/orders/${payment.order_id}`"
                  class="text-sm text-blue-600 hover:text-blue-800"
                >
                  #{{ payment.order_id }}
                </NuxtLink>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ payment.payment_method?.name || '—' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatCurrency(payment.amount) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <PaymentStatusBadge :status="payment.status" size="sm" />
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ payment.transaction_id || '—' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(payment.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  v-if="payment.status === 'pending'"
                  @click="updatePaymentStatus(payment.id, 'completed')"
                  class="text-green-600 hover:text-green-900 mr-3"
                >
                  Đã thanh toán
                </button>
                <button
                  v-if="payment.status === 'pending'"
                  @click="updatePaymentStatus(payment.id, 'failed')"
                  class="text-red-600 hover:text-red-900"
                >
                  Thất bại
                </button>
              </td>
            </tr>
            <tr v-if="items.length === 0">
              <td colspan="9" class="px-6 py-4 text-center text-gray-500">
                Không có dữ liệu
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </slot>

    <!-- Pagination -->
    <Pagination
      v-if="hasData"
      :current-page="pagination.page"
      :total-pages="pagination.totalPages"
      :total-items="pagination.totalItems"
      :loading="loading"
      @page-change="handlePageChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useAdminListPage } from '@/composables/admin'
import { useToast } from '@/composables/ui/useToast'
import PaymentStatusBadge from '@/components/Common/Orders/Badges/PaymentStatusBadge.vue'
import SkeletonLoader from '@/components/Core/Loading/SkeletonLoader.vue'
import Pagination from '@/components/Core/Navigation/Pagination.vue'
import { adminEndpoints } from '@/api/endpoints'
import { useGlobalApiClient } from '@/composables/api'
import { useAdminOrders } from '@/composables/orders/useAdminOrders'

// Props
interface Props {
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Quản lý thanh toán'
})

// Emits
const emit = defineEmits<{
  statusUpdated: [paymentId: string | number, status: string]
}>()

const { showSuccess, showError } = useToast()
const { apiClient } = useGlobalApiClient()
const { updatePaymentStatus: updatePaymentStatusApi } = useAdminOrders()

// Use admin list page composable (Payments chỉ có list, không có CRUD)
const {
  items,
  loading,
  pagination,
  filters,
  hasData,
  updateFilters,
  changePage,
  refresh,
  getSerialNumber
} = useAdminListPage({
  endpoints: {
    list: adminEndpoints.adminPayments.list
  },
  defaults: {
    title: props.title
  }
})

// Local state cho filters
const localFilters = reactive({
  order_id: '',
  status: ''
})

let searchTimeout: ReturnType<typeof setTimeout> | null = null

// Đồng bộ state với URL
watch(() => filters.value, (newFilters) => {
  localFilters.order_id = newFilters?.order_id || ''
  localFilters.status = newFilters?.status || ''
}, { immediate: true, deep: true })

const debouncedSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(() => {
    applyFilters()
  }, 500)
}

const applyFilters = () => {
  const filtersToApply: Record<string, any> = {}
  if (localFilters.order_id) {
    filtersToApply.order_id = localFilters.order_id
  }
  if (localFilters.status) {
    filtersToApply.status = localFilters.status
  }
  updateFilters(filtersToApply)
}

const resetFilters = () => {
  localFilters.order_id = ''
  localFilters.status = ''
  updateFilters({})
}

const handlePageChange = async (page: number) => {
  await changePage(page)
}

const updatePaymentStatus = async (paymentId: string | number, status: string) => {
  const statusLabels: Record<string, string> = {
    'completed': 'Đã thanh toán',
    'failed': 'Thất bại',
    'processing': 'Đang xử lý'
  }
  const label = statusLabels[status] || status
  
  if (!confirm(`Xác nhận đánh dấu thanh toán là "${label}"?`)) {
    return
  }

  try {
    let notes = ''
    if (status === 'completed') {
      notes = prompt('Ghi chú (tùy chọn):') || ''
    }
    
    await updatePaymentStatusApi(paymentId, status, notes || undefined)
    showSuccess('Cập nhật trạng thái thanh toán thành công')
    refresh()
    emit('statusUpdated', paymentId, status)
  } catch (error: any) {
    showError(error.response?.data?.message || 'Không thể cập nhật trạng thái thanh toán')
  }
}

const formatCurrency = (amount: number | string) => {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(value || 0)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.table-responsive {
  overflow-x: auto;
}
</style>

