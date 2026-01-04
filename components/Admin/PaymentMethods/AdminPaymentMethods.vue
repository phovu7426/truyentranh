<template>
  <div class="admin-payment-methods">
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
      :on-update="handleFilterUpdate"
    >
      <!-- Default filter -->
      <PaymentMethodsFilter
        :initial-filters="filters"
        :status-enums="statusEnums"
        @update:filters="handleFilterUpdate"
      />
    </slot>

    <!-- Table (allow override via slot) -->
    <slot
      name="table"
      :items="items"
      :loading="loading"
      :get-serial-number="getSerialNumber"
      :get-status-label="getStatusLabel"
      :get-status-class="getStatusClass"
      :on-edit="openEditModal"
      :on-delete="confirmDelete"
    >
      <!-- Default table -->
      <div class="bg-white shadow-md rounded-lg overflow-hidden">
        <SkeletonLoader v-if="loading" type="table" :rows="5" :columns="6" />
        <div v-else class="table-responsive">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã code</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nhà cung cấp</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(item, index) in items" :key="item.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ getSerialNumber(index) }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ item.name }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <code class="px-2 py-1 bg-gray-100 rounded text-xs">{{ item.code }}</code>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ item.provider || '—' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" 
                    :class="getStatusClass(item.status)"
                  >
                    {{ getStatusLabel(item.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Actions
                    :item="item"
                    :show-view="false"
                    :show-delete="false"
                    @edit="openEditModal"
                    :additional-actions="[
                      {
                        label: 'Xóa',
                        action: () => confirmDelete(item),
                        icon: 'trash'
                      }
                    ]"
                  />
                </td>
              </tr>
              <tr v-if="items.length === 0">
                <td colspan="6" class="px-6 py-4 text-center text-gray-500">
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
      v-if="items.length > 0"
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
      :status-enums="statusEnums"
      :api-errors="apiErrors"
      :on-close="closeCreateModal"
      :on-created="handleItemCreated"
    >
      <CreatePaymentMethod
        v-if="modals.create"
        :show="modals.create"
        :status-enums="statusEnums"
        :api-errors="apiErrors"
        :on-close="closeCreateModal"
        @created="handleItemCreated"
      />
    </slot>

    <!-- Edit Modal (slot) -->
    <slot
      name="edit-modal"
      :modals="modals"
      :item="selectedItem"
      :status-enums="statusEnums"
      :api-errors="apiErrors"
      :on-close="closeEditModal"
      :on-updated="handleItemUpdated"
    >
      <EditPaymentMethod
        v-if="modals.edit"
        :show="modals.edit"
        :item="selectedItem"
        :status-enums="statusEnums"
        :api-errors="apiErrors"
        :on-close="closeEditModal"
        @updated="handleItemUpdated"
      />
    </slot>

    <!-- Delete Modal (slot) -->
    <slot
      name="delete-modal"
      :modals="modals"
      :item="selectedItem"
      :on-close="closeDeleteModal"
      :on-confirm="deleteItemHandler"
    >
      <ConfirmModal
        v-if="modals.delete"
        :show="modals.delete"
        title="Xác nhận xóa"
        :message="`Bạn có chắc chắn muốn xóa phương thức thanh toán ${selectedItem?.name || ''}?`"
        :on-close="closeDeleteModal"
        @confirm="deleteItemHandler"
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

// Components
import SkeletonLoader from '@/components/Core/Loading/SkeletonLoader.vue'
import ConfirmModal from '@/components/Core/Modal/ConfirmModal.vue'
import Actions from '@/components/Core/Actions/Actions.vue'
import Pagination from '@/components/Core/Navigation/Pagination.vue'
import PaymentMethodsFilter from './PaymentMethodsFilter.vue'

// Props
interface Props {
  title?: string
  createButtonText?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Quản lý phương thức thanh toán',
  createButtonText: 'Thêm phương thức thanh toán mới'
})

// Emits
const emit = defineEmits<{
  created: [item: any]
  updated: [item: any]
  deleted: [id: string | number]
}>()

// Lazy load components
const CreatePaymentMethod = defineAsyncComponent(() => import('./CreatePaymentMethod.vue'))
const EditPaymentMethod = defineAsyncComponent(() => import('./EditPaymentMethod.vue'))

// Use admin list page composable
const {
  items,
  loading,
  pagination,
  filters,
  apiErrors,
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
  showSuccess,
  showError
} = useAdminListPage({
  endpoints: {
    list: adminEndpoints.paymentMethods.list,
    create: adminEndpoints.paymentMethods.create,
    update: (id) => adminEndpoints.paymentMethods.update(id),
    delete: (id) => adminEndpoints.paymentMethods.delete(id),
    show: (id) => adminEndpoints.paymentMethods.show(id)
  },
  defaults: {
    title: props.title,
    createButtonText: props.createButtonText
  },
  messages: {
    createSuccess: 'Phương thức thanh toán đã được tạo thành công',
    createError: 'Không thể tạo phương thức thanh toán',
    updateSuccess: 'Phương thức thanh toán đã được cập nhật thành công',
    updateError: 'Không thể cập nhật phương thức thanh toán',
    deleteSuccess: 'Phương thức thanh toán đã được xóa thành công',
    deleteError: 'Không thể xóa phương thức thanh toán'
  },
  fetchDetailBeforeEdit: true,
  onCreated: (item) => emit('created', item),
  onUpdated: (item) => emit('updated', item),
  onDeleted: (id) => emit('deleted', id)
})

const { apiClient } = useGlobalApiClient()
const statusEnums = ref([])

onMounted(() => {
  fetchEnums()
})

async function fetchEnums() {
  try {
    const response = await apiClient.get(adminEndpoints.enums.byName('basic_status'))
    if (response.data?.success) {
      statusEnums.value = response.data.data || []
    } else {
      statusEnums.value = [
        { value: 'active', label: 'Hoạt động' },
        { value: 'inactive', label: 'Không hoạt động' }
      ]
    }
  } catch (e) {
    statusEnums.value = [
      { value: 'active', label: 'Hoạt động' },
      { value: 'inactive', label: 'Không hoạt động' }
    ]
  }
}

async function handleFilterUpdate(newFilters: any) {
  await updateFilters(newFilters)
}

async function handleItemCreated(itemData: any) {
  await handleCreate(itemData)
}

async function handleItemUpdated(itemData: any) {
  if (!selectedItem.value) return
  await handleUpdate(selectedItem.value.id, itemData)
}

async function deleteItemHandler() {
  if (!selectedItem.value) return
  await handleDelete(selectedItem.value.id)
}

function handlePageChange(page: number) {
  changePage(page)
}

function getStatusClass(status: string) {
  const found = (statusEnums.value as any[]).find(s => s.value === status)
  return found?.class || found?.badge_class || found?.color_class || (status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800')
}

function getStatusLabel(status: string) {
  const found = (statusEnums.value as any[]).find(s => s.value === status)
  return found?.label || status || 'Không xác định'
}
</script>

<style scoped>
.table-responsive {
  overflow-x: auto;
}
</style>

