<template>
  <div class="admin-comics">
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
      <ComicsFilter
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
      :get-category-names="getCategoryNames"
      :format-date="formatDate"
      :on-edit="openEditModal"
      :on-delete="confirmDelete"
      :on-restore="restoreComic"
      :on-upload-cover="openUploadCoverModal"
      :on-assign-categories="openAssignCategoriesModal"
    >
      <!-- Default table -->
      <div class="bg-white shadow-md rounded-lg overflow-hidden">
        <SkeletonLoader v-if="loading" type="table" :rows="5" :columns="7" />
        <table v-else class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ảnh bìa</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiêu đề</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Danh mục</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(comic, index) in items" :key="comic.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ getSerialNumber(index) }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <img 
                  v-if="comic.cover_image" 
                  :src="comic.cover_image" 
                  :alt="comic.title"
                  class="h-12 w-12 object-cover rounded"
                />
                <span v-else class="text-gray-400 text-xs">Chưa có</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ comic.title }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ getCategoryNames(comic.categories) }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex flex-col space-y-1">
                  <span
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="getStatusClass(comic.status)"
                  >
                    {{ getStatusLabel(comic.status) }}
                  </span>
                  <div v-if="comic.deleted_at" class="text-xs text-red-600">
                    Đã xóa
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(comic.created_at) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <Actions
                  :item="comic"
                  :show-view="false"
                  :show-delete="false"
                  @edit="openEditModal"
                  :additional-actions="[
                    {
                      label: comic.deleted_at ? 'Khôi phục' : 'Xóa',
                      action: () => comic.deleted_at ? restoreComic(comic) : confirmDelete(comic),
                      icon: comic.deleted_at ? 'refresh' : 'trash'
                    },
                    {
                      label: 'Upload ảnh bìa',
                      action: () => openUploadCoverModal(comic),
                      icon: 'image'
                    },
                    {
                      label: 'Gán danh mục',
                      action: () => openAssignCategoriesModal(comic),
                      icon: 'tag'
                    }
                  ]"
                />
              </td>
            </tr>
            <tr v-if="!items || items.length === 0">
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
      :category-enums="categoryEnums"
      :api-errors="apiErrors"
      :on-close="closeCreateModal"
      :on-created="handleComicCreated"
    >
      <CreateComic
        v-if="modals.create"
        :show="modals.create"
        :status-enums="statusEnums"
        :category-enums="categoryEnums"
        :api-errors="apiErrors"
        @close="closeCreateModal"
        @created="handleComicCreated"
      />
    </slot>

    <!-- Edit Modal (slot) -->
    <slot
      name="edit-modal"
      :modals="modals"
      :comic="selectedItem"
      :status-enums="statusEnums"
      :category-enums="categoryEnums"
      :api-errors="apiErrors"
      :on-close="closeEditModal"
      :on-updated="handleComicUpdated"
    >
      <EditComic
        v-if="modals.edit"
        :show="modals.edit"
        :comic="selectedItem"
        :status-enums="statusEnums"
        :category-enums="categoryEnums"
        :api-errors="apiErrors"
        @close="closeEditModal"
        @updated="handleComicUpdated"
      />
    </slot>

    <!-- Delete Modal (slot) -->
    <slot
      name="delete-modal"
      :modals="modals"
      :comic="selectedItem"
      :on-close="closeDeleteModal"
      :on-confirm="deleteComic"
    >
      <ConfirmModal
        v-if="modals.delete"
        :show="modals.delete"
        title="Xác nhận xóa"
        :message="`Bạn có chắc chắn muốn xóa truyện ${selectedItem?.title || ''}?`"
        :on-close="closeDeleteModal"
        @confirm="deleteComic"
      />
    </slot>

    <!-- Upload Cover Modal -->
    <UploadCoverModal
      v-if="modals.uploadCover"
      :show="modals.uploadCover"
      :comic="selectedComicForAction"
      @close="closeUploadCoverModal"
      @uploaded="handleCoverUploaded"
    />

    <!-- Assign Categories Modal -->
    <AssignCategoriesModal
      v-if="modals.assignCategories"
      :show="modals.assignCategories"
      :comic="selectedComicForAction"
      :category-enums="categoryEnums"
      @close="closeAssignCategoriesModal"
      @assigned="handleCategoriesAssigned"
    />
  </div>
</template>

<script setup lang="ts">
// Vue
import { ref, onMounted, computed, defineAsyncComponent } from 'vue'

// Composables
import { useToast } from '@/composables/ui/useToast'
import { useGlobalApiClient } from '@/composables/api'
import { useAdminListPage } from '@/composables/admin/useAdminListPage'
import { adminEndpoints } from '@/api/endpoints'

// Components
import SkeletonLoader from '@/components/Core/Loading/SkeletonLoader.vue'
import ConfirmModal from '@/components/Core/Modal/ConfirmModal.vue'
import Actions from '@/components/Core/Actions/Actions.vue'
import Pagination from '@/components/Core/Navigation/Pagination.vue'
import ComicsFilter from './ComicsFilter.vue'

// Props
interface Props {
  title?: string
  createButtonText?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Quản lý truyện tranh',
  createButtonText: 'Thêm truyện mới'
})

// Emits
const emit = defineEmits<{
  created: [comic: any]
  updated: [comic: any]
  deleted: [id: string | number]
}>()

// Lazy load components
const CreateComic = defineAsyncComponent(() => import('./CreateComic.vue'))
const EditComic = defineAsyncComponent(() => import('./EditComic.vue'))
const UploadCoverModal = defineAsyncComponent(() => import('./UploadCoverModal.vue'))
const AssignCategoriesModal = defineAsyncComponent(() => import('./AssignCategoriesModal.vue'))

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
    list: adminEndpoints.comics.list,
    create: adminEndpoints.comics.create,
    update: (id) => adminEndpoints.comics.update(id),
    delete: (id) => adminEndpoints.comics.delete(id),
    show: (id) => adminEndpoints.comics.show(id)
  },
  defaults: {
    title: props.title,
    createButtonText: props.createButtonText
  },
  messages: {
    createSuccess: 'Truyện đã được tạo thành công',
    createError: 'Không thể tạo truyện',
    updateSuccess: 'Truyện đã được cập nhật thành công',
    updateError: 'Không thể cập nhật truyện',
    deleteSuccess: 'Truyện đã được xóa thành công',
    deleteError: 'Không thể xóa truyện'
  },
  fetchDetailBeforeEdit: true,
  customModals: ['uploadCover', 'assignCategories'],
  onCreated: (item) => emit('created', item),
  onUpdated: (item) => emit('updated', item),
  onDeleted: (id) => emit('deleted', id)
})

const { apiClient } = useGlobalApiClient()

const statusEnums = ref([
  { value: 'draft', label: 'Nháp' },
  { value: 'published', label: 'Đã xuất bản' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'hidden', label: 'Ẩn' }
])
const categoryEnums = ref([])
const selectedComicForAction = ref<any>(null)

// Helper functions for custom modal
const openModal = (modalName: string, item?: any) => {
  modals.value[modalName] = true
  if (item !== undefined) {
    selectedItem.value = item
  }
  clearApiErrors()
}

const closeModal = (modalName: string) => {
  modals.value[modalName] = false
  selectedItem.value = null
  clearApiErrors()
}

onMounted(async () => {
  await fetchCategoryEnums()
})

async function fetchCategoryEnums() {
  try {
    const response = await apiClient.get(adminEndpoints.comicCategories.list)
    if (response.data?.success) {
      categoryEnums.value = response.data.data || []
    } else {
      categoryEnums.value = []
    }
  } catch (e) {
    categoryEnums.value = []
  }
}

async function handleFilterUpdate(newFilters: any) {
  await updateFilters(newFilters)
}

async function handleComicCreated(comicData: any) {
  await handleCreate(comicData)
}

async function handleComicUpdated(comicData: any) {
  if (!selectedItem.value) return
  await handleUpdate(selectedItem.value.id, comicData)
}

async function deleteComic() {
  if (!selectedItem.value) return
  await handleDelete(selectedItem.value.id)
}

async function restoreComic(comic: any) {
  try {
    const response = await apiClient.post(adminEndpoints.comics.restore(comic.id))
    if (response.data?.success) {
      showSuccess('Truyện đã được khôi phục thành công')
      refresh()
    } else {
      showError('Không thể khôi phục truyện')
    }
  } catch (error) {
    showError('Không thể khôi phục truyện')
  }
}

function formatDate(dateString: string) {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function getCategoryNames(categories: any[]) {
  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    return '—'
  }
  return categories.map(cat => cat.name).join(', ')
}

function getStatusLabel(status: string) {
  const found = (statusEnums.value as any[]).find(s => s.value === status)
  return found?.label || status || 'Không xác định'
}

function getStatusClass(status: string) {
  const statusClasses: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    published: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    hidden: 'bg-red-100 text-red-800'
  }
  return statusClasses[status] || 'bg-gray-100 text-gray-800'
}

async function handlePageChange(page: number) {
  await changePage(page)
}

// Upload Cover Modal
function openUploadCoverModal(comic: any) {
  selectedComicForAction.value = comic
  openModal('uploadCover')
}

function closeUploadCoverModal() {
  closeModal('uploadCover')
  selectedComicForAction.value = null
}

async function handleCoverUploaded() {
  showSuccess('Upload ảnh bìa thành công')
  closeUploadCoverModal()
  refresh()
}

// Assign Categories Modal
function openAssignCategoriesModal(comic: any) {
  selectedComicForAction.value = comic
  openModal('assignCategories')
}

function closeAssignCategoriesModal() {
  closeModal('assignCategories')
  selectedComicForAction.value = null
}

async function handleCategoriesAssigned() {
  showSuccess('Gán danh mục thành công')
  closeAssignCategoriesModal()
  refresh()
}
</script>

<style scoped>
.table-responsive {
  overflow-x: auto;
}
</style>

