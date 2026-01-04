<template>
  <div class="admin-product-attributes">
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
      :type-enums="typeEnums"
      :on-update="handleFilterUpdate"
    >
      <!-- Default filter -->
      <ProductAttributeFilter
        :initial-filters="filters"
        :status-enums="statusEnums"
        :type-enums="typeEnums"
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
      :get-type-class="getTypeClass"
      :on-edit="openEditModal"
      :on-delete="confirmDelete"
      :on-restore="restoreAttribute"
    >
      <!-- Default table -->
      <div class="bg-white shadow-md rounded-lg overflow-hidden">
        <SkeletonLoader v-if="loading" type="table" :rows="5" :columns="7" />
        <table v-else class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Biến thể</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cấu hình</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(attr, index) in items" :key="attr.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ getSerialNumber(index) }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ attr.name }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span class="px-2 py-1 text-xs font-medium rounded-full" :class="getTypeClass(attr.type)">
                  {{ getTypeLabel(attr.type) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span v-if="attr.is_variation" class="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                  Là biến thể
                </span>
                <span v-else class="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                  Không
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <div class="flex flex-col space-y-1">
                  <span v-if="attr.is_required" class="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                    Bắt buộc
                  </span>
                  <span v-if="attr.is_filterable" class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    Dùng lọc
                  </span>
                  <span v-if="attr.is_visible_on_frontend" class="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    Hiển thị
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex flex-col space-y-1">
                  <span
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="getStatusClass(attr.status)"
                  >
                    {{ getStatusLabel(attr.status) }}
                  </span>
                  <div v-if="attr.deleted_at" class="text-xs text-red-600">
                    Đã xóa
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <Actions
                    :item="attr"
                    :show-view="false"
                    :show-delete="false"
                    @edit="openEditModal"
                    :additional-actions="[
                      {
                        label: attr.deleted_at ? 'Khôi phục' : 'Xóa',
                        action: () => attr.deleted_at ? restoreAttribute(attr) : confirmDelete(attr),
                        icon: attr.deleted_at ? 'refresh' : 'trash'
                      }
                    ]"
                  />
              </td>
            </tr>
            <tr v-if="items.length === 0">
              <td colspan="7" class="px-6 py-4 text-center text-gray-500">
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
      :type-enums="typeEnums"
      :api-errors="apiErrors"
      :loading="loading"
      :on-close="closeCreateModal"
      :on-created="handleCreated"
    >
      <CreateAttribute
        v-if="modals.create"
        :show="modals.create"
        :status-enums="statusEnums"
        :type-enums="typeEnums"
        :api-errors="apiErrors"
        :loading="loading"
        @close="closeCreateModal"
        @created="handleCreated"
      />
    </slot>

    <!-- Edit Modal (slot) -->
    <slot
      name="edit-modal"
      :modals="modals"
      :attribute="selectedAttribute"
      :status-enums="statusEnums"
      :type-enums="typeEnums"
      :api-errors="apiErrors"
      :loading="loading"
      :on-close="closeEditModal"
      :on-updated="handleUpdated"
    >
      <EditAttribute
        v-if="modals.edit"
        :show="modals.edit"
        :attribute="selectedAttribute"
        :status-enums="statusEnums"
        :type-enums="typeEnums"
        :api-errors="apiErrors"
        :loading="loading"
        @close="closeEditModal"
        @updated="handleUpdated"
      />
    </slot>

    <!-- Delete Modal (slot) -->
    <slot
      name="delete-modal"
      :modals="modals"
      :attribute="selectedAttribute"
      :on-close="closeDeleteModal"
      :on-confirm="deleteAttribute"
    >
      <ConfirmModal
        v-if="modals.delete"
        :show="modals.delete"
        title="Xác nhận xóa"
        :message="`Bạn có chắc chắn muốn xóa thuộc tính ${selectedAttribute?.name || ''}?`"
        :on-close="closeDeleteModal"
        @confirm="deleteAttribute"
      />
    </slot>
  </div>
</template>

<script setup lang="ts">
// Vue
import { ref, onMounted, computed, defineAsyncComponent } from 'vue'

// Composables
import { useAdminListPage } from '@/composables/admin'
import { useGlobalApiClient } from '@/composables/api'
import { adminEndpoints } from '@/api/endpoints'

// Components
import SkeletonLoader from '@/components/Core/Loading/SkeletonLoader.vue'
import ConfirmModal from '@/components/Core/Modal/ConfirmModal.vue'
import Actions from '@/components/Core/Actions/Actions.vue'
import Pagination from '@/components/Core/Navigation/Pagination.vue'
import ProductAttributeFilter from './ProductAttributeFilter.vue'

// Props
interface Props {
  title?: string
  createButtonText?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Thuộc tính sản phẩm',
  createButtonText: 'Thêm thuộc tính'
})

// Emits
const emit = defineEmits<{
  created: [attribute: any]
  updated: [attribute: any]
  deleted: [id: string | number]
}>()

// Lazy load components
const CreateAttribute = defineAsyncComponent(() => import('./CreateAttribute.vue'))
const EditAttribute = defineAsyncComponent(() => import('./EditAttribute.vue'))

// Use admin list page composable
const {
  items,
  loading,
  pagination,
  filters,
  apiErrors,
  hasData,
  modals,
  selectedItem: selectedAttribute,
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
    list: adminEndpoints.productAttributes.list,
    create: adminEndpoints.productAttributes.create,
    update: (id) => adminEndpoints.productAttributes.update(id),
    delete: (id) => adminEndpoints.productAttributes.delete(id),
    show: (id) => adminEndpoints.productAttributes.show(id)
  },
  defaults: {
    title: props.title,
    createButtonText: props.createButtonText
  },
  messages: {
    createSuccess: 'Thuộc tính đã được tạo thành công',
    createError: 'Không thể tạo thuộc tính',
    updateSuccess: 'Thuộc tính đã được cập nhật thành công',
    updateError: 'Không thể cập nhật thuộc tính',
    deleteSuccess: 'Thuộc tính đã được xóa thành công',
    deleteError: 'Không thể xóa thuộc tính'
  },
  fetchDetailBeforeEdit: true,
  onCreated: (item) => emit('created', item),
  onUpdated: (item) => emit('updated', item),
  onDeleted: (id) => emit('deleted', id)
})

const { apiClient } = useGlobalApiClient()

const statusEnums = ref([])
const typeEnums = ref([])
const enumsLoaded = ref(false)

onMounted(async () => {
  if (!enumsLoaded.value) {
    await Promise.all([fetchStatusEnums(), fetchTypeEnums()])
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
  } catch (e) {
    statusEnums.value = []
  }
}

async function fetchTypeEnums() {
  try {
    const response = await apiClient.get(adminEndpoints.enums.byName('attribute_type'))
    if (response.data?.success) {
      typeEnums.value = response.data.data || []
    } else {
      typeEnums.value = []
    }
  } catch (e) {
    typeEnums.value = []
  }
}

async function handleFilterUpdate(newFilters: any) {
  await updateFilters(newFilters)
}

async function handleCreated(data: any) {
  await handleCreate(data)
}

async function handleUpdated(data: any) {
  if (!selectedAttribute.value) return
  await handleUpdate(selectedAttribute.value.id, data)
}

async function deleteAttribute() {
  if (!selectedAttribute.value) return
  await handleDelete(selectedAttribute.value.id)
}

async function restoreAttribute(attr: any) {
  try {
    const response = await apiClient.put(adminEndpoints.productAttributes.restore(attr.id))
    if (response.data?.success) {
      showSuccess('Thuộc tính đã được khôi phục thành công')
      refresh()
    } else {
      showError('Không thể khôi phục thuộc tính')
    }
  } catch (error) {
    showError('Không thể khôi phục thuộc tính')
  }
}

function handlePageChange(page: number) {
  changePage(page)
}

function getStatusLabel(status: string) {
  const found = (statusEnums.value as any[]).find(it => it.value === status || it.id === status)
  return found?.label || found?.name || status || 'Không xác định'
}

function getStatusClass(status: string) {
  const found = (statusEnums.value as any[]).find(s => s.value === status)
  return found?.class || found?.badge_class || found?.color_class || 'bg-gray-100 text-gray-800'
}

function getTypeLabel(type: string) {
  const found = (typeEnums.value as any[]).find(it => it.value === type || it.key === type)
  return found?.label || found?.name || type || '—'
}

function getTypeClass(type: string) {
  const typeClasses: Record<string, string> = {
    'text': 'bg-gray-100 text-gray-800',
    'select': 'bg-blue-100 text-blue-800',
    'multiselect': 'bg-purple-100 text-purple-800',
    'color': 'bg-pink-100 text-pink-800',
    'image': 'bg-green-100 text-green-800'
  }
  return typeClasses[type] || 'bg-gray-100 text-gray-800'
}
</script>

<style scoped>
.table-responsive {
  overflow-x: auto;
}
</style>

