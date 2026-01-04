<template>
  <div class="admin-contexts">
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
      <ContextsFilter
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
    >
      <!-- Default table -->
      <div class="bg-white shadow-md rounded-lg overflow-hidden">
        <SkeletonLoader v-if="loading" type="table" :rows="5" :columns="6" />
        <table v-else class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(context, index) in items" :key="context.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ getSerialNumber(index) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                <code class="px-2 py-1 bg-gray-100 rounded text-xs">{{ context.id }}</code>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {{ getTypeLabel(context.type) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ context.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" 
                  :class="getStatusClass(context.status)"
                >
                  {{ getStatusLabel(context.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <Actions
                  :item="context"
                  @edit="openEditModal"
                  @delete="confirmDelete"
                />
              </td>
            </tr>
            <tr v-if="!loading && items.length === 0">
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
      :on-created="handleContextCreated"
    >
      <CreateContext
        v-if="modals.create"
        :show="modals.create"
        :status-enums="statusEnums"
        :api-errors="apiErrors"
        @close="closeCreateModal"
        @created="handleContextCreated"
      />
    </slot>

    <!-- Edit Modal (slot) -->
    <slot
      name="edit-modal"
      :modals="modals"
      :context="selectedItem"
      :api-errors="apiErrors"
      :on-close="closeEditModal"
      :on-updated="handleContextUpdated"
    >
      <EditContext
        v-if="modals.edit"
        :show="modals.edit"
        :context="selectedItem"
        :status-enums="statusEnums"
        :api-errors="apiErrors"
        @close="closeEditModal"
        @updated="handleContextUpdated"
      />
    </slot>

    <!-- Delete Modal (slot) -->
    <slot
      name="delete-modal"
      :modals="modals"
      :context="selectedItem"
      :on-close="closeDeleteModal"
      :on-confirm="deleteContext"
    >
      <ConfirmModal
        v-if="modals.delete"
        :show="modals.delete"
        title="Xác nhận xóa"
        :message="`Bạn có chắc chắn muốn xóa context ${selectedItem?.name || ''}?`"
        :on-close="closeDeleteModal"
        @confirm="deleteContext"
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
import ContextsFilter from './ContextsFilter.vue'

// Lazy load components
const CreateContext = defineAsyncComponent(() => import('./CreateContext.vue'))
const EditContext = defineAsyncComponent(() => import('./EditContext.vue'))

// Props
interface Props {
  title?: string
  createButtonText?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Quản lý Contexts',
  createButtonText: 'Thêm context mới'
})

// Emits
const emit = defineEmits<{
  created: [context: any]
  updated: [context: any]
  deleted: [id: string | number]
}>()

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
  getSerialNumber
} = useAdminListPage({
  endpoints: {
    list: adminEndpoints.contexts.list,
    create: adminEndpoints.contexts.create,
    update: (id) => adminEndpoints.contexts.update(id),
    delete: (id) => adminEndpoints.contexts.delete(id),
    show: (id) => adminEndpoints.contexts.show(id)
  },
  defaults: {
    title: props.title,
    createButtonText: props.createButtonText
  },
  messages: {
    createSuccess: 'Context đã được tạo thành công',
    createError: 'Không thể tạo context',
    updateSuccess: 'Context đã được cập nhật thành công',
    updateError: 'Không thể cập nhật context',
    deleteSuccess: 'Context đã được xóa thành công',
    deleteError: 'Không thể xóa context'
  },
  fetchDetailBeforeEdit: true,
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

// Helper functions
function getTypeLabel(type: string): string {
  const typeMap: Record<string, string> = {
    system: 'System',
    shop: 'Shop',
    team: 'Team',
    project: 'Project',
    department: 'Department',
    organization: 'Organization'
  }
  return typeMap[type] || type
}

function getStatusLabel(status: string) {
  const list = statusEnums.value || []
  const found = list.find(it => it.value === status || it.id === status)
  return found?.label || found?.name || status || 'Không xác định'
}

function getStatusClass(status: string) {
  const list = statusEnums.value || []
  const found = list.find(s => s.value === status)
  return found?.class || found?.badge_class || found?.color_class || 'bg-gray-100 text-gray-800'
}

function handlePageChange(page: number) {
  changePage(page)
}

// Action handlers
async function handleContextCreated(contextData: any) {
  await handleCreate(contextData)
}

async function handleContextUpdated(contextData: any) {
  if (!selectedItem.value) return
  await handleUpdate(selectedItem.value.id, contextData)
}

async function deleteContext() {
  if (!selectedItem.value) return
  await handleDelete(selectedItem.value.id)
}
</script>

