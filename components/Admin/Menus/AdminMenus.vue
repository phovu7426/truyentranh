<template>
  <div class="admin-menus">
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
      :parent-menus="parentMenus"
      :on-update="handleFilterUpdate"
    >
      <!-- Default filter -->
      <MenusFilter
        :initial-filters="filters"
        :status-enums="statusEnums"
        :parent-menus="parentMenus"
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
      :get-type-label="getTypeLabel"
      :on-edit="openEditModal"
      :on-delete="confirmDelete"
      :on-restore="restoreMenu"
    >
      <!-- Default table -->
      <div class="bg-white shadow-md rounded-lg overflow-hidden">
        <SkeletonLoader v-if="loading" type="table" :rows="5" :columns="6" />
        <table v-else class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Menu</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Path</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(menu, index) in items" :key="menu.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ getSerialNumber(index) }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span class="text-lg">{{ menu.icon || '📋' }}</span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ menu.name }}</div>
                    <div class="text-sm text-gray-500">{{ menu.code }}</div>
                    <div v-if="menu.parent" class="text-xs text-gray-400">Cha: {{ menu.parent.name }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div class="max-w-xs truncate" :title="menu.path || '—'">
                  {{ menu.path || '—' }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span class="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {{ getTypeLabel(menu.type) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex flex-col space-y-1">
                  <span
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="getStatusClass(menu.status)"
                  >
                    {{ getStatusLabel(menu.status) }}
                  </span>
                  <span
                    v-if="!menu.show_in_menu"
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800"
                  >
                    Ẩn trong menu
                  </span>
                  <div v-if="menu.deleted_at" class="text-xs text-red-600">
                    Đã xóa
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <Actions
                    :item="menu"
                    :show-view="false"
                    :show-delete="false"
                    @edit="openEditModal"
                    :additional-actions="[
                      {
                        label: menu.deleted_at ? 'Khôi phục' : 'Xóa',
                        action: () => menu.deleted_at ? restoreMenu(menu) : confirmDelete(menu),
                        icon: menu.deleted_at ? 'refresh' : 'trash'
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
      :parent-menus="parentMenus"
      :permissions="permissions"
      :api-errors="apiErrors"
      :on-close="closeCreateModal"
      :on-created="handleMenuCreated"
    >
      <ClientOnly>
        <CreateMenu
          v-if="modals.create"
          :show="modals.create"
          :status-enums="statusEnums"
          :parent-menus="parentMenus"
          :permissions="permissions"
          :api-errors="apiErrors"
          @close="closeCreateModal"
          @created="handleMenuCreated"
        />
      </ClientOnly>
    </slot>

    <!-- Edit Modal (slot) -->
    <slot
      name="edit-modal"
      :modals="modals"
      :menu="selectedItem"
      :status-enums="statusEnums"
      :parent-menus="parentMenus"
      :permissions="permissions"
      :api-errors="apiErrors"
      :on-close="closeEditModal"
      :on-updated="handleMenuUpdated"
    >
      <ClientOnly>
        <EditMenu
          v-if="modals.edit"
          :show="modals.edit"
          :menu="selectedItem"
          :status-enums="statusEnums"
          :parent-menus="parentMenus"
          :permissions="permissions"
          :api-errors="apiErrors"
          @close="closeEditModal"
          @updated="handleMenuUpdated"
        />
      </ClientOnly>
    </slot>

    <!-- Delete Modal (slot) -->
    <slot
      name="delete-modal"
      :modals="modals"
      :menu="selectedItem"
      :on-close="closeDeleteModal"
      :on-confirm="deleteMenu"
    >
      <ConfirmModal
        v-if="modals.delete"
        :show="modals.delete"
        title="Xác nhận xóa"
        :message="`Bạn có chắc chắn muốn xóa menu ${selectedItem?.name || ''}?`"
        :on-close="closeDeleteModal"
        @confirm="deleteMenu"
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
import { useMenus } from '@/composables/menus'
import { adminEndpoints } from '@/api/endpoints'

// Types
import { MenuType, BasicStatus } from '@/types/menu'

// Components
import SkeletonLoader from '@/components/Core/Loading/SkeletonLoader.vue'
import ConfirmModal from '@/components/Core/Modal/ConfirmModal.vue'
import Actions from '@/components/Core/Actions/Actions.vue'
import Pagination from '@/components/Core/Navigation/Pagination.vue'
import MenusFilter from './MenusFilter.vue'

// Props
interface Props {
  title?: string
  createButtonText?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Quản lý menu',
  createButtonText: 'Thêm menu mới'
})

// Emits
const emit = defineEmits<{
  created: [menu: any]
  updated: [menu: any]
  deleted: [id: string | number]
}>()

// Lazy load components
const CreateMenu = defineAsyncComponent(() => import('./MenuForm.vue'))
const EditMenu = defineAsyncComponent(() => import('./MenuForm.vue'))

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
    list: adminEndpoints.menus.list,
    create: adminEndpoints.menus.create,
    update: (id) => adminEndpoints.menus.update(id),
    delete: (id) => adminEndpoints.menus.delete(id),
    show: (id) => adminEndpoints.menus.show(id)
  },
  defaults: {
    title: props.title,
    createButtonText: props.createButtonText
  },
  messages: {
    createSuccess: 'Menu đã được tạo thành công',
    createError: 'Không thể tạo menu',
    updateSuccess: 'Menu đã được cập nhật thành công',
    updateError: 'Không thể cập nhật menu',
    deleteSuccess: 'Menu đã được xóa thành công',
    deleteError: 'Không thể xóa menu'
  },
  fetchDetailBeforeEdit: true,
  onCreated: (item) => emit('created', item),
  onUpdated: (item) => emit('updated', item),
  onDeleted: (id) => emit('deleted', id)
})

const { apiClient } = useGlobalApiClient()
const { getMenuTree } = useMenus()

const statusEnums = ref([])
const parentMenus = ref([])
const permissions = ref([])
const enumsLoaded = ref(false)

onMounted(async () => {
  if (!enumsLoaded.value) {
    await fetchEnums()
    enumsLoaded.value = true
  }
})

async function fetchEnums() {
  try {
    statusEnums.value = [
      { value: BasicStatus.ACTIVE, label: 'Hoạt động' },
      { value: BasicStatus.INACTIVE, label: 'Ngừng hoạt động' }
    ]
  } catch (e) {
    statusEnums.value = []
  }
  
  try {
    const menus = await getMenuTree()
    parentMenus.value = menus || []
  } catch (e) {
    parentMenus.value = []
  }

  try {
    const response = await apiClient.get(adminEndpoints.permissions.list)
    if (response.data?.success) {
      permissions.value = response.data.data || []
    } else {
      permissions.value = []
    }
  } catch (e) {
    permissions.value = []
  }
}

async function handleFilterUpdate(newFilters: any) {
  await updateFilters(newFilters)
}

async function handleMenuCreated(menuData: any) {
  await handleCreate(menuData)
}

async function handleMenuUpdated(menuData: any) {
  if (!selectedItem.value) return
  await handleUpdate(selectedItem.value.id, menuData)
}

async function deleteMenu() {
  if (!selectedItem.value) return
  await handleDelete(selectedItem.value.id)
}

async function restoreMenu(menu: any) {
  try {
    const response = await apiClient.put(adminEndpoints.menus.restore(menu.id))
    if (response.data?.success) {
      showSuccess('Menu đã được khôi phục thành công')
      refresh()
    } else {
      showError('Không thể khôi phục menu')
    }
  } catch (error) {
    showError('Không thể khôi phục menu')
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

function getTypeLabel(type: string) {
  const typeMap: Record<string, string> = {
    [MenuType.LINK]: 'Link',
    [MenuType.DROPDOWN]: 'Dropdown',
    [MenuType.BUTTON]: 'Button'
  }
  return typeMap[type] || type
}
</script>

<style scoped>
.table-responsive {
  overflow-x: auto;
}
</style>

