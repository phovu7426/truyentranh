<template>
  <div class="admin-product-attribute-values">
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
      :attribute-enums="attributeEnums"
      :status-options="statusFilterOptions"
      :on-update="handleFilterUpdate"
    >
      <!-- Default filter -->
      <AttributeValueFilter
        :initial-filters="filters"
        :attribute-enums="attributeEnums"
        :status-options="statusFilterOptions"
        @update:filters="handleFilterUpdate"
      />
    </slot>

    <!-- Table (allow override via slot) -->
    <slot
      name="table"
      :items="items"
      :loading="loading"
      :get-serial-number="getSerialNumber"
      :status-badge-options="statusBadgeOptions"
      :resolve-media-url="resolveMediaUrl"
      :get-row-actions="getRowActions"
      :on-edit="openEditModal"
      :on-delete="confirmDelete"
      :on-restore="restoreValue"
    >
      <!-- Default table -->
      <div class="bg-white shadow-md rounded-lg overflow-hidden">
        <SkeletonLoader v-if="loading" type="table" :rows="5" :columns="8" />
        <table v-else class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá trị</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thuộc tính</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã màu</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ảnh</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thứ tự</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="(value, index) in items"
              :key="value.id"
              :class="value.deleted_at ? 'bg-red-50/40' : ''"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ getSerialNumber(index) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                <div class="flex flex-col space-y-1">
                  <span>{{ value.value }}</span>
                  <span class="text-xs text-gray-500">ID: #{{ value.id }}</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div class="flex flex-col">
                  <span>{{ value.attribute?.name || '—' }}</span>
                  <span v-if="value.attribute?.type" class="text-xs text-gray-500 uppercase tracking-wide">
                    {{ value.attribute.type }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <div v-if="value.color_code" class="flex items-center space-x-3">
                  <span
                    class="w-8 h-8 rounded border border-gray-300"
                    :style="{ backgroundColor: value.color_code }"
                  ></span>
                  <span class="font-mono text-xs text-gray-700">{{ value.color_code }}</span>
                </div>
                <span v-else class="text-gray-400 text-sm">—</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <div v-if="value.image" class="flex items-center space-x-3">
                  <img
                    :src="resolveMediaUrl(value.image)"
                    alt="Thumbnail"
                    class="w-12 h-12 rounded border object-cover"
                  />
                </div>
                <span v-else class="text-gray-400 text-sm">—</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <div class="flex flex-col space-y-1">
                  <StatusBadge
                    :status="value.status"
                    :status-options="statusBadgeOptions"
                  />
                  <span v-if="value.deleted_at" class="text-xs text-red-600">Đã xóa</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ value.sort_order ?? 0 }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <Actions
                    :item="value"
                    :show-view="false"
                    :show-delete="false"
                    @edit="openEditModal"
                    :additional-actions="getRowActions(value)"
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
      :attribute-enums="attributeEnums"
      :status-enums="statusEnums"
      :api-errors="apiErrors"
      :on-close="closeCreateModal"
      :on-created="handleValueCreated"
    >
      <CreateAttributeValue
        v-if="modals.create"
        :show="modals.create"
        :attribute-enums="attributeEnums"
        :status-enums="statusEnums"
        :api-errors="apiErrors"
        :on-close="closeCreateModal"
        @created="handleValueCreated"
      />
    </slot>

    <!-- Edit Modal (slot) -->
    <slot
      name="edit-modal"
      :modals="modals"
      :value="selectedValue"
      :attribute-enums="attributeEnums"
      :status-enums="statusEnums"
      :api-errors="apiErrors"
      :on-close="closeEditModal"
      :on-updated="handleValueUpdated"
    >
      <EditAttributeValue
        v-if="modals.edit"
        :show="modals.edit"
        :value="selectedValue"
        :attribute-enums="attributeEnums"
        :status-enums="statusEnums"
        :api-errors="apiErrors"
        :on-close="closeEditModal"
        @updated="handleValueUpdated"
      />
    </slot>

    <!-- Delete Modal (slot) -->
    <slot
      name="delete-modal"
      :modals="modals"
      :value="selectedValue"
      :on-close="closeDeleteModal"
      :on-confirm="deleteValue"
    >
      <ConfirmModal
        v-if="modals.delete"
        :show="modals.delete"
        title="Xác nhận xóa"
        :message="`Bạn có chắc chắn muốn xóa giá trị ${selectedValue?.value || ''}?`"
        :on-close="closeDeleteModal"
        @confirm="deleteValue"
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

// Stores
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

// Components
import SkeletonLoader from '@/components/Core/Loading/SkeletonLoader.vue'
import ConfirmModal from '@/components/Core/Modal/ConfirmModal.vue'
import Actions from '@/components/Core/Actions/Actions.vue'
import Pagination from '@/components/Core/Navigation/Pagination.vue'
import StatusBadge from '@/components/Core/Badges/StatusBadge.vue'
import AttributeValueFilter from './AttributeValueFilter.vue'

// Props
interface Props {
  title?: string
  createButtonText?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Quản lý giá trị thuộc tính sản phẩm',
  createButtonText: 'Thêm giá trị mới'
})

// Emits
const emit = defineEmits<{
  created: [value: any]
  updated: [value: any]
  deleted: [id: string | number]
}>()

// Lazy load components
const CreateAttributeValue = defineAsyncComponent(() => import('./CreateAttributeValue.vue'))
const EditAttributeValue = defineAsyncComponent(() => import('./EditAttributeValue.vue'))

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)
const currentUserId = computed(() => user.value?.id ?? null)
const config = useRuntimeConfig()
const apiBaseUrl = (config.public?.apiBase || '').replace(/\/$/, '')

// Use admin list page composable
const {
  items,
  loading,
  pagination,
  filters,
  apiErrors,
  hasData,
  modals,
  selectedItem: selectedValue,
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
  handleCreate: handleCreateBase,
  handleUpdate: handleUpdateBase,
  handleDelete: handleDeleteBase,
  getSerialNumber,
  showSuccess,
  showError
} = useAdminListPage({
  endpoints: {
    list: adminEndpoints.productAttributeValues.list,
    create: adminEndpoints.productAttributeValues.create,
    update: (id) => adminEndpoints.productAttributeValues.update(id),
    delete: (id) => adminEndpoints.productAttributeValues.delete(id),
    show: (id) => adminEndpoints.productAttributeValues.show(id)
  },
  defaults: {
    title: props.title,
    createButtonText: props.createButtonText
  },
  messages: {
    createSuccess: 'Giá trị thuộc tính đã được tạo thành công',
    createError: 'Không thể tạo giá trị thuộc tính',
    updateSuccess: 'Giá trị thuộc tính đã được cập nhật thành công',
    updateError: 'Không thể cập nhật giá trị thuộc tính',
    deleteSuccess: 'Giá trị thuộc tính đã được xóa thành công',
    deleteError: 'Không thể xóa giá trị thuộc tính'
  },
  fetchDetailBeforeEdit: true,
  onCreated: (item) => emit('created', item),
  onUpdated: (item) => emit('updated', item),
  onDeleted: (id) => emit('deleted', id)
})

const { apiClient } = useGlobalApiClient()

const attributeEnums = ref([])
const statusEnums = ref([])
const enumsLoaded = ref(false)
const badgeColorTokens = ['yellow', 'blue', 'purple', 'indigo', 'orange', 'green', 'red', 'gray']

const statusBadgeOptions = computed(() => {
  const defaultColor = (value: string) => value === 'active' ? 'green' : value === 'inactive' ? 'gray' : 'blue'
  return (statusEnums.value as any[]).map((status) => {
    const value = status.value ?? status.id ?? ''
    const colorSource = status.color || status.badge_color || status.badge_class || status.color_class || ''
    return {
      value,
      label: status.label ?? status.name ?? value,
      color: normalizeBadgeColor(colorSource, defaultColor(value))
    }
  })
})

const statusFilterOptions = computed(() => statusBadgeOptions.value.map(({ value, label }) => ({ value, label })))

onMounted(async () => {
  if (!enumsLoaded.value) {
    await fetchEnums()
    enumsLoaded.value = true
  }
})

async function fetchEnums() {
  await Promise.all([fetchAttributes(), fetchStatusOptions()])
}

async function fetchAttributes() {
  try {
    const response = await apiClient.get(adminEndpoints.productAttributes.list, {
      params: {
        status: 'active',
        limit: 200
      }
    })
    if (response.data?.success) {
      attributeEnums.value = response.data.data || []
    } else {
      attributeEnums.value = []
    }
  } catch (e) {
    attributeEnums.value = []
  }
}

async function fetchStatusOptions() {
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

async function handleFilterUpdate(newFilters: any) {
  await updateFilters(newFilters)
}

async function handleValueCreated(valueData: any) {
  const payload = {
    ...valueData,
    product_attribute_id: normalizeAttributeId(valueData.product_attribute_id),
    created_user_id: currentUserId.value ?? undefined
  }
  await handleCreateBase(payload)
  await refresh()
}

async function handleValueUpdated(valueData: any) {
  if (!selectedValue.value) return
  const payload = {
    ...valueData,
    updated_user_id: currentUserId.value ?? undefined
  }
  if (payload.product_attribute_id) {
    payload.product_attribute_id = normalizeAttributeId(payload.product_attribute_id)
  }
  await handleUpdateBase(selectedValue.value.id, payload)
  await refresh()
}

async function deleteValue() {
  if (!selectedValue.value) return
  await handleDeleteBase(selectedValue.value.id)
  await refresh()
}

async function restoreValue(value: any) {
  try {
    const response = await apiClient.put(adminEndpoints.productAttributeValues.restore(value.id))
    if (response.data?.success) {
      await refresh()
      showSuccess('Giá trị thuộc tính đã được khôi phục thành công')
    } else {
      showError('Không thể khôi phục giá trị thuộc tính')
    }
  } catch (error) {
    showError('Không thể khôi phục giá trị thuộc tính')
  }
}

function handlePageChange(page: number) {
  changePage(page)
}

function getRowActions(value: any) {
  const actions = []
  actions.push({
    label: value.deleted_at ? 'Khôi phục' : 'Xóa',
    action: () => value.deleted_at ? restoreValue(value) : confirmDelete(value),
    icon: value.deleted_at ? 'refresh' : 'trash'
  })
  return actions
}

function resolveMediaUrl(path: string) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  if (path.startsWith('/')) return `${apiBaseUrl}${path}`
  if (path.startsWith('storage/')) return `${apiBaseUrl}/${path}`
  return `${apiBaseUrl}/storage/${path}`
}

function normalizeBadgeColor(rawColor: string, fallback: string) {
  if (!rawColor) return fallback
  const lowered = rawColor.toString().toLowerCase()
  if (badgeColorTokens.includes(lowered)) return lowered
  const matched = badgeColorTokens.find(token => lowered.includes(token))
  return matched || fallback
}

function normalizeAttributeId(value: any) {
  const parsed = Number(value)
  return Number.isNaN(parsed) ? value : parsed
}
</script>

<style scoped>
.table-responsive {
  overflow-x: auto;
}
</style>

