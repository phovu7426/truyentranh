<template>
  <div class="admin-orders">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">{{ title }}</h1>
      <button
        @click="exportOrders"
        class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none"
      >
        Xuất Excel
      </button>
    </div>

    <!-- Filter (slot) -->
    <slot
      name="filter"
      :filters="filters"
      :on-update="handleFilterUpdate"
    >
      <OrdersFilter
        :initial-filters="filters"
        @update:filters="handleFilterUpdate"
      />
    </slot>

    <!-- Table (slot) -->
    <slot
      name="table"
      :items="items"
      :loading="loading"
      :get-serial-number="getSerialNumber"
      :format-currency="formatCurrency"
      :format-date="formatDate"
      :get-order-actions="getOrderActions"
      :on-view="viewOrder"
      :on-confirm="confirmOrder"
      :on-cancel="cancelOrder"
    >
      <div class="bg-white shadow-md rounded-lg overflow-hidden">
        <SkeletonLoader v-if="loading" type="table" :rows="5" :columns="10" />
        <table v-else class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã đơn hàng</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thanh toán</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vận chuyển</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(order, index) in items" :key="order.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ getSerialNumber(index) }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ order.order_number }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ order.customer_name }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">{{ order.customer_email }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <OrderStatusBadge :status="order.status" size="sm" />
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <PaymentStatusBadge :status="order.payment_status" size="sm" />
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <ShippingStatusBadge :status="order.shipping_status" size="sm" />
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">làm đ
                {{ formatCurrency(order.total_amount) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(order.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <Actions
                  :item="order"
                  :show-view="false"
                  :show-delete="false"
                  :show-edit="false"
                  :additional-actions="getOrderActions(order)"
                />
              </td>
            </tr>
            <tr v-if="items.length === 0">
              <td colspan="10" class="px-6 py-4 text-center text-gray-500">
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
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminListPage } from '@/composables/admin'
import { useToast } from '@/composables/ui/useToast'
import OrderStatusBadge from '@/components/Common/Orders/Badges/OrderStatusBadge.vue'
import PaymentStatusBadge from '@/components/Common/Orders/Badges/PaymentStatusBadge.vue'
import ShippingStatusBadge from '@/components/Common/Orders/Badges/ShippingStatusBadge.vue'
import SkeletonLoader from '@/components/Core/Loading/SkeletonLoader.vue'
import Actions from '@/components/Core/Actions/Actions.vue'
import Pagination from '@/components/Core/Navigation/Pagination.vue'
import { adminEndpoints } from '@/api/endpoints'
import { useGlobalApiClient } from '@/composables/api'
import OrdersFilter from './OrdersFilter.vue'

// Props
interface Props {
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Quản lý đơn hàng'
})

// Emits
const emit = defineEmits<{
  viewed: [order: any]
  confirmed: [order: any]
  cancelled: [order: any]
}>()

const router = useRouter()
const { showSuccess, showError } = useToast()
const { apiClient } = useGlobalApiClient()

// Use admin list page composable (Orders chỉ có list, không có CRUD)
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
    list: adminEndpoints.orders.list
  },
  defaults: {
    title: props.title
  }
})

async function handleFilterUpdate(newFilters: any) {
  await updateFilters(newFilters)
}

const getOrderActions = (order: any) => {
  const actions = [
    {
      label: 'Xem',
      action: () => viewOrder(order),
      icon: 'view'
    }
  ]

  if (order.status === 'pending') {
    actions.push({
      label: 'Xác nhận',
      action: () => confirmOrder(order),
      icon: 'check'
    })
  }

  if (['pending', 'confirmed'].includes(order.status)) {
    actions.push({
      label: 'Hủy',
      action: () => cancelOrder(order),
      icon: 'trash'
    })
  }

  return actions
}

const viewOrder = (order: any) => {
  router.push(`/admin/orders/${order.id}`)
  emit('viewed', order)
}

const confirmOrder = async (order: any) => {
  if (confirm(`Xác nhận đơn hàng ${order.order_number}?`)) {
    try {
      await apiClient.patch(adminEndpoints.orders.updateStatus(order.id), {
        status: 'confirmed',
        notes: 'Đã xác nhận đơn hàng'
      })
      showSuccess('Đơn hàng đã được xác nhận thành công')
      refresh()
      emit('confirmed', order)
    } catch (error: any) {
      showError(error.response?.data?.message || 'Không thể xác nhận đơn hàng')
    }
  }
}

const cancelOrder = async (order: any) => {
  const reason = prompt('Lý do hủy đơn hàng:')
  if (reason) {
    try {
      await apiClient.patch(adminEndpoints.orders.updateStatus(order.id), {
        status: 'cancelled',
        notes: reason
      })
      showSuccess('Đơn hàng đã được hủy thành công')
      refresh()
      emit('cancelled', order)
    } catch (error: any) {
      showError(error.response?.data?.message || 'Không thể hủy đơn hàng')
    }
  }
}

const exportOrders = () => {
  // This would implement Excel export functionality
  showError('Chức năng xuất Excel chưa được triển khai')
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

async function handlePageChange(page: number) {
  await changePage(page)
}
</script>

<style scoped>
.table-responsive {
  overflow-x: auto;
}
</style>

