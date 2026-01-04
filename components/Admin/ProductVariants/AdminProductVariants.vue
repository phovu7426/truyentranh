<template>
  <div class="admin-product-variants">
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
      :product-enums="productEnums"
      :on-update="handleFilterUpdate"
    >
      <!-- Default filter -->
      <VariantsFilter
        :initial-filters="filters"
        :status-enums="statusEnums"
        :product-enums="productEnums"
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
      :get-attribute-names="getAttributeNames"
      :format-currency="formatCurrency"
      :on-edit="openEditModal"
      :on-delete="confirmDelete"
    >
      <!-- Default table -->
      <div class="bg-white shadow-md rounded-lg overflow-hidden">
        <SkeletonLoader v-if="loading" type="table" :rows="5" :columns="8" />
        <div v-else class="table-responsive">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Biến thể</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tồn kho</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(variant, index) in items" :key="variant.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ getSerialNumber(index) }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <img 
                        v-if="variant.image" 
                        :src="getImageUrl(variant.image)" 
                        :alt="variant.name"
                        class="h-10 w-10 rounded-full object-cover"
                      >
                      <div 
                        v-else
                        class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center"
                      >
                        <span class="text-xs text-gray-500">N/A</span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ variant.name }}</div>
                      <div class="text-sm text-gray-500">{{ getAttributeNames(variant.attributes) }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ variant.product?.name || '—' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ variant.sku }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>
                    <span v-if="variant.sale_price" class="text-red-600 font-medium">
                      {{ formatCurrency(variant.sale_price) }}
                    </span>
                    <span v-else class="text-gray-900 font-medium">
                      {{ formatCurrency(variant.price) }}
                    </span>
                  </div>
                  <div v-if="variant.sale_price" class="text-sm text-gray-500 line-through">
                    {{ formatCurrency(variant.price) }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span :class="{
                    'text-green-600': variant.stock_quantity > 10,
                    'text-yellow-600': variant.stock_quantity > 0 && variant.stock_quantity <= 10,
                    'text-red-600': variant.stock_quantity === 0
                  }">
                    {{ variant.stock_quantity }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" 
                    :class="getStatusClass(variant.status)"
                  >
                    {{ getStatusLabel(variant.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Actions
                    :item="variant"
                    :show-view="false"
                    :show-delete="false"
                    @edit="openEditModal"
                    :additional-actions="[
                      {
                        label: 'Xóa',
                        action: () => confirmDelete(variant),
                        icon: 'trash'
                      }
                    ]"
                  />
                </td>
              </tr>
              <tr v-if="items.length === 0">
                <td colspan="8" class="px-6 py-4 text-center text-gray-500">
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
      :product-enums="productEnums"
      :attribute-enums="attributeEnums"
      :api-errors="apiErrors"
      :on-close="closeCreateModal"
      :on-created="handleVariantCreated"
    >
      <CreateProductVariant
        v-if="modals.create"
        :show="modals.create"
        :status-enums="statusEnums"
        :product-enums="productEnums"
        :attribute-enums="attributeEnums"
        :api-errors="apiErrors"
        :on-close="closeCreateModal"
        @created="handleVariantCreated"
      />
    </slot>

    <!-- Edit Modal (slot) -->
    <slot
      name="edit-modal"
      :modals="modals"
      :variant="selectedVariant"
      :status-enums="statusEnums"
      :product-enums="productEnums"
      :attribute-enums="attributeEnums"
      :api-errors="apiErrors"
      :on-close="closeEditModal"
      :on-updated="handleVariantUpdated"
    >
      <EditProductVariant
        v-if="modals.edit"
        :show="modals.edit"
        :variant="selectedVariant"
        :status-enums="statusEnums"
        :product-enums="productEnums"
        :attribute-enums="attributeEnums"
        :api-errors="apiErrors"
        :on-close="closeEditModal"
        @updated="handleVariantUpdated"
      />
    </slot>

    <!-- Delete Modal (slot) -->
    <slot
      name="delete-modal"
      :modals="modals"
      :variant="selectedVariant"
      :on-close="closeDeleteModal"
      :on-confirm="deleteVariant"
    >
      <ConfirmModal
        v-if="modals.delete"
        :show="modals.delete"
        title="Xác nhận xóa"
        :message="`Bạn có chắc chắn muốn xóa biến thể ${selectedVariant?.name || ''}?`"
        :on-close="closeDeleteModal"
        @confirm="deleteVariant"
      />
    </slot>
  </div>
</template>

<script setup lang="ts">
// Vue & Nuxt
import { ref, onMounted, defineAsyncComponent } from 'vue'
import { useRuntimeConfig } from '#app'

// Composables
import { useAdminListPage } from '@/composables/admin'
import { useGlobalApiClient } from '@/composables/api'
import { adminEndpoints } from '@/api/endpoints'

// Utils
import { formatCurrency } from '@/utils/formatters'

// Components
import SkeletonLoader from '@/components/Core/Loading/SkeletonLoader.vue'
import ConfirmModal from '@/components/Core/Modal/ConfirmModal.vue'
import Actions from '@/components/Core/Actions/Actions.vue'
import Pagination from '@/components/Core/Navigation/Pagination.vue'
import VariantsFilter from './VariantsFilter.vue'

// Props
interface Props {
  title?: string
  createButtonText?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Quản lý biến thể sản phẩm',
  createButtonText: 'Thêm biến thể mới'
})

// Emits
const emit = defineEmits<{
  created: [variant: any]
  updated: [variant: any]
  deleted: [id: string | number]
}>()

// Lazy load components
const CreateProductVariant = defineAsyncComponent(() => import('./CreateProductVariant.vue'))
const EditProductVariant = defineAsyncComponent(() => import('./EditProductVariant.vue'))

// Use admin list page composable
const {
  items,
  loading,
  pagination,
  filters,
  apiErrors,
  modals,
  selectedItem: selectedVariant,
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
    list: adminEndpoints.productVariants.list,
    create: adminEndpoints.productVariants.create,
    update: (id) => adminEndpoints.productVariants.update(id),
    delete: (id) => adminEndpoints.productVariants.delete(id)
  },
  defaults: {
    title: props.title,
    createButtonText: props.createButtonText
  },
  messages: {
    createSuccess: 'Biến thể đã được tạo thành công',
    createError: 'Không thể tạo biến thể',
    updateSuccess: 'Biến thể đã được cập nhật thành công',
    updateError: 'Không thể cập nhật biến thể',
    deleteSuccess: 'Biến thể đã được xóa thành công',
    deleteError: 'Không thể xóa biến thể'
  },
  onCreated: (item) => emit('created', item),
  onUpdated: (item) => emit('updated', item),
  onDeleted: (id) => emit('deleted', id)
})

const { apiClient } = useGlobalApiClient()
const config = useRuntimeConfig()

const statusEnums = ref([])
const productEnums = ref([])
const attributeEnums = ref([])

onMounted(() => {
  fetchEnums()
})

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
    const response = await apiClient.get(adminEndpoints.products.list)
    if (response.data?.success) {
      productEnums.value = response.data.data || []
    } else {
      productEnums.value = []
    }
  } catch (e) {
    productEnums.value = []
  }
  
  try {
    const response = await apiClient.get(adminEndpoints.productAttributes.list)
    if (response.data?.success) {
      attributeEnums.value = response.data.data || []
    } else {
      attributeEnums.value = []
    }
  } catch (e) {
    attributeEnums.value = []
  }
}

async function handleFilterUpdate(newFilters: any) {
  await updateFilters(newFilters)
}

async function handleVariantCreated(variantData: any) {
  await handleCreate(variantData)
}

async function handleVariantUpdated(variantData: any) {
  if (!selectedVariant.value) return
  await handleUpdate(selectedVariant.value.id, variantData)
}

async function deleteVariant() {
  if (!selectedVariant.value) return
  await handleDelete(selectedVariant.value.id)
}

function handlePageChange(page: number) {
  changePage(page)
}

function getStatusClass(status: string) {
  const found = (statusEnums.value as any[]).find(s => s.value === status)
  return found?.class || found?.badge_class || found?.color_class || 'bg-gray-100 text-gray-800'
}

function getStatusLabel(status: string) {
  const found = (statusEnums.value as any[]).find(s => s.value === status)
  return found?.label || status || 'Không xác định'
}

function getAttributeNames(attributes: any[]) {
  if (!attributes || !Array.isArray(attributes) || attributes.length === 0) {
    return '—'
  }
  return attributes
    .filter(attr => attr?.attribute?.name && attr?.value?.value)
    .map(attr => `${attr.attribute.name}: ${attr.value.value}`)
    .join(', ') || '—'
}

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
</script>

<style scoped>
.table-responsive {
  overflow-x: auto;
}
</style>

