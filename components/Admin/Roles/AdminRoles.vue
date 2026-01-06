<template>
  <div class="admin-roles">
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
      <RolesFilter
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
      :on-assign-permissions="openAssignPermissionsModal"
    >
      <!-- Default table -->
      <div class="bg-white shadow-md rounded-lg overflow-hidden">
        <SkeletonLoader v-if="loading" type="table" :rows="5" :columns="5" />
        <table v-else class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã code</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên vai trò</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(role, index) in items" :key="role.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ getSerialNumber(index) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                <code class="px-2 py-1 bg-gray-100 rounded text-xs">{{ role.code }}</code>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ role.name || '—' }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" 
                  :class="getStatusClass(role.status)"
                >
                  {{ getStatusLabel(role.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <Actions 
                  :item="role"
                  :show-view="false"
                  :show-delete="false"
                  @edit="openEditModal"
                  :additional-actions="[
                    {
                      label: 'Gán quyền',
                      action: () => openAssignPermissionsModal(role),
                      icon: 'key'
                    },
                    {
                      label: 'Xóa',
                      action: () => confirmDelete(role),
                      icon: 'trash'
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
      :on-created="handleRoleCreated"
    >
      <CreateRole
        v-if="modals.create"
        :show="modals.create"
        :status-enums="statusEnums"
        :api-errors="apiErrors"
        @close="closeCreateModal"
        @created="handleRoleCreated"
      />
    </slot>

    <!-- Edit Modal (slot) -->
    <slot
      name="edit-modal"
      :modals="modals"
      :role="selectedRole"
      :status-enums="statusEnums"
      :api-errors="apiErrors"
      :on-close="closeEditModal"
      :on-updated="handleRoleUpdated"
    >
      <EditRole
        v-if="modals.edit"
        :show="modals.edit"
        :role="selectedRole"
        :status-enums="statusEnums"
        :api-errors="apiErrors"
        @close="closeEditModal"
        @updated="handleRoleUpdated"
      />
    </slot>

    <!-- Assign Permissions Modal (slot) -->
    <slot
      name="assign-permissions-modal"
      :modals="modals"
      :role="selectedRole"
      :on-close="closeAssignPermissionsModal"
      :on-permissions-assigned="handlePermissionsAssigned"
    >
      <AssignPermissions
        v-if="modals.assignPermissions"
        :show="modals.assignPermissions"
        :role="selectedRole"
        @close="closeAssignPermissionsModal"
        @permissions-assigned="handlePermissionsAssigned"
      />
    </slot>

    <!-- Delete Modal (slot) -->
    <slot
      name="delete-modal"
      :modals="modals"
      :role="selectedRole"
      :on-close="closeDeleteModal"
      :on-confirm="deleteRole"
    >
      <ConfirmModal
        v-if="modals.delete"
        :show="modals.delete"
        title="Xác nhận xóa"
        :message="`Bạn có chắc chắn muốn xóa vai trò ${selectedRole?.name || selectedRole?.code || ''}?`"
        :on-close="closeDeleteModal"
        @confirm="deleteRole"
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
import RolesFilter from './RolesFilter.vue'

// Props
interface Props {
  title?: string
  createButtonText?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Quản lý vai trò',
  createButtonText: 'Thêm vai trò mới'
})

// Emits
const emit = defineEmits<{
  created: [role: any]
  updated: [role: any]
  deleted: [id: string | number]
}>()

// Lazy load components
const CreateRole = defineAsyncComponent(() => import('./CreateRole.vue'))
const EditRole = defineAsyncComponent(() => import('./EditRole.vue'))
const AssignPermissions = defineAsyncComponent(() => import('./AssignPermissions.vue'))

// Use admin list page composable
const {
  items,
  loading,
  pagination,
  filters,
  apiErrors,
  modals,
  selectedItem: selectedRole,
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
    list: adminEndpoints.roles.list,
    create: adminEndpoints.roles.create,
    update: (id) => adminEndpoints.roles.update(id),
    delete: (id) => adminEndpoints.roles.delete(id),
    show: (id) => adminEndpoints.roles.show(id)
  },
  defaults: {
    title: props.title,
    createButtonText: props.createButtonText
  },
  messages: {
    createSuccess: 'Vai trò đã được tạo thành công',
    createError: 'Không thể tạo vai trò',
    updateSuccess: 'Vai trò đã được cập nhật thành công',
    updateError: 'Không thể cập nhật vai trò',
    deleteSuccess: 'Vai trò đã được xóa thành công',
    deleteError: 'Không thể xóa vai trò'
  },
  fetchDetailBeforeEdit: true,
  customModals: ['assignPermissions'],
  onCreated: (item) => emit('created', item),
  onUpdated: (item) => emit('updated', item),
  onDeleted: (id) => emit('deleted', id)
})

const { apiClient } = useGlobalApiClient()

const statusEnums = ref([])
const enumsLoaded = ref(false)

// Helper functions for custom modal
const openModal = (modalName: string, item?: any) => {
  modals.value[modalName] = true
  if (item !== undefined) {
    selectedRole.value = item
  }
  clearApiErrors()
}

const closeModal = (modalName: string) => {
  modals.value[modalName] = false
  selectedRole.value = null
  clearApiErrors()
}

const openAssignPermissionsModal = (role: any) => {
  openModal('assignPermissions', role)
}
const closeAssignPermissionsModal = () => {
  closeModal('assignPermissions')
}

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

async function handlePermissionsAssigned() {
  closeAssignPermissionsModal()
  showSuccess('Quyền đã được gán thành công')
}

async function handleRoleCreated(roleData: any) {
  await handleCreate(roleData)
}

async function handleRoleUpdated(roleData: any) {
  if (!selectedRole.value) return
  await handleUpdate(selectedRole.value.id, roleData)
}

async function deleteRole() {
  if (!selectedRole.value) return
  await handleDelete(selectedRole.value.id)
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

