<template>
  <div class="admin-warehouses">
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
      :on-update="handleFilterUpdate"
    >
      <!-- Default filter -->
      <WarehousesFilter
        :initial-filters="filters"
        @update:filters="handleFilterUpdate"
      />
    </slot>

    <!-- Table (allow override via slot) -->
    <slot
      name="table"
      :items="items"
      :loading="loading"
      :get-serial-number="getSerialNumber"
      :on-edit="openEditModal"
      :on-delete="confirmDelete"
      :on-view-inventory="viewInventory"
    >
      <!-- Default table -->
      <div class="bg-white shadow-md rounded-lg overflow-hidden">
        <SkeletonLoader v-if="loading" type="table" :rows="5" :columns="8" />
        <div v-else class="table-responsive">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã kho</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên kho</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Địa chỉ</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người quản lý</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Độ ưu tiên</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(warehouse, index) in items" :key="warehouse.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ getSerialNumber(index) }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <code class="px-2 py-1 bg-gray-100 rounded text-xs font-mono">{{ warehouse.code }}</code>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ warehouse.name }}</div>
                  <div v-if="warehouse.city || warehouse.district" class="text-sm text-gray-500">
                    {{ [warehouse.city, warehouse.district].filter(Boolean).join(', ') }}
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900">{{ warehouse.address || '—' }}</div>
                  <div v-if="warehouse.phone" class="text-sm text-gray-500">{{ warehouse.phone }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ warehouse.manager_name || '—' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ warehouse.priority || 0 }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="warehouse.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                  >
                    {{ warehouse.is_active ? 'Hoạt động' : 'Không hoạt động' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Actions
                      :item="warehouse"
                      :show-view="false"
                      :show-delete="false"
                      @edit="openEditModal"
                      :additional-actions="[
                        {
                          label: 'Xem tồn kho',
                          action: () => viewInventory(warehouse),
                          icon: 'box'
                        },
                        {
                          label: 'Xóa',
                          action: () => confirmDelete(warehouse),
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
      :api-errors="apiErrors"
      :on-close="closeCreateModal"
      :on-created="handleWarehouseCreated"
    >
      <CreateWarehouse
        v-if="modals.create"
        :show="modals.create"
        :api-errors="apiErrors"
        :on-close="closeCreateModal"
        @created="handleWarehouseCreated"
      />
    </slot>

    <!-- Edit Modal (slot) -->
    <slot
      name="edit-modal"
      :modals="modals"
      :warehouse="selectedItem"
      :api-errors="apiErrors"
      :on-close="closeEditModal"
      :on-updated="handleWarehouseUpdated"
    >
      <EditWarehouse
        v-if="modals.edit"
        :show="modals.edit"
        :warehouse="selectedItem"
        :api-errors="apiErrors"
        :on-close="closeEditModal"
        @updated="handleWarehouseUpdated"
      />
    </slot>

    <!-- Delete Modal (slot) -->
    <slot
      name="delete-modal"
      :modals="modals"
      :warehouse="selectedItem"
      :on-close="closeDeleteModal"
      :on-confirm="deleteWarehouse"
    >
      <ConfirmModal
        v-if="modals.delete"
        :show="modals.delete"
        title="Xác nhận xóa"
        :message="`Bạn có chắc chắn muốn xóa kho ${selectedItem?.name || ''}?`"
        :on-close="closeDeleteModal"
        @confirm="deleteWarehouse"
      />
    </slot>
  </div>
</template>

<script setup lang="ts">
// Vue
import { ref, computed, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'

// Composables
import { useAdminListPage } from '@/composables/admin'
import { useGlobalApiClient } from '@/composables/api'
import { adminEndpoints } from '@/api/endpoints'

// Components
import SkeletonLoader from '@/components/Core/Loading/SkeletonLoader.vue'
import ConfirmModal from '@/components/Core/Modal/ConfirmModal.vue'
import Actions from '@/components/Core/Actions/Actions.vue'
import Pagination from '@/components/Core/Navigation/Pagination.vue'
import WarehousesFilter from './WarehousesFilter.vue'

// Props
interface Props {
  title?: string
  createButtonText?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Quản lý kho hàng',
  createButtonText: 'Thêm kho mới'
})

// Emits
const emit = defineEmits<{
  created: [warehouse: any]
  updated: [warehouse: any]
  deleted: [id: string | number]
}>()

// Lazy load components
const CreateWarehouse = defineAsyncComponent(() => import('./CreateWarehouse.vue'))
const EditWarehouse = defineAsyncComponent(() => import('./EditWarehouse.vue'))

const router = useRouter()

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
  refresh,
  clearApiErrors,
  getSerialNumber,
  showSuccess,
  showError
} = useAdminListPage({
  endpoints: {
    list: adminEndpoints.warehouses.list,
    create: adminEndpoints.warehouses.create,
    update: (id) => adminEndpoints.warehouses.update(id),
    delete: (id) => adminEndpoints.warehouses.delete(id)
  },
  defaults: {
    title: props.title,
    createButtonText: props.createButtonText
  },
  messages: {
    createSuccess: 'Kho hàng đã được tạo thành công',
    createError: 'Không thể tạo kho hàng',
    updateSuccess: 'Kho hàng đã được cập nhật thành công',
    updateError: 'Không thể cập nhật kho hàng',
    deleteSuccess: 'Kho hàng đã được xóa thành công',
    deleteError: 'Không thể xóa kho hàng'
  },
  onCreated: (item) => emit('created', item),
  onUpdated: (item) => emit('updated', item),
  onDeleted: (id) => emit('deleted', id)
})

const { apiClient } = useGlobalApiClient()

async function handleFilterUpdate(newFilters: any) {
  await updateFilters(newFilters)
}

async function handleWarehouseCreated(warehouseData: any) {
  apiErrors.value = null
  try {
    const response = await apiClient.post(adminEndpoints.warehouses.create, warehouseData)
    if (response.data?.success) {
      showSuccess(response.data?.message || 'Kho hàng đã được tạo thành công')
      closeCreateModal()
      await refresh()
      emit('created', warehouseData)
    } else {
      apiErrors.value = response.data?.errors || null
      showError(response.data?.message || 'Không thể tạo kho hàng')
    }
  } catch (error: any) {
    apiErrors.value = error.response?.data?.errors || error.response?.data || null
    showError('Không thể tạo kho hàng')
  }
}

async function handleWarehouseUpdated(warehouseData: any) {
  if (!selectedItem.value) return

  apiErrors.value = null
  try {
    const response = await apiClient.put(adminEndpoints.warehouses.update(selectedItem.value.id), warehouseData)
    if (response.data?.success) {
      showSuccess(response.data?.message || 'Kho hàng đã được cập nhật thành công')
      closeEditModal()
      await refresh()
      emit('updated', warehouseData)
    } else {
      apiErrors.value = response.data?.errors || null
      showError(response.data?.message || 'Không thể cập nhật kho hàng')
    }
  } catch (error: any) {
    apiErrors.value = error.response?.data?.errors || error.response?.data || null
    showError('Không thể cập nhật kho hàng')
  }
}

async function deleteWarehouse() {
  if (!selectedItem.value) return
  try {
    const response = await apiClient.delete(adminEndpoints.warehouses.delete(selectedItem.value.id))
    if (response.data?.success) {
      showSuccess(response.data?.message || 'Kho hàng đã được xóa thành công')
      closeDeleteModal()
      await refresh()
      emit('deleted', selectedItem.value.id)
    } else {
      showError(response.data?.message || 'Không thể xóa kho hàng')
    }
  } catch (error) {
    showError('Không thể xóa kho hàng')
  }
}

function viewInventory(warehouse: any) {
  router.push(`/admin/warehouses/${warehouse.id}/inventory`)
}

function handlePageChange(page: number) {
  changePage(page)
}
</script>

<style scoped>
.table-responsive {
  overflow-x: auto;
}
</style>

