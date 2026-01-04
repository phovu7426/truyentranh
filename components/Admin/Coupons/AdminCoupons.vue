<template>
  <div class="admin-coupons">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">{{ title }}</h1>
      <button 
        @click="openCreateModal" 
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
      >
        {{ createButtonText }}
      </button>
    </div>

    <!-- Filter (allow override via named slot) -->
    <slot
      name="filter"
      :filters="filters"
      :status-enums="statusEnums"
      :type-enums="typeEnums"
      :on-update="handleFilterUpdate"
    >
      <!-- Default filter -->
      <CouponsFilter
        :initial-filters="filters"
        :status-enums="statusEnums"
        :type-enums="typeEnums"
        @update:filters="handleFilterUpdate"
      />
    </slot>

    <!-- Table (allow override via slot) -->
    <slot
      name="table"
      :items="items"
      :loading="loading"
      :get-serial-number="getSerialNumber"
      :get-type-label="getTypeLabel"
      :get-status-label="getStatusLabel"
      :get-status-class="getStatusClass"
      :format-currency="formatCurrency"
      :format-date="formatDate"
      :is-expired="isExpired"
      :on-edit="openEditModal"
      :on-delete="confirmDelete"
      :on-view-stats="viewStats"
    >
      <!-- Default table -->
      <div class="bg-white shadow-md rounded-lg overflow-hidden">
        <SkeletonLoader v-if="loading" type="table" :rows="5" :columns="8" />
        <table v-else class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá trị</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hạn sử dụng</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(coupon, index) in items" :key="coupon.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ getSerialNumber(index) }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ coupon.code }}</div>
                <div class="text-sm text-gray-500">{{ coupon.description || '—' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ getTypeLabel(coupon.type) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span v-if="coupon.type === 'percentage'">{{ coupon.value }}%</span>
                <span v-else-if="coupon.type === 'fixed_amount'">{{ formatCurrency(coupon.value) }}</span>
                <span v-else>—</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ coupon.usage_limit ? `${coupon.used_count || 0}/${coupon.usage_limit}` : 'Không giới hạn' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div v-if="coupon.start_date || coupon.end_date">
                  <div v-if="coupon.start_date">{{ formatDate(coupon.start_date) }}</div>
                  <div v-if="coupon.end_date">{{ formatDate(coupon.end_date) }}</div>
                </div>
                <span v-else>—</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex flex-col space-y-1">
                  <span
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="getStatusClass(coupon.status)"
                  >
                    {{ getStatusLabel(coupon.status) }}
                  </span>
                  <div v-if="isExpired(coupon)" class="text-xs text-red-600 mt-1">
                    Đã hết hạn
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <Actions
                    :item="coupon"
                    :show-view="false"
                    :show-delete="false"
                    @edit="openEditModal"
                    :additional-actions="[
                      {
                        label: 'Thống kê',
                        action: () => viewStats(coupon),
                        icon: 'chart'
                      },
                      {
                        label: 'Xóa',
                        action: () => confirmDelete(coupon),
                        icon: 'trash'
                      }
                    ]"
                  />
              </td>
            </tr>
            <tr v-if="items.length === 0">
              <td colspan="8" class="px-6 py-4 text-center text-gray-500">
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

    <!-- Create Modal (slot) -->
    <slot
      name="create-modal"
      :modals="modals"
      :type-enums="typeEnums"
      :api-errors="apiErrors"
      :on-close="closeCreateModal"
      :on-created="handleCouponCreated"
    >
      <CreateCoupon
        v-if="modals.create"
        :show="modals.create"
        :type-enums="typeEnums"
        :api-errors="apiErrors"
        :on-close="closeCreateModal"
        @created="handleCouponCreated"
      />
    </slot>

    <!-- Edit Modal (slot) -->
    <slot
      name="edit-modal"
      :modals="modals"
      :coupon="selectedItem"
      :type-enums="typeEnums"
      :api-errors="apiErrors"
      :on-close="closeEditModal"
      :on-updated="handleCouponUpdated"
    >
      <EditCoupon
        v-if="modals.edit"
        :show="modals.edit"
        :coupon="selectedItem"
        :type-enums="typeEnums"
        :api-errors="apiErrors"
        :on-close="closeEditModal"
        @updated="handleCouponUpdated"
      />
    </slot>

    <!-- Delete Modal (slot) -->
    <slot
      name="delete-modal"
      :modals="modals"
      :coupon="selectedItem"
      :on-close="closeDeleteModal"
      :on-confirm="deleteCoupon"
    >
      <ConfirmModal
        v-if="modals.delete"
        :show="modals.delete"
        title="Xác nhận xóa"
        :message="`Bạn có chắc chắn muốn xóa mã giảm giá ${selectedItem?.code || ''}?`"
        :on-close="closeDeleteModal"
        @confirm="deleteCoupon"
      />
    </slot>
  </div>
</template>

<script setup lang="ts">
// Vue
import { ref, onMounted, defineAsyncComponent } from 'vue'

// Composables
import { useAdminListPage } from '@/composables/admin'
import { useGlobalApiClient } from '@/composables/api'
import { adminEndpoints } from '@/api/endpoints'

// Utils
import { formatCurrency } from '@/utils/formatters'

// Components
import SkeletonLoader from '@/components/Core/Loading/SkeletonLoader.vue'
import ConfirmModal from '@/components/Core/Modal/ConfirmModal.vue'
import Actions from '@/components/Core/Actions/Actions.vue'
import Pagination from '@/components/Core/Navigation/Pagination.vue'
import CouponsFilter from './CouponsFilter.vue'

// Props
interface Props {
  title?: string
  createButtonText?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Quản lý mã giảm giá',
  createButtonText: 'Thêm mã giảm giá mới'
})

// Emits
const emit = defineEmits<{
  created: [coupon: any]
  updated: [coupon: any]
  deleted: [id: string | number]
}>()

// Lazy load components
const CreateCoupon = defineAsyncComponent(() => import('./CreateCoupon.vue'))
const EditCoupon = defineAsyncComponent(() => import('./EditCoupon.vue'))

// Use admin list page composable
const {
  items,
  loading,
  pagination,
  filters,
  apiErrors,
  hasData,
  modals,
  selectedItem,
  openCreateModal,
  closeCreateModal,
  openEditModal,
  closeEditModal,
  openDeleteModal: confirmDelete,
  closeDeleteModal,
  updateFilters,
  changePage,
  clearApiErrors,
  handleCreate,
  handleUpdate,
  handleDelete,
  getSerialNumber,
  showError
} = useAdminListPage({
  endpoints: {
    list: adminEndpoints.coupons.list,
    create: adminEndpoints.coupons.create,
    update: (id) => adminEndpoints.coupons.update(id),
    delete: (id) => adminEndpoints.coupons.delete(id)
  },
  defaults: {
    title: props.title,
    createButtonText: props.createButtonText
  },
  messages: {
    createSuccess: 'Mã giảm giá đã được tạo thành công',
    createError: 'Không thể tạo mã giảm giá',
    updateSuccess: 'Mã giảm giá đã được cập nhật thành công',
    updateError: 'Không thể cập nhật mã giảm giá',
    deleteSuccess: 'Mã giảm giá đã được xóa thành công',
    deleteError: 'Không thể xóa mã giảm giá'
  },
  onCreated: (item) => emit('created', item),
  onUpdated: (item) => emit('updated', item),
  onDeleted: (id) => emit('deleted', id)
})

const { apiClient } = useGlobalApiClient()

const statusEnums = ref([])
const typeEnums = ref([
  { value: 'percentage', label: 'Phần trăm' },
  { value: 'fixed_amount', label: 'Số tiền cố định' },
  { value: 'free_shipping', label: 'Miễn phí vận chuyển' }
])

onMounted(() => {
  fetchEnums()
})

async function fetchEnums() {
  try {
    const response = await apiClient.get(adminEndpoints.enums.byName('coupon_status'))
    if (response.data?.success) {
      statusEnums.value = response.data.data || []
    } else {
      statusEnums.value = [
        { value: 'active', label: 'Hoạt động' },
        { value: 'inactive', label: 'Không hoạt động' },
        { value: 'expired', label: 'Hết hạn' }
      ]
    }
  } catch (e) {
    statusEnums.value = [
      { value: 'active', label: 'Hoạt động' },
      { value: 'inactive', label: 'Không hoạt động' },
      { value: 'expired', label: 'Hết hạn' }
    ]
  }
}

async function handleFilterUpdate(newFilters: any) {
  await updateFilters(newFilters)
}

async function handleCouponCreated(couponData: any) {
  await handleCreate(couponData)
}

async function handleCouponUpdated(couponData: any) {
  if (!selectedItem.value) return
  await handleUpdate(selectedItem.value.id, couponData)
}

async function deleteCoupon() {
  if (!selectedItem.value) return
  await handleDelete(selectedItem.value.id)
}

function viewStats(coupon: any) {
  // TODO: Implement stats view
  showError('Tính năng thống kê đang được phát triển')
}

function handlePageChange(page: number) {
  changePage(page)
}

function getTypeLabel(type: string) {
  const found = typeEnums.value.find(t => t.value === type)
  return found?.label || type || 'Không xác định'
}

function getStatusLabel(status: string) {
  const found = (statusEnums.value as any[]).find(s => s.value === status)
  return found?.label || status || 'Không xác định'
}

function getStatusClass(status: string) {
  const found = (statusEnums.value as any[]).find(s => s.value === status)
  return found?.class || found?.badge_class || found?.color_class || 'bg-gray-100 text-gray-800'
}

function formatDate(dateString: string) {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function isExpired(coupon: any) {
  if (!coupon.end_date) return false
  return new Date(coupon.end_date) < new Date()
}
</script>

<style scoped>
.table-responsive {
  overflow-x: auto;
}
</style>

