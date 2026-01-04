<template>
  <div class="admin-banner-locations">
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
      <BannerLocationsFilter
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
      :on-toggle-status="toggleStatus"
      :on-restore="restoreLocation"
    >
      <!-- Default table -->
      <div class="bg-white shadow-md rounded-lg overflow-hidden">
        <SkeletonLoader v-if="loading" type="table" :rows="5" :columns="5" />
        <table v-else class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã vị trí</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên vị trí</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(location, index) in items" :key="location.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ getSerialNumber(index) }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                  {{ location.code }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ location.name }}</div>
                <div class="text-sm text-gray-500">{{ location.description || '—' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex flex-col space-y-1">
                  <span
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="getStatusClass(location.status)"
                  >
                    {{ getStatusLabel(location.status) }}
                  </span>
                  <div v-if="location.deleted_at" class="text-xs text-red-600">
                    Đã xóa
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <Actions
                    :item="location"
                    :show-view="false"
                    :show-delete="false"
                    @edit="openEditModal"
                    :additional-actions="[
                      {
                        label: location.status === 'active' ? 'Vô hiệu hóa' : 'Kích hoạt',
                        action: () => toggleStatus(location),
                        icon: location.status === 'active' ? 'eye-off' : 'eye'
                      },
                      {
                        label: location.deleted_at ? 'Khôi phục' : 'Xóa',
                        action: () => location.deleted_at ? restoreLocation(location) : confirmDelete(location),
                        icon: location.deleted_at ? 'refresh' : 'trash'
                      }
                    ]"
                  />
              </td>
            </tr>
            <tr v-if="items.length === 0">
              <td colspan="5" class="px-6 py-4 text-center text-gray-500">
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
      :status-enums="statusEnums"
      :api-errors="apiErrors"
      :on-close="closeCreateModal"
      :on-created="handleLocationCreated"
    >
      <CreateBannerLocation
        v-if="modals.create"
        :show="modals.create"
        :status-enums="statusEnums"
        :api-errors="apiErrors"
        :on-close="closeCreateModal"
        @created="handleLocationCreated"
      />
    </slot>

    <!-- Edit Modal (slot) -->
    <slot
      name="edit-modal"
      :modals="modals"
      :location-id="selectedItem?.id"
      :status-enums="statusEnums"
      :api-errors="apiErrors"
      :on-close="closeEditModal"
      :on-updated="handleLocationUpdated"
    >
      <EditBannerLocation
        v-if="modals.edit"
        :show="modals.edit"
        :location-id="selectedItem?.id"
        :status-enums="statusEnums"
        :api-errors="apiErrors"
        :on-close="closeEditModal"
        @updated="handleLocationUpdated"
      />
    </slot>

    <!-- Delete Modal (slot) -->
    <slot
      name="delete-modal"
      :modals="modals"
      :location="selectedItem"
      :on-close="closeDeleteModal"
      :on-confirm="deleteLocation"
    >
      <ConfirmModal
        v-if="modals.delete"
        :show="modals.delete"
        title="Xác nhận xóa"
        :message="`Bạn có chắc chắn muốn xóa vị trí banner ${selectedItem?.name || ''}?`"
        :on-close="closeDeleteModal"
        @confirm="deleteLocation"
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
import BannerLocationsFilter from './BannerLocationsFilter.vue'

// Props
interface Props {
  title?: string
  createButtonText?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Quản lý vị trí banner',
  createButtonText: 'Thêm vị trí mới'
})

// Emits
const emit = defineEmits<{
  created: [location: any]
  updated: [location: any]
  deleted: [id: string | number]
}>()

// Lazy load components
const CreateBannerLocation = defineAsyncComponent(() => import('./CreateBannerLocation.vue'))
const EditBannerLocation = defineAsyncComponent(() => import('./EditBannerLocation.vue'))

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
  handleCreate,
  handleUpdate,
  handleDelete,
  getSerialNumber,
  showSuccess,
  showError
} = useAdminListPage({
  endpoints: {
    list: adminEndpoints.bannerLocations.list,
    create: adminEndpoints.bannerLocations.create,
    update: (id) => adminEndpoints.bannerLocations.update(id),
    delete: (id) => adminEndpoints.bannerLocations.delete(id)
  },
  defaults: {
    title: props.title,
    createButtonText: props.createButtonText
  },
  messages: {
    createSuccess: 'Vị trí banner đã được tạo thành công',
    createError: 'Không thể tạo vị trí banner',
    updateSuccess: 'Vị trí banner đã được cập nhật thành công',
    updateError: 'Không thể cập nhật vị trí banner',
    deleteSuccess: 'Vị trí banner đã được xóa thành công',
    deleteError: 'Không thể xóa vị trí banner'
  },
  onCreated: (item) => emit('created', item),
  onUpdated: (item) => emit('updated', item),
  onDeleted: (id) => emit('deleted', id)
})

const { apiClient } = useGlobalApiClient()

const statusEnums = ref([])
const enumsLoaded = ref(false)

onMounted(async () => {
  if (!enumsLoaded.value) {
    await fetchStatusEnums()
    enumsLoaded.value = true
  }
})

async function fetchStatusEnums() {
  try {
    const response = await apiClient.get(adminEndpoints.enums.byName('basic_status'))
    if (response.data?.success) {
      statusEnums.value = response.data.data || []
    } else {
      statusEnums.value = []
    }
  } catch (error) {
    statusEnums.value = []
  }
}

async function handleFilterUpdate(newFilters: any) {
  await updateFilters(newFilters)
}

async function handleLocationCreated(data: any) {
  await handleCreate(data)
}

async function handleLocationUpdated(data: any) {
  if (!selectedItem.value) return
  await handleUpdate(selectedItem.value.id, data)
}

async function deleteLocation() {
  if (!selectedItem.value) return
  await handleDelete(selectedItem.value.id)
}

async function toggleStatus(location: any) {
  try {
    const newStatus = location.status === 'active' ? 'inactive' : 'active'
    const response = await apiClient.patch(adminEndpoints.bannerLocations.updateStatus(location.id), {
      status: newStatus
    })
    if (response.data?.success) {
      showSuccess(`Đã ${newStatus === 'active' ? 'kích hoạt' : 'vô hiệu hóa'} vị trí banner`)
      refresh()
    } else {
      showError('Không thể cập nhật trạng thái vị trí banner')
    }
  } catch (error) {
    showError('Không thể cập nhật trạng thái vị trí banner')
  }
}

async function restoreLocation(location: any) {
  try {
    const response = await apiClient.put(adminEndpoints.bannerLocations.restore(location.id))
    if (response.data?.success) {
      showSuccess('Vị trí banner đã được khôi phục thành công')
      refresh()
    } else {
      showError('Không thể khôi phục vị trí banner')
    }
  } catch (error) {
    showError('Không thể khôi phục vị trí banner')
  }
}

function handlePageChange(page: number) {
  changePage(page)
}

function getStatusLabel(status: string) {
  const found = (statusEnums.value as any[]).find(s => s.value === status)
  return found?.label || status || 'Không xác định'
}

function getStatusClass(status: string) {
  const found = (statusEnums.value as any[]).find(s => s.value === status)
  return found?.class || found?.badge_class || found?.color_class || 'bg-gray-100 text-gray-800'
}
</script>

<style scoped>
.table-responsive {
  overflow-x: auto;
}
</style>

