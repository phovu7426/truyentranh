<template>
  <div class="admin-permissions">
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
      <PermissionsFilter
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
        <SkeletonLoader v-if="loading" type="table" :rows="5" :columns="5" />
        <table v-else class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã code</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên quyền</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phạm vi</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(permission, index) in items" :key="permission.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ getSerialNumber(index) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                <code class="px-2 py-1 bg-gray-100 rounded text-xs">{{ permission.code }}</code>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ permission.name || '—' }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="permission.scope === 'system' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'"
                >
                  {{ permission.scope === 'system' ? 'System' : 'Context' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" 
                  :class="getStatusClass(permission.status)"
                >
                  {{ getStatusLabel(permission.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <Actions 
                  v-if="!permission.has_children"
                  :item="permission"
                  @edit="openEditModal"
                  @delete="confirmDelete"
                />
                <span v-if="permission.has_children" class="text-gray-500 text-sm">
                  Không thể sửa/xóa (có {{ permission.children_count }} quyền con)
                </span>
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
      :on-created="handlePermissionCreated"
    >
      <CreatePermission
        v-if="modals.create"
        :show="modals.create"
        :status-enums="statusEnums"
        :api-errors="apiErrors"
        :on-close="closeCreateModal"
        @created="handlePermissionCreated"
      />
    </slot>

    <!-- Edit Modal (slot) -->
    <slot
      name="edit-modal"
      :modals="modals"
      :permission="selectedPermission"
      :status-enums="statusEnums"
      :api-errors="apiErrors"
      :on-close="closeEditModal"
      :on-updated="handlePermissionUpdated"
    >
      <EditPermission
        v-if="modals.edit"
        :show="modals.edit"
        :permission="selectedPermission"
        :status-enums="statusEnums"
        :api-errors="apiErrors"
        :on-close="closeEditModal"
        @updated="handlePermissionUpdated"
      />
    </slot>

    <!-- Delete Modal (slot) -->
    <slot
      name="delete-modal"
      :modals="modals"
      :permission="selectedPermission"
      :on-close="closeDeleteModal"
      :on-confirm="deletePermission"
    >
      <ConfirmModal
        v-if="modals.delete"
        :show="modals.delete"
        title="Xác nhận xóa"
        :message="`Bạn có chắc chắn muốn xóa quyền ${selectedPermission?.name || selectedPermission?.code || ''}?`"
        :on-close="closeDeleteModal"
        @confirm="deletePermission"
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
import PermissionsFilter from './PermissionsFilter.vue'

// Props
interface Props {
  title?: string
  createButtonText?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Quản lý quyền',
  createButtonText: 'Thêm quyền mới'
})

// Emits
const emit = defineEmits<{
  created: [permission: any]
  updated: [permission: any]
  deleted: [id: string | number]
}>()

// Lazy load components
const CreatePermission = defineAsyncComponent(() => import('./CreatePermission.vue'))
const EditPermission = defineAsyncComponent(() => import('./EditPermission.vue'))

// Use admin list page composable
const {
  items,
  loading,
  pagination,
  filters,
  apiErrors,
  hasData,
  modals,
  selectedItem: selectedPermission,
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
    list: adminEndpoints.permissions.list,
    create: adminEndpoints.permissions.create,
    update: (id) => adminEndpoints.permissions.update(id),
    delete: (id) => adminEndpoints.permissions.delete(id)
  },
  defaults: {
    title: props.title,
    createButtonText: props.createButtonText
  },
  messages: {
    createSuccess: 'Quyền đã được tạo thành công',
    createError: 'Không thể tạo quyền',
    updateSuccess: 'Quyền đã được cập nhật thành công',
    updateError: 'Không thể cập nhật quyền',
    deleteSuccess: 'Quyền đã được xóa thành công',
    deleteError: 'Không thể xóa quyền'
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

async function handlePermissionCreated(permissionData: any) {
  await handleCreate(permissionData)
}

async function handlePermissionUpdated(permissionData: any) {
  if (!selectedPermission.value) return
  await handleUpdate(selectedPermission.value.id, permissionData)
}

async function deletePermission() {
  if (!selectedPermission.value) return
  await handleDelete(selectedPermission.value.id)
}

function handlePageChange(page: number) {
  changePage(page)
}

function getStatusLabel(status: string) {
  const list = statusEnums.value as any[]
  const found = list.find(it => it.value === status || it.id === status)
  return found?.label || found?.name || status || 'Không xác định'
}

function getStatusClass(status: string) {
  const list = statusEnums.value as any[]
  const found = list.find(s => s.value === status)
  return found?.class || found?.badge_class || found?.color_class || 'bg-gray-100 text-gray-800'
}
</script>

<style scoped>
.table-responsive {
  overflow-x: auto;
}
</style>

