<template>
  <div class="admin-product-categories">
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
      :parent-categories="parentCategories"
      :on-update="handleFilterUpdate"
    >
      <!-- Default filter -->
      <ProductCategoryFilter
        :initial-filters="filters"
        :status-enums="statusEnums"
        :parent-categories="parentCategories"
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
      :get-image-url="getImageUrl"
      :handle-image-error="handleImageError"
      :on-edit="openEditModal"
      :on-delete="confirmDelete"
      :on-restore="restoreCategory"
    >
      <!-- Default table -->
      <div class="bg-white shadow-md rounded-lg overflow-hidden">
        <SkeletonLoader v-if="loading" type="table" :rows="5" :columns="5" />
        <table v-else class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Danh mục</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(category, index) in items" :key="category.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ getSerialNumber(index) }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <img
                      v-if="category.image"
                      :src="getImageUrl(category.image)"
                      :alt="category.name"
                      class="h-10 w-10 rounded-full object-cover"
                      :crossorigin="category.image && (category.image.startsWith('http://') || category.image.startsWith('https://')) ? 'anonymous' : undefined"
                      @error="handleImageError"
                    >
                    <div
                      v-else
                      class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center"
                    >
                      <span class="text-xs text-gray-500">N/A</span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ category.name }}</div>
                    <div v-if="category.parent" class="text-sm text-gray-500">{{ category.parent.name }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex flex-col space-y-1">
                  <div class="flex space-x-2">
                    <span
                      class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      :class="getStatusClass(category.status)"
                    >
                      {{ getStatusLabel(category.status) }}
                    </span>
                  </div>
                  <div v-if="category.deleted_at" class="text-xs text-red-600">
                    Đã xóa
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <Actions
                    :item="category"
                    :show-view="false"
                    :show-delete="false"
                    @edit="openEditModal"
                    :additional-actions="[
                      {
                        label: category.deleted_at ? 'Khôi phục' : 'Xóa',
                        action: () => category.deleted_at ? restoreCategory(category) : confirmDelete(category),
                        icon: category.deleted_at ? 'refresh' : 'trash'
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
      :loading="loading"
      :on-close="closeCreateModal"
      :on-created="handleCategoryCreated"
    >
      <CreateCategory
        v-if="modals.create"
        :show="modals.create"
        :status-enums="statusEnums"
        :api-errors="apiErrors"
        :loading="loading"
        @close="closeCreateModal"
        @created="handleCategoryCreated"
      />
    </slot>

    <!-- Edit Modal (slot) -->
    <slot
      name="edit-modal"
      :modals="modals"
      :category="selectedItem"
      :status-enums="statusEnums"
      :api-errors="apiErrors"
      :loading="loading"
      :on-close="closeEditModal"
      :on-updated="handleCategoryUpdated"
    >
      <EditCategory
        v-show="modals.edit"
        :show="modals.edit"
        :category="selectedItem"
        :status-enums="statusEnums"
        :api-errors="apiErrors"
        :loading="loading"
        @close="closeEditModal"
        @updated="handleCategoryUpdated"
      />
    </slot>

    <!-- Delete Modal (slot) -->
    <slot
      name="delete-modal"
      :modals="modals"
      :category="selectedItem"
      :on-close="closeDeleteModal"
      :on-confirm="deleteCategory"
    >
      <ConfirmModal
        v-if="modals.delete"
        :show="modals.delete"
        title="Xác nhận xóa"
        :message="`Bạn có chắc chắn muốn xóa danh mục ${selectedItem?.name || ''}?`"
        :on-close="closeDeleteModal"
        @confirm="deleteCategory"
      />
    </slot>
  </div>
</template>

<script setup lang="ts">
// Vue & Nuxt
import { ref, onMounted, computed, defineAsyncComponent } from 'vue'
import { useRuntimeConfig } from '#app'

// Composables
import { useAdminListPage } from '@/composables/admin'
import { useGlobalApiClient } from '@/composables/api'
import { adminEndpoints } from '@/api/endpoints'

// Components
import SkeletonLoader from '@/components/Core/Loading/SkeletonLoader.vue'
import ConfirmModal from '@/components/Core/Modal/ConfirmModal.vue'
import Actions from '@/components/Core/Actions/Actions.vue'
import Pagination from '@/components/Core/Navigation/Pagination.vue'
import ProductCategoryFilter from './ProductCategoryFilter.vue'

// Props
interface Props {
  title?: string
  createButtonText?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Quản lý danh mục sản phẩm',
  createButtonText: 'Thêm danh mục mới'
})

// Emits
const emit = defineEmits<{
  created: [category: any]
  updated: [category: any]
  deleted: [id: string | number]
}>()

// Lazy load components
const CreateCategory = defineAsyncComponent(() => import('./CreateCategory.vue'))
const EditCategory = defineAsyncComponent(() => import('./EditCategory.vue'))

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
    list: adminEndpoints.productCategories.list,
    create: adminEndpoints.productCategories.create,
    update: (id) => adminEndpoints.productCategories.update(id),
    delete: (id) => adminEndpoints.productCategories.delete(id)
  },
  defaults: {
    title: props.title,
    createButtonText: props.createButtonText
  },
  messages: {
    createSuccess: 'Danh mục đã được tạo thành công',
    createError: 'Không thể tạo danh mục',
    updateSuccess: 'Danh mục đã được cập nhật thành công',
    updateError: 'Không thể cập nhật danh mục',
    deleteSuccess: 'Danh mục đã được xóa thành công',
    deleteError: 'Không thể xóa danh mục'
  },
  onCreated: (item) => emit('created', item),
  onUpdated: (item) => emit('updated', item),
  onDeleted: (id) => emit('deleted', id)
})

const { apiClient } = useGlobalApiClient()
const config = useRuntimeConfig()

const statusEnums = ref([])
const parentCategories = ref([])
const enumsLoaded = ref(false)

function getImageUrl(path: string | null) {
  if (!path) return null
  if (typeof path === 'string' && (path.startsWith('http://') || path.startsWith('https://'))) {
    return path
  }
  if (typeof path === 'string' && path.startsWith('/')) {
    return `${config.public.apiBase}${path}`
  }
  return path
}

function getStatusLabel(status: string) {
  const found = (statusEnums.value as any[]).find(s => s.value === status)
  return found?.label || status || 'Không xác định'
}

function getStatusClass(status: string) {
  const found = (statusEnums.value as any[]).find(s => s.value === status)
  return found?.class || found?.badge_class || found?.color_class || 'bg-gray-100 text-gray-800'
}

function handleImageError(e: Event) {
  const target = e.target as HTMLImageElement
  if (target) {
    target.onerror = null
    target.style.display = 'none'
  }
}

onMounted(async () => {
  if (!enumsLoaded.value) {
    await fetchEnums()
    enumsLoaded.value = true
  }
})

async function fetchEnums() {
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
  
  try {
    const response = await apiClient.get(adminEndpoints.productCategories.list)
    if (response.data?.success) {
      parentCategories.value = response.data.data || []
    } else {
      parentCategories.value = []
    }
  } catch (e) {
    parentCategories.value = []
  }
}

async function handleFilterUpdate(newFilters: any) {
  await updateFilters(newFilters)
}

async function handleCategoryCreated(categoryData: any) {
  await handleCreate(categoryData)
}

async function handleCategoryUpdated(categoryData: any) {
  if (!selectedItem.value) return
  await handleUpdate(selectedItem.value.id, categoryData)
}

async function deleteCategory() {
  if (!selectedItem.value) return
  await handleDelete(selectedItem.value.id)
}

async function restoreCategory(category: any) {
  try {
    const response = await apiClient.put(adminEndpoints.productCategories.restore(category.id))
    if (response.data?.success) {
      showSuccess('Danh mục đã được khôi phục thành công')
      refresh()
    } else {
      showError('Không thể khôi phục danh mục')
    }
  } catch (error) {
    showError('Không thể khôi phục danh mục')
  }
}

async function handlePageChange(page: number) {
  await changePage(page)
}
</script>

<style scoped>
.table-responsive {
  overflow-x: auto;
}
</style>

