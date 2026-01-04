<template>
  <div class="admin-posts">
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
      <PostsFilter
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
      :on-restore="restorePost"
    >
      <!-- Default table -->
      <div class="bg-white shadow-md rounded-lg overflow-hidden">
        <SkeletonLoader v-if="loading" type="table" :rows="5" :columns="6" />
        <table v-else class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiêu đề</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Danh mục</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(post, index) in items" :key="post.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ getSerialNumber(index) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ post.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ getCategoryNames(post.categories) }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex flex-col space-y-1">
                  <div class="flex space-x-2">
                    <span
                      class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      :class="getStatusClass(post.status)"
                    >
                      {{ getStatusLabel(post.status) }}
                    </span>
                  </div>
                  <div v-if="post.deleted_at" class="text-xs text-red-600">
                    Đã xóa
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(post.created_at) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <Actions
                    :item="post"
                    :show-view="false"
                    :show-delete="false"
                    @edit="openEditModal"
                    :additional-actions="[
                      {
                        label: post.deleted_at ? 'Khôi phục' : 'Xóa',
                        action: () => post.deleted_at ? restorePost(post) : confirmDelete(post),
                        icon: post.deleted_at ? 'refresh' : 'trash'
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
      :post-type-enums="postTypeEnums"
      :category-enums="categoryEnums"
      :tag-enums="tagEnums"
      :api-errors="apiErrors"
      :on-close="closeCreateModal"
      :on-created="handlePostCreated"
    >
      <CreatePost
        v-if="modals.create"
        :show="modals.create"
        :status-enums="statusEnums"
        :post-type-enums="postTypeEnums"
        :category-enums="categoryEnums"
        :tag-enums="tagEnums"
        :api-errors="apiErrors"
        @close="closeCreateModal"
        @created="handlePostCreated"
      />
    </slot>

    <!-- Edit Modal (slot) -->
    <slot
      name="edit-modal"
      :modals="modals"
      :post="selectedItem"
      :status-enums="statusEnums"
      :post-type-enums="postTypeEnums"
      :category-enums="categoryEnums"
      :tag-enums="tagEnums"
      :api-errors="apiErrors"
      :on-close="closeEditModal"
      :on-updated="handlePostUpdated"
    >
      <EditPost
        v-if="modals.edit"
        :show="modals.edit"
        :post="selectedItem"
        :status-enums="statusEnums"
        :post-type-enums="postTypeEnums"
        :category-enums="categoryEnums"
        :tag-enums="tagEnums"
        :api-errors="apiErrors"
        @close="closeEditModal"
        @updated="handlePostUpdated"
      />
    </slot>

    <!-- Delete Modal (slot) -->
    <slot
      name="delete-modal"
      :modals="modals"
      :post="selectedItem"
      :on-close="closeDeleteModal"
      :on-confirm="deletePost"
    >
      <ConfirmModal
        v-if="modals.delete"
        :show="modals.delete"
        title="Xác nhận xóa"
        :message="`Bạn có chắc chắn muốn xóa bài viết ${selectedItem?.name || ''}?`"
        :on-close="closeDeleteModal"
        @confirm="deletePost"
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
import PostsFilter from './PostsFilter.vue'

// Props
interface Props {
  title?: string
  createButtonText?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Quản lý bài viết',
  createButtonText: 'Thêm bài viết mới'
})

// Emits
const emit = defineEmits<{
  created: [post: any]
  updated: [post: any]
  deleted: [id: string | number]
}>()

// Lazy load components
const CreatePost = defineAsyncComponent(() => import('./CreatePost.vue'))
const EditPost = defineAsyncComponent(() => import('./EditPost.vue'))

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
    list: adminEndpoints.posts.list,
    create: adminEndpoints.posts.create,
    update: (id) => adminEndpoints.posts.update(id),
    delete: (id) => adminEndpoints.posts.delete(id),
    show: (id) => adminEndpoints.posts.show(id)
  },
  defaults: {
    title: props.title,
    createButtonText: props.createButtonText
  },
  messages: {
    createSuccess: 'Bài viết đã được tạo thành công',
    createError: 'Không thể tạo bài viết',
    updateSuccess: 'Bài viết đã được cập nhật thành công',
    updateError: 'Không thể cập nhật bài viết',
    deleteSuccess: 'Bài viết đã được xóa thành công',
    deleteError: 'Không thể xóa bài viết'
  },
  fetchDetailBeforeEdit: true,
  onCreated: (item) => emit('created', item),
  onUpdated: (item) => emit('updated', item),
  onDeleted: (id) => emit('deleted', id)
})

const { apiClient } = useGlobalApiClient()

const statusEnums = ref([])
const postTypeEnums = ref([])
const categoryEnums = ref([])
const tagEnums = ref([])
const enumsLoaded = ref(false)

onMounted(async () => {
  if (!enumsLoaded.value) {
    await fetchEnums()
    enumsLoaded.value = true
  }
})

async function fetchEnums() {
  try {
    const response = await apiClient.get(adminEndpoints.enums.byName('post_status'))
    if (response.data?.success) {
      statusEnums.value = response.data.data || []
    } else {
      statusEnums.value = []
    }
  } catch (e) {
    statusEnums.value = []
  }
  
  try {
    const response = await apiClient.get(adminEndpoints.enums.byName('post_type'))
    if (response.data?.success) {
      postTypeEnums.value = response.data.data || []
    } else {
      postTypeEnums.value = []
    }
  } catch (e) {
    postTypeEnums.value = []
  }
  
  try {
    const response = await apiClient.get(adminEndpoints.postCategories.list)
    if (response.data?.success) {
      categoryEnums.value = response.data.data || []
    } else {
      categoryEnums.value = []
    }
  } catch (e) {
    categoryEnums.value = []
  }
  
  try {
    const response = await apiClient.get(adminEndpoints.postTags.list)
    if (response.data?.success) {
      tagEnums.value = response.data.data || []
    } else {
      tagEnums.value = []
    }
  } catch (e) {
    tagEnums.value = []
  }
}

async function handleFilterUpdate(newFilters: any) {
  await updateFilters(newFilters)
}

async function handlePostCreated(postData: any) {
  await handleCreate(postData)
}

async function handlePostUpdated(postData: any) {
  if (!selectedItem.value) return
  await handleUpdate(selectedItem.value.id, postData)
}

async function deletePost() {
  if (!selectedItem.value) return
  await handleDelete(selectedItem.value.id)
}

async function restorePost(post: any) {
  try {
    const response = await apiClient.put(adminEndpoints.posts.restore(post.id))
    if (response.data?.success) {
      showSuccess('Bài viết đã được khôi phục thành công')
      refresh()
    } else {
      showError('Không thể khôi phục bài viết')
    }
  } catch (error) {
    showError('Không thể khôi phục bài viết')
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
  const found = (statusEnums.value as any[]).find(s => s.value === status)
  return found?.class || found?.badge_class || found?.color_class || 'bg-gray-100 text-gray-800'
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

