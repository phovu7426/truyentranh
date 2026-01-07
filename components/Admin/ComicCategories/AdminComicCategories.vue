<template>
  <div class="admin-comic-categories">
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
      :on-update="handleFilterUpdate"
    >
      <!-- Default filter -->
      <ComicCategoriesFilter
        :initial-filters="filters"
        @update:filters="handleFilterUpdate"
      />
    </slot>

    <!-- Table (allow override via slot) -->
    <slot
      name="table"
      :items="items"
      :loading="loading"
      :get-serial-number="getSerialNumber"
      :on-edit="openEditModal"
      :on-delete="confirmDelete"
    >
      <!-- Default table -->
      <div class="bg-white shadow-md rounded-lg overflow-hidden">
        <SkeletonLoader v-if="loading" type="table" :rows="5" :columns="4" />
        <table v-else class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên danh mục</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(category, index) in items" :key="category.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ getSerialNumber(index) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ category.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ category.slug }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <Actions 
                  :item="category"
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
      :api-errors="apiErrors"
      :on-close="closeCreateModal"
      :on-created="handleCategoryCreated"
    >
      <CreateComicCategory
        v-if="modals.create"
        :show="modals.create"
        :api-errors="apiErrors"
        :on-close="closeCreateModal"
        @created="handleCategoryCreated"
      />
    </slot>

    <!-- Edit Modal (slot) -->
    <slot
      name="edit-modal"
      :modals="modals"
      :category="selectedCategory"
      :api-errors="apiErrors"
      :on-close="closeEditModal"
      :on-updated="handleCategoryUpdated"
    >
      <EditComicCategory
        v-if="modals.edit"
        :show="modals.edit"
        :category="selectedCategory"
        :api-errors="apiErrors"
        :on-close="closeEditModal"
        @updated="handleCategoryUpdated"
      />
    </slot>

    <!-- Delete Modal (slot) -->
    <slot
      name="delete-modal"
      :modals="modals"
      :category="selectedCategory"
      :on-close="closeDeleteModal"
      :on-confirm="deleteCategory"
    >
      <ConfirmModal
        v-if="modals.delete"
        :show="modals.delete"
        title="Xác nhận xóa"
        :message="`Bạn có chắc chắn muốn xóa danh mục ${selectedCategory?.name || ''}?`"
        :on-close="closeDeleteModal"
        @confirm="deleteCategory"
      />
    </slot>
  </div>
</template>

<script setup lang="ts">
// Vue
import { defineAsyncComponent } from 'vue'

// Composables
import { useAdminListPage } from '@/composables/admin'
import { adminEndpoints } from '@/api/endpoints'

// Components
import SkeletonLoader from '@/components/Core/Loading/SkeletonLoader.vue'
import ConfirmModal from '@/components/Core/Modal/ConfirmModal.vue'
import Actions from '@/components/Core/Actions/Actions.vue'
import Pagination from '@/components/Core/Navigation/Pagination.vue'
import ComicCategoriesFilter from './ComicCategoriesFilter.vue'

// Props
interface Props {
  title?: string
  createButtonText?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Quản lý danh mục truyện',
  createButtonText: 'Thêm danh mục mới'
})

// Emits
const emit = defineEmits<{
  created: [category: any]
  updated: [category: any]
  deleted: [id: string | number]
}>()

// Lazy load components
const CreateComicCategory = defineAsyncComponent(() => import('./CreateComicCategory.vue'))
const EditComicCategory = defineAsyncComponent(() => import('./EditComicCategory.vue'))

// Use admin list page composable
const {
  items,
  loading,
  pagination,
  filters,
  apiErrors,
  modals,
  selectedItem: selectedCategory,
  openCreateModal,
  closeCreateModal,
  openEditModal,
  closeEditModal,
  openDeleteModal: confirmDelete,
  closeDeleteModal,
  updateFilters,
  changePage,
  getSerialNumber,
  handleCreate,
  handleUpdate,
  handleDelete
} = useAdminListPage({
  endpoints: {
    list: adminEndpoints.comicCategories.list,
    create: adminEndpoints.comicCategories.create,
    update: (id) => adminEndpoints.comicCategories.update(id),
    delete: (id) => adminEndpoints.comicCategories.delete(id)
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

async function handleFilterUpdate(newFilters: any) {
  await updateFilters(newFilters)
}

async function handleCategoryCreated(data: any) {
  await handleCreate(data)
}

async function handleCategoryUpdated(data: any) {
  if (!selectedCategory.value) return
  await handleUpdate(selectedCategory.value.id, data)
}

async function deleteCategory() {
  if (!selectedCategory.value) return
  await handleDelete(selectedCategory.value.id)
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



