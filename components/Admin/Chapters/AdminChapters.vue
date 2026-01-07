<template>
  <div class="admin-chapters">
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
      :comic-enums="comicEnums"
      :on-update="handleFilterUpdate"
    >
      <!-- Default filter -->
      <ChaptersFilter
        :initial-filters="filters"
        :status-enums="statusEnums"
        :comic-enums="comicEnums"
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
      :format-date="formatDate"
      :on-edit="openEditModal"
      :on-delete="confirmDelete"
      :on-restore="restoreChapter"
      :on-reorder="openReorderModal"
      :on-upload-pages="openUploadPagesModal"
      :on-manage-pages="openManagePagesModal"
    >
      <!-- Default table -->
      <div class="bg-white shadow-md rounded-lg overflow-hidden">
        <SkeletonLoader v-if="loading" type="table" :rows="5" :columns="8" />
        <table v-else class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Truyện</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiêu đề</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số chương</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lượt xem</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(chapter, index) in items" :key="chapter.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ getSerialNumber(index) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ chapter.comic?.title || `ID: ${chapter.comic_id}` }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ chapter.title }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ chapter.chapter_label || `Ch. ${chapter.chapter_index}` }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex flex-col space-y-1">
                  <span
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="getStatusClass(chapter.status)"
                  >
                    {{ getStatusLabel(chapter.status) }}
                  </span>
                  <div v-if="chapter.deleted_at" class="text-xs text-red-600">
                    Đã xóa
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ chapter.view_count || 0 }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(chapter.created_at) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <Actions
                  :item="chapter"
                  :show-view="false"
                  :show-delete="false"
                  @edit="openEditModal"
                  :additional-actions="[
                    {
                      label: chapter.deleted_at ? 'Khôi phục' : 'Xóa',
                      action: () => chapter.deleted_at ? restoreChapter(chapter) : confirmDelete(chapter),
                      icon: chapter.deleted_at ? 'refresh' : 'trash'
                    },
                    {
                      label: 'Sắp xếp lại',
                      action: () => openReorderModal(chapter),
                      icon: 'sort'
                    },
                    {
                      label: 'Upload trang',
                      action: () => openUploadPagesModal(chapter),
                      icon: 'upload'
                    },
                    {
                      label: 'Quản lý trang',
                      action: () => openManagePagesModal(chapter),
                      icon: 'images'
                    }
                  ]"
                />
              </td>
            </tr>
            <tr v-if="!items || items.length === 0">
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
      :status-enums="statusEnums"
      :comic-enums="comicEnums"
      :api-errors="apiErrors"
      :on-close="closeCreateModal"
      :on-created="handleChapterCreated"
    >
      <CreateChapter
        v-if="modals.create"
        :show="modals.create"
        :status-enums="statusEnums"
        :comic-enums="comicEnums"
        :api-errors="apiErrors"
        @close="closeCreateModal"
        @created="handleChapterCreated"
      />
    </slot>

    <!-- Edit Modal (slot) -->
    <slot
      name="edit-modal"
      :modals="modals"
      :chapter="selectedItem"
      :status-enums="statusEnums"
      :comic-enums="comicEnums"
      :api-errors="apiErrors"
      :on-close="closeEditModal"
      :on-updated="handleChapterUpdated"
    >
      <EditChapter
        v-if="modals.edit"
        :show="modals.edit"
        :chapter="selectedItem"
        :status-enums="statusEnums"
        :comic-enums="comicEnums"
        :api-errors="apiErrors"
        @close="closeEditModal"
        @updated="handleChapterUpdated"
      />
    </slot>

    <!-- Delete Modal (slot) -->
    <slot
      name="delete-modal"
      :modals="modals"
      :chapter="selectedItem"
      :on-close="closeDeleteModal"
      :on-confirm="deleteChapter"
    >
      <ConfirmModal
        v-if="modals.delete"
        :show="modals.delete"
        title="Xác nhận xóa"
        :message="`Bạn có chắc chắn muốn xóa chương ${selectedItem?.title || ''}?`"
        :on-close="closeDeleteModal"
        @confirm="deleteChapter"
      />
    </slot>

    <!-- Reorder Modal -->
    <ReorderChapterModal
      v-if="modals.reorder"
      :show="modals.reorder"
      :chapter="selectedChapterForAction"
      @close="closeReorderModal"
      @reordered="handleChapterReordered"
    />

    <!-- Upload Pages Modal -->
    <UploadPagesModal
      v-if="modals.uploadPages"
      :show="modals.uploadPages"
      :chapter="selectedChapterForAction"
      @close="closeUploadPagesModal"
      @uploaded="handlePagesUploaded"
    />

    <!-- Manage Pages Modal -->
    <ManagePagesModal
      v-if="modals.managePages"
      :show="modals.managePages"
      :chapter="selectedChapterForAction"
      @close="closeManagePagesModal"
      @updated="handlePagesUpdated"
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
import ChaptersFilter from './ChaptersFilter.vue'

// Props
interface Props {
  title?: string
  createButtonText?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Quản lý chương truyện',
  createButtonText: 'Thêm chương mới'
})

// Emits
const emit = defineEmits<{
  created: [chapter: any]
  updated: [chapter: any]
  deleted: [id: string | number]
}>()

// Lazy load components
const CreateChapter = defineAsyncComponent(() => import('./CreateChapter.vue'))
const EditChapter = defineAsyncComponent(() => import('./EditChapter.vue'))
const ReorderChapterModal = defineAsyncComponent(() => import('./ReorderChapterModal.vue'))
const UploadPagesModal = defineAsyncComponent(() => import('./UploadPagesModal.vue'))
const ManagePagesModal = defineAsyncComponent(() => import('./ManagePagesModal.vue'))

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
    list: adminEndpoints.chapters.list,
    create: adminEndpoints.chapters.create,
    update: (id) => adminEndpoints.chapters.update(id),
    delete: (id) => adminEndpoints.chapters.delete(id),
    show: (id) => adminEndpoints.chapters.show(id)
  },
  defaults: {
    title: props.title,
    createButtonText: props.createButtonText
  },
  messages: {
    createSuccess: 'Chương đã được tạo thành công',
    createError: 'Không thể tạo chương',
    updateSuccess: 'Chương đã được cập nhật thành công',
    updateError: 'Không thể cập nhật chương',
    deleteSuccess: 'Chương đã được xóa thành công',
    deleteError: 'Không thể xóa chương'
  },
  fetchDetailBeforeEdit: true,
  customModals: ['reorder', 'uploadPages', 'managePages'],
  onCreated: (item) => emit('created', item),
  onUpdated: (item) => emit('updated', item),
  onDeleted: (id) => emit('deleted', id)
})

// Custom modal handlers - use the same modals instance from useAdminListPage
function openModal(modalName: string) {
  if (modals.value && modalName in modals.value) {
    modals.value[modalName] = true
    clearApiErrors()
  }
}

function closeModal(modalName: string) {
  if (modals.value && modalName in modals.value) {
    modals.value[modalName] = false
    clearApiErrors()
  }
}

const { apiClient } = useGlobalApiClient()

const statusEnums = ref([
  { value: 'draft', label: 'Nháp' },
  { value: 'published', label: 'Đã xuất bản' }
])
const comicEnums = ref([])
const selectedChapterForAction = ref<any>(null)

onMounted(async () => {
  await fetchComicEnums()
})

async function fetchComicEnums() {
  try {
    const response = await apiClient.get(adminEndpoints.comics.simple)
    if (response.data?.success) {
      comicEnums.value = response.data.data || []
    } else {
      comicEnums.value = []
    }
  } catch (e) {
    comicEnums.value = []
  }
}

async function handleFilterUpdate(newFilters: any) {
  await updateFilters(newFilters)
}

async function handleChapterCreated(chapterData: any) {
  await handleCreate(chapterData)
}

async function handleChapterUpdated(chapterData: any) {
  if (!selectedItem.value) return
  await handleUpdate(selectedItem.value.id, chapterData)
}

async function deleteChapter() {
  if (!selectedItem.value) return
  await handleDelete(selectedItem.value.id)
}

async function restoreChapter(chapter: any) {
  try {
    const response = await apiClient.post(adminEndpoints.chapters.restore(chapter.id))
    if (response.data?.success) {
      showSuccess('Chương đã được khôi phục thành công')
      refresh()
    } else {
      showError('Không thể khôi phục chương')
    }
  } catch (error) {
    showError('Không thể khôi phục chương')
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

function getStatusLabel(status: string) {
  const found = (statusEnums.value as any[]).find(s => s.value === status)
  return found?.label || status || 'Không xác định'
}

function getStatusClass(status: string) {
  const statusClasses: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    published: 'bg-green-100 text-green-800'
  }
  return statusClasses[status] || 'bg-gray-100 text-gray-800'
}

async function handlePageChange(page: number) {
  await changePage(page)
}

// Reorder Modal
function openReorderModal(chapter: any) {
  selectedChapterForAction.value = chapter
  openModal('reorder')
}

function closeReorderModal() {
  closeModal('reorder')
  selectedChapterForAction.value = null
}

async function handleChapterReordered() {
  showSuccess('Sắp xếp lại chương thành công')
  closeReorderModal()
  refresh()
}

// Upload Pages Modal
function openUploadPagesModal(chapter: any) {
  selectedChapterForAction.value = chapter
  openModal('uploadPages')
}

function closeUploadPagesModal() {
  closeModal('uploadPages')
  selectedChapterForAction.value = null
}

async function handlePagesUploaded() {
  showSuccess('Upload trang thành công')
  closeUploadPagesModal()
  refresh()
}

// Manage Pages Modal
function openManagePagesModal(chapter: any) {
  selectedChapterForAction.value = chapter
  openModal('managePages')
}

function closeManagePagesModal() {
  closeModal('managePages')
  selectedChapterForAction.value = null
}

async function handlePagesUpdated() {
  showSuccess('Cập nhật trang thành công')
  closeManagePagesModal()
  refresh()
}
</script>

<style scoped>
.table-responsive {
  overflow-x: auto;
}
</style>



