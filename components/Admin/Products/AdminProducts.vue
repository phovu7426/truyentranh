<template>
  <div class="admin-products">
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
      :category-enums="categoryEnums"
      :on-update="handleFilterUpdate"
    >
      <!-- Default filter -->
      <ProductsFilter
        :initial-filters="filters"
        :status-enums="statusEnums"
        :category-enums="categoryEnums"
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
      :get-category-names="getCategoryNames"
      :handle-image-error="handleImageError"
      :on-edit="openEditModal"
      :on-delete="confirmDelete"
      :on-restore="restoreProduct"
    >
      <!-- Default table -->
      <div class="bg-white shadow-md rounded-lg overflow-hidden">
        <SkeletonLoader v-if="loading" type="table" :rows="5" :columns="7" />
        <table v-else class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(product, index) in items" :key="product.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ getSerialNumber(index) }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <img 
                      v-if="product.image" 
                      :src="getImageUrl(product.image)" 
                      :alt="product.name"
                      class="h-10 w-10 rounded-full object-cover"
                      :crossorigin="product.image && (product.image.startsWith('http://') || product.image.startsWith('https://')) ? 'anonymous' : undefined"
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
                    <div class="text-sm font-medium text-gray-900">{{ product.name }}</div>
                    <div class="text-sm text-gray-500">{{ getCategoryNames(product.categories) }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ product.sku }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex flex-col space-y-1">
                  <div class="flex space-x-2">
                    <span
                      class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      :class="getStatusClass(product.status)"
                    >
                      {{ getStatusLabel(product.status) }}
                    </span>
                    <span
                      v-if="product.is_featured"
                      class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800"
                    >
                      Nổi bật
                    </span>
                  </div>
                  <div v-if="product.deleted_at" class="text-xs text-red-600">
                    Đã xóa
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <Actions
                    :item="product"
                    :show-view="false"
                    :show-delete="false"
                    @edit="openEditModal"
                    :additional-actions="[
                      {
                        label: product.deleted_at ? 'Khôi phục' : 'Xóa',
                        action: () => product.deleted_at ? restoreProduct(product) : confirmDelete(product),
                        icon: product.deleted_at ? 'refresh' : 'trash'
                      }
                    ]"
                  />
              </td>
            </tr>
            <tr v-if="!items || items.length === 0">
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
      :category-enums="categoryEnums"
      :api-errors="apiErrors"
      :on-close="closeCreateModal"
      :on-created="handleProductCreated"
    >
      <CreateProduct
        v-if="modals.create"
        :show="modals.create"
        :status-enums="statusEnums"
        :category-enums="categoryEnums"
        :api-errors="apiErrors"
        @close="closeCreateModal"
        @created="handleProductCreated"
      />
    </slot>

    <!-- Edit Modal (slot) -->
    <slot
      name="edit-modal"
      :modals="modals"
      :product="selectedItem"
      :categories="selectedItemCategories"
      :status-enums="statusEnums"
      :category-enums="categoryEnums"
      :api-errors="apiErrors"
      :on-close="closeEditModal"
      :on-updated="handleProductUpdated"
    >
      <EditProduct
        v-if="modals.edit"
        :show="modals.edit"
        :product="selectedItem"
        :categories="selectedItemCategories"
        :status-enums="statusEnums"
        :category-enums="categoryEnums"
        :api-errors="apiErrors"
        @close="closeEditModal"
        @updated="handleProductUpdated"
      />
    </slot>

    <!-- Delete Modal (slot) -->
    <slot
      name="delete-modal"
      :modals="modals"
      :product="selectedItem"
      :on-close="closeDeleteModal"
      :on-confirm="deleteProduct"
    >
      <ConfirmModal
        v-if="modals.delete"
        :show="modals.delete"
        title="Xác nhận xóa"
        :message="`Bạn có chắc chắn muốn xóa sản phẩm ${selectedItem?.name || ''}?`"
        :on-close="closeDeleteModal"
        @confirm="deleteProduct"
      />
    </slot>
  </div>
</template>

<script setup lang="ts">
// Vue
import { ref, onMounted, computed, defineAsyncComponent } from 'vue'

// Composables
import { useToast } from '@/composables/ui/useToast'
import { useSerialNumber, useAdminModals } from '@/composables/ui'
import { useGlobalApiClient } from '@/composables/api'
import { useAdminListPage } from '@/composables/admin/useAdminListPage'
import { adminEndpoints } from '@/api/endpoints'

// Components
import SkeletonLoader from '@/components/Core/Loading/SkeletonLoader.vue'
import ConfirmModal from '@/components/Core/Modal/ConfirmModal.vue'
import Actions from '@/components/Core/Actions/Actions.vue'
import Pagination from '@/components/Core/Navigation/Pagination.vue'
import ProductsFilter from './ProductsFilter.vue'

// Props
interface Props {
  title?: string
  createButtonText?: string
  context?: 'system' | 'shop'
  shopId?: string | number
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Quản lý sản phẩm',
  createButtonText: 'Thêm sản phẩm mới'
})

// Emits
const emit = defineEmits<{
  created: [product: any]
  updated: [product: any]
  deleted: [id: string | number]
}>()

// Lazy load components
const CreateProduct = defineAsyncComponent(() => import('./ProductForm.vue'))
const EditProduct = defineAsyncComponent(() => import('./ProductForm.vue'))

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
    list: adminEndpoints.products.list,
    create: adminEndpoints.products.create,
    update: (id) => adminEndpoints.products.update(id),
    delete: (id) => adminEndpoints.products.delete(id),
    show: (id) => adminEndpoints.products.show(id)
  },
  defaults: {
    title: props.title,
    createButtonText: props.createButtonText
  },
  messages: {
    createSuccess: 'Sản phẩm đã được tạo thành công',
    createError: 'Không thể tạo sản phẩm',
    updateSuccess: 'Sản phẩm đã được cập nhật thành công',
    updateError: 'Không thể cập nhật sản phẩm',
    deleteSuccess: 'Sản phẩm đã được xóa thành công',
    deleteError: 'Không thể xóa sản phẩm'
  },
  fetchDetailBeforeEdit: true,
  onCreated: (item) => emit('created', item),
  onUpdated: (item) => emit('updated', item),
  onDeleted: (id) => emit('deleted', id)
})

const { apiClient } = useGlobalApiClient()
const config = useRuntimeConfig()

// Helper function to get full image URL
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

// State
const statusEnums = ref([])
const categoryEnums = ref([])
const enumsLoaded = ref(false)

onMounted(async () => {
  if (!enumsLoaded.value) {
    await fetchEnums()
    enumsLoaded.value = true
  }
})

async function handleFilterUpdate(newFilters: any) {
  await updateFilters(newFilters)
}

async function fetchEnums() {
  try {
    const response = await apiClient.get(adminEndpoints.enums.byName('product_status'))
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
      categoryEnums.value = response.data.data || []
    } else {
      categoryEnums.value = []
    }
  } catch (e) {
    categoryEnums.value = []
  }
}

// Action handlers
async function handleProductCreated(productData: any) {
  await handleCreate(productData)
}

async function handleProductUpdated(productData: any) {
  if (!selectedItem.value) return
  await handleUpdate(selectedItem.value.id, productData)
}

async function deleteProduct() {
  if (!selectedItem.value) return
  await handleDelete(selectedItem.value.id)
}

async function restoreProduct(product: any) {
  try {
    const response = await apiClient.put(adminEndpoints.products.restore(product.id))
    if (response.data?.success) {
      showSuccess('Sản phẩm đã được khôi phục thành công')
      refresh()
    } else {
      showError('Không thể khôi phục sản phẩm')
    }
  } catch (error) {
    showError('Không thể khôi phục sản phẩm')
  }
}

async function handlePageChange(page: number) {
  await changePage(page)
}

// Status helper functions
function getStatusLabel(status: string) {
  const found = (statusEnums.value as any[]).find(s => s.value === status)
  return found?.label || status || 'Không xác định'
}

function getStatusClass(status: string) {
  const found = (statusEnums.value as any[]).find(s => s.value === status)
  return found?.class || found?.badge_class || found?.color_class || 'bg-gray-100 text-gray-800'
}

function getCategoryNames(categories: any[]) {
  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    return '—'
  }
  return categories.map(cat => cat.name).join(', ')
}

function handleImageError(e: Event) {
  const target = e.target as HTMLImageElement
  if (target) {
    target.onerror = null
    target.style.display = 'none'
  }
}

const selectedItemCategories = computed(() => {
  if (!selectedItem.value) return []
  return selectedItem.value.categories || []
})
</script>

<style scoped>
.table-responsive {
  overflow-x: auto;
}
</style>

