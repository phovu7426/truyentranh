<template>
  <div class="admin-banners">
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
      :location-enums="locationEnums"
      :on-update="handleFilterUpdate"
    >
      <!-- Default filter -->
      <BannersFilter
        :initial-filters="filters"
        :status-enums="statusEnums"
        :location-enums="locationEnums"
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
      :format-date="formatDate"
      :handle-image-error="handleImageError"
      :on-edit="openEditModal"
      :on-delete="confirmDelete"
      :on-toggle-status="toggleStatus"
      :on-restore="restoreBanner"
    >
      <!-- Default table -->
      <div class="bg-white shadow-md rounded-lg overflow-hidden">
        <SkeletonLoader v-if="loading" type="table" :rows="5" :columns="7" />
        <table v-else class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Banner</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vị trí</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thứ tự</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(banner, index) in items" :key="banner.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ getSerialNumber(index) }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <img 
                      v-if="banner.image" 
                      :src="getImageUrl(banner.image)" 
                      :alt="banner.title"
                      class="h-10 w-10 rounded-full object-cover"
                      :crossorigin="banner.image && (banner.image.startsWith('http://') || banner.image.startsWith('https://')) ? 'anonymous' : undefined"
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
                    <div class="text-sm font-medium text-gray-900">{{ banner.title }}</div>
                    <div class="text-sm text-gray-500">{{ banner.subtitle || '—' }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ banner.location?.name || banner.location_name || '—' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ banner.sort_order || 0 }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex flex-col space-y-1">
                  <span
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="getStatusClass(banner.status)"
                  >
                    {{ getStatusLabel(banner.status) }}
                  </span>
                  <div v-if="banner.start_date || banner.end_date" class="text-xs text-gray-500">
                    <div v-if="banner.start_date">Bắt đầu: {{ formatDate(banner.start_date) }}</div>
                    <div v-if="banner.end_date">Kết thúc: {{ formatDate(banner.end_date) }}</div>
                  </div>
                  <div v-if="banner.deleted_at" class="text-xs text-red-600">
                    Đã xóa
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <Actions
                    :item="banner"
                    :show-view="false"
                    :show-delete="false"
                    @edit="openEditModal"
                    :additional-actions="[
                      {
                        label: banner.status === 'active' ? 'Vô hiệu hóa' : 'Kích hoạt',
                        action: () => toggleStatus(banner),
                        icon: banner.status === 'active' ? 'eye-off' : 'eye'
                      },
                      {
                        label: banner.deleted_at ? 'Khôi phục' : 'Xóa',
                        action: () => banner.deleted_at ? restoreBanner(banner) : confirmDelete(banner),
                        icon: banner.deleted_at ? 'refresh' : 'trash'
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
      :location-enums="locationEnums"
      :api-errors="apiErrors"
      :on-close="closeCreateModal"
      :on-created="handleBannerCreated"
    >
      <CreateBanner
        v-if="modals.create"
        :show="modals.create"
        :status-enums="statusEnums"
        :location-enums="locationEnums"
        :api-errors="apiErrors"
        :on-close="closeCreateModal"
        @created="handleBannerCreated"
      />
    </slot>

    <!-- Edit Modal (slot) -->
    <slot
      name="edit-modal"
      :modals="modals"
      :banner-id="selectedItem?.id"
      :status-enums="statusEnums"
      :location-enums="locationEnums"
      :api-errors="apiErrors"
      :on-close="closeEditModal"
      :on-updated="handleBannerUpdated"
    >
      <EditBanner
        v-if="modals.edit"
        :show="modals.edit"
        :banner-id="selectedItem?.id"
        :status-enums="statusEnums"
        :location-enums="locationEnums"
        :api-errors="apiErrors"
        :on-close="closeEditModal"
        @updated="handleBannerUpdated"
      />
    </slot>

    <!-- Delete Modal (slot) -->
    <slot
      name="delete-modal"
      :modals="modals"
      :banner="selectedItem"
      :on-close="closeDeleteModal"
      :on-confirm="deleteBanner"
    >
      <ConfirmModal
        v-if="modals.delete"
        :show="modals.delete"
        title="Xác nhận xóa"
        :message="`Bạn có chắc chắn muốn xóa banner ${selectedItem?.title || ''}?`"
        :on-close="closeDeleteModal"
        @confirm="deleteBanner"
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
import BannersFilter from './BannersFilter.vue'

// Props
interface Props {
  title?: string
  createButtonText?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Quản lý banner',
  createButtonText: 'Thêm banner mới'
})

// Emits
const emit = defineEmits<{
  created: [banner: any]
  updated: [banner: any]
  deleted: [id: string | number]
}>()

// Lazy load components
const CreateBanner = defineAsyncComponent(() => import('./CreateBanner.vue'))
const EditBanner = defineAsyncComponent(() => import('./EditBanner.vue'))

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
    list: adminEndpoints.banners.list,
    create: adminEndpoints.banners.create,
    update: (id) => adminEndpoints.banners.update(id),
    delete: (id) => adminEndpoints.banners.delete(id)
  },
  defaults: {
    title: props.title,
    createButtonText: props.createButtonText
  },
  messages: {
    createSuccess: 'Banner đã được tạo thành công',
    createError: 'Không thể tạo banner',
    updateSuccess: 'Banner đã được cập nhật thành công',
    updateError: 'Không thể cập nhật banner',
    deleteSuccess: 'Banner đã được xóa thành công',
    deleteError: 'Không thể xóa banner'
  },
  onCreated: (item) => emit('created', item),
  onUpdated: (item) => emit('updated', item),
  onDeleted: (id) => emit('deleted', id)
})

const { apiClient } = useGlobalApiClient()
const config = useRuntimeConfig()

const statusEnums = ref([])
const locationEnums = ref([])
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

function formatDate(dateString: string) {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
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
    const response = await apiClient.get(adminEndpoints.bannerLocations.list)
    if (response.data?.success) {
      locationEnums.value = response.data.data || []
    } else {
      locationEnums.value = []
    }
  } catch (e) {
    locationEnums.value = []
  }
}

async function handleFilterUpdate(newFilters: any) {
  await updateFilters(newFilters)
}

async function handleBannerCreated(bannerData: any) {
  await handleCreate(bannerData)
}

async function handleBannerUpdated(bannerData: any) {
  if (!selectedItem.value) return
  await handleUpdate(selectedItem.value.id, bannerData)
}

async function deleteBanner() {
  if (!selectedItem.value) return
  await handleDelete(selectedItem.value.id)
}

async function toggleStatus(banner: any) {
  try {
    const newStatus = banner.status === 'active' ? 'inactive' : 'active'
    const response = await apiClient.patch(adminEndpoints.banners.updateStatus(banner.id), {
      status: newStatus
    })
    if (response.data?.success) {
      showSuccess(`Đã ${newStatus === 'active' ? 'kích hoạt' : 'vô hiệu hóa'} banner`)
      refresh()
    } else {
      showError('Không thể cập nhật trạng thái banner')
    }
  } catch (error) {
    showError('Không thể cập nhật trạng thái banner')
  }
}

async function restoreBanner(banner: any) {
  try {
    const response = await apiClient.put(adminEndpoints.banners.restore(banner.id))
    if (response.data?.success) {
      showSuccess('Banner đã được khôi phục thành công')
      refresh()
    } else {
      showError('Không thể khôi phục banner')
    }
  } catch (error) {
    showError('Không thể khôi phục banner')
  }
}

function handlePageChange(page: number) {
  changePage(page)
}
</script>

<style scoped>
.table-responsive {
  overflow-x: auto;
}
</style>

