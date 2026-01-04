<template>
  <div class="admin-stock-transfers">
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

    <!-- Filter (slot) -->
    <slot
      name="filter"
      :filters="filters"
      :status-options="statusOptions"
      :warehouse-options="warehouseOptions"
      :on-update="handleFilterUpdate"
      :on-filter-change="handleFilterChange"
    >
      <AdminFilter
        :initial-filters="filters"
        :has-advanced-filters="false"
        :has-sort-options="false"
        :show-search="false"
        @update:filters="handleFilterUpdate"
        @filter-change="handleFilterChange"
      >
        <template #main-filters="{ filters: localFilters, onChange }">
          <div class="min-w-[170px]">
            <SelectFilter
              v-model="localFilters.status"
              :options="statusOptions"
              placeholder="Chọn trạng thái"
              @update:model-value="onChange"
            />
          </div>
          <div class="min-w-[220px]">
            <SelectFilter
              v-model="localFilters.warehouse_id"
              :options="warehouseOptions"
              placeholder="Kho xuất/nhận"
              @update:model-value="onChange"
            />
          </div>
        </template>
      </AdminFilter>
    </slot>

    <!-- Table (slot) -->
    <slot
      name="table"
      :items="items"
      :loading="loading"
      :get-serial-number="getSerialNumber"
      :get-status-label="getStatusLabel"
      :get-status-class="getStatusClass"
      :format-date="formatDate"
      :on-approve="approveTransfer"
      :on-cancel="cancelTransfer"
    >
      <div class="bg-white shadow-md rounded-lg overflow-hidden">
        <SkeletonLoader v-if="loading" type="table" :rows="5" :columns="9" />
        <div v-else class="table-responsive">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số phiếu</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kho xuất</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kho nhận</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(transfer, index) in items" :key="transfer.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ getSerialNumber(index) }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <code class="px-2 py-1 bg-gray-100 rounded text-xs font-mono">{{ transfer.transfer_number }}</code>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ transfer.from_warehouse?.name || '—' }}</div>
                  <div class="text-sm text-gray-500">{{ transfer.from_warehouse?.code || '—' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ transfer.to_warehouse?.name || '—' }}</div>
                  <div class="text-sm text-gray-500">{{ transfer.to_warehouse?.code || '—' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ transfer.variant?.name || '—' }}</div>
                  <div class="text-sm text-gray-500">{{ transfer.variant?.sku || '—' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ transfer.quantity }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="getStatusClass(transfer.status)"
                  >
                    {{ getStatusLabel(transfer.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(transfer.created_at) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex space-x-2">
                    <button
                      v-if="transfer.status === 'pending'"
                      @click="approveTransfer(transfer)"
                      class="text-green-600 hover:text-green-900"
                      title="Duyệt"
                    >
                      Duyệt
                    </button>
                    <button
                      v-if="transfer.status === 'pending'"
                      @click="cancelTransfer(transfer)"
                      class="text-red-600 hover:text-red-900"
                      title="Hủy"
                    >
                      Hủy
                    </button>
                  </div>
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
      :warehouse-options="warehouseOptions"
      :create-form="createForm"
      :is-submitting="isSubmitting"
      :on-close="closeCreateModal"
      :on-submit="handleCreateTransfer"
    >
      <Modal
        v-if="modals.create"
        :show="modals.create"
        title="Tạo phiếu chuyển kho"
        @close="closeCreateModal"
      >
        <form @submit.prevent="handleCreateTransfer" class="space-y-4">
          <div>
            <label for="from_warehouse_id" class="block text-sm font-medium text-gray-700 mb-1">
              Kho xuất <span class="text-red-500">*</span>
            </label>
            <select
              id="from_warehouse_id"
              v-model.number="createForm.from_warehouse_id"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Chọn kho xuất</option>
              <option
                v-for="wh in warehouseOptions.filter(w => w.value !== '')"
                :key="wh.value"
                :value="wh.value"
              >
                {{ wh.label }}
              </option>
            </select>
          </div>

          <div>
            <label for="to_warehouse_id" class="block text-sm font-medium text-gray-700 mb-1">
              Kho nhận <span class="text-red-500">*</span>
            </label>
            <select
              id="to_warehouse_id"
              v-model.number="createForm.to_warehouse_id"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Chọn kho nhận</option>
              <option
                v-for="wh in warehouseOptions.filter(w => w.value !== '' && w.value !== createForm.from_warehouse_id)"
                :key="wh.value"
                :value="wh.value"
              >
                {{ wh.label }}
              </option>
            </select>
          </div>

          <div>
            <label for="quantity" class="block text-sm font-medium text-gray-700 mb-1">
              Số lượng <span class="text-red-500">*</span>
            </label>
            <input
              id="quantity"
              v-model.number="createForm.quantity"
              type="number"
              min="1"
              step="1"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label for="notes" class="block text-sm font-medium text-gray-700 mb-1">
              Ghi chú
            </label>
            <textarea
              id="notes"
              v-model="createForm.notes"
              rows="3"
              placeholder="Ghi chú về phiếu chuyển kho..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            ></textarea>
          </div>

          <div class="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              @click="closeCreateModal"
              class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none"
              :disabled="isSubmitting"
            >
              <span v-if="isSubmitting">Đang xử lý...</span>
              <span v-else>Tạo phiếu</span>
            </button>
          </div>
        </form>
      </Modal>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useUrlListSync } from '@/composables/utils/useUrlListSync'
import { useToast } from '@/composables/ui/useToast'
import { useSerialNumber, useAdminModals } from '@/composables/ui'
import SkeletonLoader from '@/components/Core/Loading/SkeletonLoader.vue'
import Pagination from '@/components/Core/Navigation/Pagination.vue'
import AdminFilter from '@/components/Admin/Filter/AdminFilter.vue'
import SelectFilter from '@/components/Core/Filter/SelectFilter.vue'
import Modal from '@/components/Core/Modal/Modal.vue'
import { adminEndpoints } from '@/api/endpoints'
import { useGlobalApiClient } from '@/composables/api'

// Props
interface Props {
  title?: string
  createButtonText?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Quản lý chuyển kho',
  createButtonText: 'Tạo phiếu chuyển kho'
})

// Emits
const emit = defineEmits<{
  created: [transfer: any]
  approved: [id: string | number]
  cancelled: [id: string | number]
}>()

const listComposable = useUrlListSync({
  endpoint: adminEndpoints.stockTransfers.list
})

const {
  items,
  loading,
  pagination,
  filters,
  updateFilters,
  changePage,
  refresh
} = listComposable

const { getSerialNumber } = useSerialNumber(pagination)
const { showSuccess, showError } = useToast()
const { apiClient } = useGlobalApiClient()

const warehouseOptions = ref([{ value: '', label: 'Tất cả kho' }])
const statusOptions = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'in_transit', label: 'Đang vận chuyển' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'cancelled', label: 'Đã hủy' }
]

const hasData = computed(() => items.value.length > 0)

const {
  modals,
  openCreateModal,
  closeCreateModal
} = useAdminModals()

const createForm = ref({
  from_warehouse_id: null as number | null,
  to_warehouse_id: null as number | null,
  quantity: 1,
  notes: ''
})
const isSubmitting = ref(false)

onMounted(() => {
  fetchWarehouses()
})

async function fetchWarehouses() {
  try {
    const response = await apiClient.get(adminEndpoints.warehouses.list, { params: { limit: 100 } })
    if (response.data?.success && Array.isArray(response.data.data)) {
      warehouseOptions.value = [
        { value: '', label: 'Tất cả kho' },
        ...response.data.data.map((wh: any) => ({
          value: wh.id,
          label: `${wh.name} (${wh.code})`
        }))
      ]
    }
  } catch (error) {
    // Silent fail
  }
}

async function handleFilterUpdate(newFilters: any) {
  await updateFilters(newFilters)
}

function handleFilterChange() {
  // Áp dụng lọc sau khi nhấn nút trong AdminFilter
}

function closeCreateModalWithReset() {
  closeCreateModal()
  createForm.value = {
    from_warehouse_id: null,
    to_warehouse_id: null,
    quantity: 1,
    notes: ''
  }
}

async function handleCreateTransfer() {
  if (
    createForm.value.from_warehouse_id === null ||
    createForm.value.to_warehouse_id === null
  ) {
    showError('Vui lòng chọn kho xuất và kho nhận')
    return
  }

  if ((createForm.value.from_warehouse_id as any) === (createForm.value.to_warehouse_id as any)) {
    showError('Kho xuất và kho nhận không thể giống nhau')
    return
  }

  isSubmitting.value = true
  try {
    const response = await apiClient.post(adminEndpoints.stockTransfers.create, createForm.value)
    if (response.data?.success) {
      showSuccess('Phiếu chuyển kho đã được tạo thành công')
      closeCreateModalWithReset()
      await refresh()
      emit('created', response.data.data)
    } else {
      showError(response.data?.message || 'Không thể tạo phiếu chuyển kho')
    }
  } catch (error: any) {
    showError(error.response?.data?.message || 'Không thể tạo phiếu chuyển kho')
  } finally {
    isSubmitting.value = false
  }
}

async function approveTransfer(transfer: any) {
  try {
    const response = await apiClient.put(adminEndpoints.stockTransfers.approve(transfer.id))
    if (response.data?.success) {
      showSuccess('Đã duyệt phiếu chuyển kho')
      await refresh()
      emit('approved', transfer.id)
    } else {
      showError('Không thể duyệt phiếu chuyển kho')
    }
  } catch (error) {
    showError('Không thể duyệt phiếu chuyển kho')
  }
}

async function cancelTransfer(transfer: any) {
  try {
    const response = await apiClient.put(adminEndpoints.stockTransfers.cancel(transfer.id))
    if (response.data?.success) {
      showSuccess('Đã hủy phiếu chuyển kho')
      await refresh()
      emit('cancelled', transfer.id)
    } else {
      showError('Không thể hủy phiếu chuyển kho')
    }
  } catch (error) {
    showError('Không thể hủy phiếu chuyển kho')
  }
}

function handlePageChange(page: number) {
  changePage(page)
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: 'Chờ duyệt',
    in_transit: 'Đang vận chuyển',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy'
  }
  return labels[status] || status
}

function getStatusClass(status: string) {
  const classes: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_transit: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

function formatDate(dateString: string) {
  if (!dateString) return '—'
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
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

