<template>
  <div class="admin-users">
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
      <UsersFilter
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
      :on-edit="openEditModal"
      :on-delete="confirmDelete"
      :on-change-password="openChangePasswordModal"
      :on-assign-role="openAssignRoleModal"
    >
      <!-- Default table -->
      <div class="bg-white shadow-md rounded-lg overflow-hidden">
        <SkeletonLoader v-if="loading" type="table" :rows="5" :columns="5" />
        <div v-else class="table-responsive">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên đăng nhập</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số điện thoại</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(user, index) in items" :key="user.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ getSerialNumber(index) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ user.username || 'N/A' }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.email }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.phone || 'N/A' }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800"
                  >
                    {{ getStatusLabel(user.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Actions 
                    :item="user"
                    @edit="openEditModal"
                    @delete="confirmDelete"
                  >
                    <template #custom="{ item }">
                      <button 
                        @click="openChangePasswordModal(item)" 
                        class="p-2 rounded-full hover:bg-blue-100 transition-colors duration-200"
                        title="Đổi mật khẩu"
                      >
                        <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                        </svg>
                      </button>
                      <button 
                        @click="openAssignRoleModal(item)" 
                        class="p-2 rounded-full hover:bg-green-100 transition-colors duration-200"
                        title="Phân quyền"
                      >
                        <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </button>
                    </template>
                  </Actions>
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
      :gender-enums="genderEnums"
      :role-enums="roleEnums"
      :api-errors="apiErrors"
      :on-close="closeCreateModal"
      :on-created="handleUserCreated"
    >
      <CreateUser
        v-if="modals.create"
        :show="modals.create"
        :status-enums="statusEnums"
        :gender-enums="genderEnums"
        :role-enums="roleEnums"
        :api-errors="apiErrors"
        @close="closeCreateModal"
        @created="handleUserCreated"
      />
    </slot>

    <!-- Edit Modal (slot) -->
    <slot
      name="edit-modal"
      :modals="modals"
      :user="selectedUser"
      :status-enums="statusEnums"
      :gender-enums="genderEnums"
      :role-enums="roleEnums"
      :api-errors="apiErrors"
      :on-close="closeEditModal"
      :on-updated="handleUserUpdated"
    >
      <EditUser
        v-if="modals.edit"
        :show="modals.edit"
        :user="selectedUser"
        :status-enums="statusEnums"
        :gender-enums="genderEnums"
        :role-enums="roleEnums"
        :api-errors="apiErrors"
        @close="closeEditModal"
        @updated="handleUserUpdated"
      />
    </slot>

    <!-- Change Password Modal (slot) -->
    <slot
      name="change-password-modal"
      :show="showChangePasswordModal"
      :user="selectedUser"
      :on-close="closeChangePasswordModal"
      :on-password-changed="handlePasswordChanged"
    >
      <ChangePassword
        v-if="showChangePasswordModal"
        :show="showChangePasswordModal"
        :user="selectedUser"
        @close="closeChangePasswordModal"
        @password-changed="handlePasswordChanged"
      />
    </slot>

    <!-- Assign Role Modal (slot) -->
    <slot
      name="assign-role-modal"
      :show="showAssignRoleModal"
      :user="selectedUser"
      :on-close="closeAssignRoleModal"
      :on-role-assigned="handleRoleAssigned"
    >
      <AssignRole
        v-if="showAssignRoleModal"
        :show="showAssignRoleModal"
        :user="selectedUser"
        @close="closeAssignRoleModal"
        @role-assigned="handleRoleAssigned"
      />
    </slot>

    <!-- Delete Modal (slot) -->
    <slot
      name="delete-modal"
      :modals="modals"
      :user="selectedUser"
      :on-close="closeDeleteModal"
      :on-confirm="deleteUser"
    >
      <ConfirmModal
        v-if="modals.delete"
        :show="modals.delete"
        title="Xác nhận xóa"
        :message="`Bạn có chắc chắn muốn xóa người dùng ${selectedUser?.username || ''}?`"
        :on-close="closeDeleteModal"
        @confirm="deleteUser"
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
import UsersFilter from './UsersFilter.vue'

// Props
interface Props {
  title?: string
  createButtonText?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Quản lý người dùng',
  createButtonText: 'Thêm người dùng mới'
})

// Emits
const emit = defineEmits<{
  created: [user: any]
  updated: [user: any]
  deleted: [id: string | number]
}>()

// Lazy load components
const CreateUser = defineAsyncComponent(() => import('./CreateUser.vue'))
const EditUser = defineAsyncComponent(() => import('./EditUser.vue'))
const ChangePassword = defineAsyncComponent(() => import('./ChangePassword.vue'))
const AssignRole = defineAsyncComponent(() => import('./AssignRole.vue'))

// Use admin list page composable
const {
  items,
  loading,
  pagination,
  filters,
  apiErrors,
  modals,
  selectedItem: selectedUser,
  openCreateModal,
  closeCreateModal,
  openEditModal,
  closeEditModal,
  openDeleteModal: confirmDelete,
  closeDeleteModal,
  updateFilters,
  changePage,
  clearApiErrors,
  handleCreate: handleCreateBase,
  handleUpdate: handleUpdateBase,
  handleDelete: handleDeleteBase,
  getSerialNumber,
  showSuccess,
  showError
} = useAdminListPage({
  endpoints: {
    list: adminEndpoints.users.list,
    create: adminEndpoints.users.create,
    update: (id) => adminEndpoints.users.update(id),
    delete: (id) => adminEndpoints.users.delete(id)
  },
  defaults: {
    title: props.title,
    createButtonText: props.createButtonText
  },
  transformItem: (user: any) => ({
    ...user,
    fullName: `${user.first_name || ''} ${user.last_name || ''}`.trim()
  }),
  messages: {
    createSuccess: 'Người dùng đã được tạo thành công',
    createError: 'Không thể tạo người dùng',
    updateSuccess: 'Người dùng đã được cập nhật thành công',
    updateError: 'Không thể cập nhật người dùng',
    deleteSuccess: 'Người dùng đã được xóa thành công',
    deleteError: 'Không thể xóa người dùng'
  },
  onCreated: (item) => emit('created', item),
  onUpdated: (item) => emit('updated', item),
  onDeleted: (id) => emit('deleted', id)
})

const { apiClient } = useGlobalApiClient()

// State
const roleEnums = ref([])
const statusEnums = ref([])
const genderEnums = ref([])
const showChangePasswordModal = ref(false)
const showAssignRoleModal = ref(false)

const enumsLoaded = ref(false)

onMounted(async () => {
  if (!enumsLoaded.value) {
    await loadEnums()
    enumsLoaded.value = true
  }
})

async function handleFilterUpdate(newFilters: any) {
  await updateFilters(newFilters)
}

async function loadEnums() {
  try {
    const response = await apiClient.get(adminEndpoints.enums.byName('user_status'))
    if (response.data?.success) {
      statusEnums.value = response.data.data || []
    }
  } catch (e) {
    statusEnums.value = []
  }

  try {
    const response = await apiClient.get(adminEndpoints.enums.byName('gender'))
    if (response.data?.success) {
      genderEnums.value = response.data.data || []
    }
  } catch (e) {
    genderEnums.value = []
  }

  await loadRoles()
}

async function loadRoles() {
  try {
    const response = await apiClient.get(adminEndpoints.roles.list + '?limit=1000')
    if (response.data?.success) {
      const roles = response.data.data || []
      roleEnums.value = roles.map((role: any) => ({
        value: role.id,
        label: role.name || role.code
      }))
    }
  } catch (error) {
    showError('Không thể tải danh sách vai trò')
  }
}

function openChangePasswordModal(user: any) {
  selectedUser.value = user
  showChangePasswordModal.value = true
}

function closeChangePasswordModal() {
  showChangePasswordModal.value = false
  selectedUser.value = null
}

async function openAssignRoleModal(user: any) {
  selectedUser.value = user
  
  if (roleEnums.value.length === 0) {
    await loadRoles()
  }
  
  showAssignRoleModal.value = true
}

function closeAssignRoleModal() {
  showAssignRoleModal.value = false
  selectedUser.value = null
}

async function handleUserCreated(userData: any) {
  await handleCreateBase(userData)
}

async function handleUserUpdated(userData: any) {
  if (!selectedUser.value) return
  // Users component uses PATCH instead of PUT
  try {
    loading.value = true
    apiErrors.value = null
    
    const endpoint = adminEndpoints.users.update(selectedUser.value.id)
    const response = await apiClient.patch(endpoint, userData)
    const updatedItem = response.data?.data || response.data
    
    const index = items.value.findIndex((item: any) => item.id === selectedUser.value.id)
    if (index !== -1) {
      items.value = [
        ...items.value.slice(0, index),
        updatedItem,
        ...items.value.slice(index + 1)
      ]
    }
    
    showSuccess('Người dùng đã được cập nhật thành công')
    closeEditModal()
    emit('updated', updatedItem)
  } catch (err: any) {
    apiErrors.value = err.response?.data || err
    showError('Không thể cập nhật người dùng')
  } finally {
    loading.value = false
  }
}

async function handlePasswordChanged() {
  closeChangePasswordModal()
  showSuccess('Mật khẩu đã được thay đổi thành công')
}

async function handleRoleAssigned() {
  closeAssignRoleModal()
  showSuccess('Vai trò đã được phân công thành công')
}

async function deleteUser() {
  if (!selectedUser.value) return
  await handleDeleteBase(selectedUser.value.id)
}

function handlePageChange(page: number) {
  changePage(page)
}

function getStatusLabel(status: string) {
  const list = statusEnums.value as any[]
  const found = list.find(it => it.value === status || it.id === status)
  return found?.label || found?.name || status || 'Không xác định'
}
</script>

<style scoped>
.table-responsive {
  overflow-x: auto;
}
</style>

