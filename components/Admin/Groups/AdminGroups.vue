<template>
  <div class="admin-groups">
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
      <GroupsFilter
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
      :get-type-label="getTypeLabel"
      :get-status-label="getStatusLabel"
      :get-status-class="getStatusClass"
      :on-edit="openEditModal"
      :on-delete="confirmDelete"
      :on-navigate-members="navigateToMembers"
    >
      <div class="bg-white shadow-md rounded-lg overflow-hidden">
        <SkeletonLoader v-if="loading" type="table" :rows="5" :columns="6" />
        <table v-else class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã code</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên group</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(group, index) in items" :key="group.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ getSerialNumber(index) }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {{ getTypeLabel(group.type) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                <code class="px-2 py-1 bg-gray-100 rounded text-xs">{{ group.code }}</code>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ group.name || '—' }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" 
                  :class="getStatusClass(group.status)"
                >
                  {{ getStatusLabel(group.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <Actions 
                  :item="group"
                  :show-view="false"
                  :show-delete="false"
                  @edit="openEditModal"
                  :additional-actions="[
                    {
                      label: 'Quản lý members',
                      action: () => navigateToMembers(group.id),
                      icon: 'users'
                    },
                    {
                      label: 'Xóa',
                      action: () => confirmDelete(group),
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
      :api-errors="apiErrors"
      :on-close="closeCreateModal"
      :on-created="handleGroupCreated"
    >
      <CreateGroup
        v-if="modals.create"
        :show="modals.create"
        :api-errors="apiErrors"
        @close="closeCreateModal"
        @created="handleGroupCreated"
      />
    </slot>

    <!-- Edit Modal (slot) -->
    <slot
      name="edit-modal"
      :modals="modals"
      :group="selectedGroup"
      :api-errors="apiErrors"
      :on-close="closeEditModal"
      :on-updated="handleGroupUpdated"
    >
      <EditGroup
        v-if="modals.edit"
        :show="modals.edit"
        :group="selectedGroup"
        :api-errors="apiErrors"
        @close="closeEditModal"
        @updated="handleGroupUpdated"
      />
    </slot>

    <!-- Delete Modal (slot) -->
    <slot
      name="delete-modal"
      :modals="modals"
      :group="selectedGroup"
      :on-close="closeDeleteModal"
      :on-confirm="deleteGroup"
    >
      <ConfirmModal
        v-if="modals.delete"
        :show="modals.delete"
        title="Xác nhận xóa"
        :message="`Bạn có chắc chắn muốn xóa group ${selectedGroup?.name || selectedGroup?.code || ''}?`"
        :on-close="closeDeleteModal"
        @confirm="deleteGroup"
      />
    </slot>
  </div>
</template>

<script setup lang="ts">
// Vue
import { ref, onMounted, defineAsyncComponent } from 'vue'
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
import GroupsFilter from './GroupsFilter.vue'

// Props
interface Props {
  title?: string
  createButtonText?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Quản lý Groups',
  createButtonText: 'Thêm group mới'
})

// Emits
const emit = defineEmits<{
  created: [group: any]
  updated: [group: any]
  deleted: [id: string | number]
}>()

// Lazy load components
const CreateGroup = defineAsyncComponent(() => import('./CreateGroup.vue'))
const EditGroup = defineAsyncComponent(() => import('./EditGroup.vue'))

const router = useRouter()

// Use admin list page composable
const {
  items,
  loading,
  pagination,
  filters,
  apiErrors,
  modals,
  selectedItem: selectedGroup,
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
    list: adminEndpoints.groups.list,
    create: adminEndpoints.groups.create,
    update: (id) => adminEndpoints.groups.update(id),
    delete: (id) => adminEndpoints.groups.delete(id),
    show: (id) => adminEndpoints.groups.show(id)
  },
  defaults: {
    title: props.title,
    createButtonText: props.createButtonText
  },
  messages: {
    createSuccess: 'Group đã được tạo thành công',
    createError: 'Không thể tạo group',
    updateSuccess: 'Group đã được cập nhật thành công',
    updateError: 'Không thể cập nhật group',
    deleteSuccess: 'Group đã được xóa thành công',
    deleteError: 'Không thể xóa group'
  },
  fetchDetailBeforeEdit: true,
  onCreated: (item) => emit('created', item),
  onUpdated: (item) => emit('updated', item),
  onDeleted: (id) => emit('deleted', id)
})

const { apiClient } = useGlobalApiClient()

const statusEnums = ref([])
const enumsLoaded = ref(false)

function navigateToMembers(groupId: string | number) {
  router.push(`/admin/groups/${groupId}/members`)
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

async function handleGroupCreated(groupData: any) {
  await handleCreate(groupData)
}

async function handleGroupUpdated(groupData: any) {
  if (!selectedGroup.value) return
  await handleUpdate(selectedGroup.value.id, groupData)
}

async function deleteGroup() {
  if (!selectedGroup.value) return
  await handleDelete(selectedGroup.value.id)
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

function getTypeLabel(type: string) {
  const typeMap: Record<string, string> = {
    shop: 'Shop',
    team: 'Team',
    project: 'Project',
    department: 'Department',
    organization: 'Organization'
  }
  return typeMap[type] || type
}
</script>

<style scoped>
.table-responsive {
  overflow-x: auto;
}
</style>

