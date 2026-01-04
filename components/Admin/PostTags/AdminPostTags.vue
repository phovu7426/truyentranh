<template>
  <div class="admin-post-tags">
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
      <PostTagsFilter
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
      :get-status-text="getStatusText"
      :get-status-class="getStatusClass"
      :on-edit="openEditModal"
      :on-delete="confirmDelete"
    >
      <!-- Default table -->
      <div class="bg-white shadow-md rounded-lg overflow-hidden">
        <SkeletonLoader v-if="loading" type="table" :rows="5" :columns="3" />
        <table v-else class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thẻ</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(tag, index) in items" :key="tag.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ getSerialNumber(index) }}</td>
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                      </svg>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ tag.name }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span 
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="getStatusClass(tag.status)"
                >
                  {{ getStatusText(tag.status) }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm font-medium">
                <Actions 
                  :item="tag"
                  @edit="openEditModal"
                  @delete="confirmDelete"
                />
              </td>
            </tr>
            <tr v-if="items.length === 0">
              <td colspan="4" class="px-6 py-4 text-center text-gray-500">
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
      :status-enums="statusEnums"
      :api-errors="apiErrors"
      :on-close="closeCreateModal"
      :on-created="handleTagCreated"
    >
      <CreateTag
        v-if="modals.create"
        :show="modals.create"
        :status-enums="statusEnums"
        :api-errors="apiErrors"
        :on-close="closeCreateModal"
        @created="handleTagCreated"
      />
    </slot>

    <!-- Edit Modal (slot) -->
    <slot
      name="edit-modal"
      :modals="modals"
      :tag="selectedTag"
      :status-enums="statusEnums"
      :api-errors="apiErrors"
      :on-close="closeEditModal"
      :on-updated="handleTagUpdated"
    >
      <EditTag
        v-if="modals.edit"
        :show="modals.edit"
        :tag="selectedTag"
        :status-enums="statusEnums"
        :api-errors="apiErrors"
        :on-close="closeEditModal"
        @updated="handleTagUpdated"
      />
    </slot>

    <!-- Delete Modal (slot) -->
    <slot
      name="delete-modal"
      :modals="modals"
      :tag="selectedTag"
      :on-close="closeDeleteModal"
      :on-confirm="handleDeleteTag"
    >
      <ConfirmModal
        v-if="modals.delete"
        :show="modals.delete"
        title="Xác nhận xóa"
        :message="`Bạn có chắc chắn muốn xóa thẻ ${selectedTag?.name || ''}?`"
        :on-close="closeDeleteModal"
        @confirm="handleDeleteTag"
      />
    </slot>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAdminListPage } from '@/composables/admin'
import { useGlobalApiClient } from '@/composables/api'
import { adminEndpoints } from '@/api/endpoints'
import SkeletonLoader from '@/components/Core/Loading/SkeletonLoader.vue'
import ConfirmModal from '@/components/Core/Modal/ConfirmModal.vue'
import Actions from '@/components/Core/Actions/Actions.vue'
import Pagination from '@/components/Core/Navigation/Pagination.vue'
import PostTagsFilter from './PostTagsFilter.vue'
import CreateTag from './CreateTag.vue'
import EditTag from './EditTag.vue'

// Props
interface Props {
  title?: string
  createButtonText?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Quản lý thẻ bài viết',
  createButtonText: 'Thêm thẻ mới'
})

// Emits
const emit = defineEmits<{
  created: [tag: any]
  updated: [tag: any]
  deleted: [id: string | number]
}>()

// Use admin list page composable
const {
  items,
  loading,
  pagination,
  filters,
  apiErrors,
  modals,
  selectedItem: selectedTag,
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
    list: adminEndpoints.postTags.list,
    create: adminEndpoints.postTags.create,
    update: (id) => adminEndpoints.postTags.update(id),
    delete: (id) => adminEndpoints.postTags.delete(id)
  },
  defaults: {
    title: props.title,
    createButtonText: props.createButtonText
  },
  messages: {
    createSuccess: 'Thẻ đã được tạo thành công',
    createError: 'Không thể tạo thẻ',
    updateSuccess: 'Thẻ đã được cập nhật thành công',
    updateError: 'Không thể cập nhật thẻ',
    deleteSuccess: 'Xóa thẻ thành công',
    deleteError: 'Không thể xóa thẻ'
  },
  onCreated: (item) => emit('created', item),
  onUpdated: (item) => emit('updated', item),
  onDeleted: (id) => emit('deleted', id)
})

const { apiClient } = useGlobalApiClient()
const statusEnums = ref([])
const enumsLoaded = ref(false)

onMounted(async () => {
  if (!enumsLoaded.value) {
    await loadEnums()
    enumsLoaded.value = true
  }
})

async function loadEnums() {
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

async function handleTagCreated(data: any) {
  await handleCreate(data)
}

async function handleTagUpdated(data: any) {
  if (!selectedTag.value) return
  await handleUpdate(selectedTag.value.id, data)
}

async function handleDeleteTag() {
  if (!selectedTag.value) return
  await handleDelete(selectedTag.value.id)
}

function handlePageChange(page: number) {
  changePage(page)
}

function getStatusText(status: string) {
  const found = (statusEnums.value as any[]).find(s => s.value === status)
  return found?.label || status || 'Không xác định'
}

function getStatusClass(status: string) {
  const found = (statusEnums.value as any[]).find(s => s.value === status)
  return found?.class || found?.badge_class || found?.color_class || 'bg-gray-100 text-gray-800'
}
</script>

<style scoped>
.table-responsive {
  overflow-x: auto;
}
</style>

