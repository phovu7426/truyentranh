import { ref, computed, type Ref, type ComputedRef } from 'vue'
import { useUrlApiSync } from '@/composables/utils/useUrlApiSync'
import { useToast } from '@/composables/ui/useToast'
import { useSerialNumber, useAdminModals } from '@/composables/ui'
import { useGlobalApiClient } from '@/composables/api'
import type { AdminEndpoints } from '@/api/endpoints'

/**
 * Options cho useAdminListPage
 */
export interface UseAdminListPageOptions {
  /**
   * Endpoints cho CRUD operations
   */
  endpoints: {
    list: string
    create?: string
    update?: (id: string | number) => string
    delete?: (id: string | number) => string
    show?: (id: string | number) => string
  }
  
  /**
   * Transform item trước khi hiển thị
   */
  transformItem?: (item: any) => any
  
  /**
   * Custom title và button text
   */
  defaults?: {
    title?: string
    createButtonText?: string
  }
  
  /**
   * Callback khi item được tạo
   */
  onCreated?: (item: any) => void
  
  /**
   * Callback khi item được cập nhật
   */
  onUpdated?: (item: any) => void
  
  /**
   * Callback khi item bị xóa
   */
  onDeleted?: (id: string | number) => void
  
  /**
   * Custom error messages
   */
  messages?: {
    createSuccess?: string
    createError?: string
    updateSuccess?: string
    updateError?: string
    deleteSuccess?: string
    deleteError?: string
  }
  
  /**
   * Có cần fetch detail trước khi edit không
   */
  fetchDetailBeforeEdit?: boolean
  
  /**
   * Custom modals cần thêm vào
   */
  customModals?: string[]
}

/**
 * Kết quả trả về từ useAdminListPage
 */
export interface UseAdminListPageResult {
  // State
  items: Ref<any[]>
  loading: Ref<boolean>
  pagination: Ref<any>
  filters: Ref<any>
  apiErrors: Ref<any>
  hasData: ComputedRef<boolean>
  
  // Modals
  modals: Ref<any>
  selectedItem: Ref<any>
  openCreateModal: () => void
  closeCreateModal: () => void
  openEditModal: (item: any) => void
  closeEditModal: () => void
  openDeleteModal: (item: any) => void
  closeDeleteModal: () => void
  
  // Actions
  updateFilters: (newFilters: any) => void
  changePage: (page: number) => void
  refresh: () => void
  clearApiErrors: () => void
  handleCreate: (itemData: any) => Promise<void>
  handleUpdate: (id: string | number, itemData: any) => Promise<void>
  handleDelete: (id: string | number) => Promise<void>
  
  // Utils
  getSerialNumber: (index: number) => number
  showSuccess: (message: string) => void
  showError: (message: string) => void
}

/**
 * Composable để quản lý trang admin list với CRUD operations
 * 
 * @example
 * ```ts
 * const {
 *   items,
 *   loading,
 *   pagination,
 *   modals,
 *   selectedItem,
 *   openCreateModal,
 *   handleCreate,
 *   handleUpdate,
 *   handleDelete
 * } = useAdminListPage({
 *   endpoints: {
 *     list: adminEndpoints.coupons.list,
 *     create: adminEndpoints.coupons.create,
 *     update: (id) => adminEndpoints.coupons.update(id),
 *     delete: (id) => adminEndpoints.coupons.delete(id)
 *   },
 *   defaults: {
 *     title: 'Quản lý mã giảm giá',
 *     createButtonText: 'Thêm mã giảm giá mới'
 *   }
 * })
 * ```
 */
export function useAdminListPage(options: UseAdminListPageOptions): UseAdminListPageResult {
  const {
    endpoints,
    transformItem,
    onCreated,
    onUpdated,
    onDeleted,
    messages = {},
    fetchDetailBeforeEdit = false,
    customModals = []
  } = options
  
  const { apiClient } = useGlobalApiClient()
  const { showSuccess: toastSuccess, showError: toastError } = useToast()
  
  // Setup URL API sync
  const composable = useUrlApiSync({
    endpoint: endpoints.list,
    createEndpoint: endpoints.create,
    updateEndpoint: endpoints.update,
    deleteEndpoint: endpoints.delete,
    transformItem
  })
  
  const {
    items,
    loading,
    pagination,
    filters,
    updateFilters,
    changePage,
    refresh,
    apiErrors,
    clearApiErrors
  } = composable
  
  // Setup modals
  const {
    modals,
    selectedItem,
    openCreateModal,
    closeCreateModal,
    openEditModal: openEditModalBase,
    closeEditModal,
    openDeleteModal,
    closeDeleteModal,
    openModal,
    closeModal
  } = useAdminModals({ clearApiErrors, customModals })
  
  // Setup serial number
  const { getSerialNumber } = useSerialNumber(pagination)
  
  // Computed
  const hasData = computed(() => items.value.length > 0)
  
  // Custom openEditModal nếu cần fetch detail
  const openEditModal = async (item: any) => {
    if (fetchDetailBeforeEdit && endpoints.show && item?.id) {
      try {
        const showEndpoint = typeof endpoints.show === 'function' ? endpoints.show(item.id) : endpoints.show
        const response = await apiClient.get(showEndpoint)
        const data = response.data?.data || response.data
        openEditModalBase(data)
      } catch (error: any) {
        toastError(messages.updateError || 'Không thể tải thông tin chi tiết')
        // Fallback to original item
        openEditModalBase(item)
      }
    } else {
      openEditModalBase(item)
    }
  }
  
  // Handle create
  const handleCreate = async (itemData: any) => {
    try {
      const createdItem = await composable.createItem?.(itemData)
      if (createdItem) {
        toastSuccess(messages.createSuccess || 'Tạo mới thành công')
        closeCreateModal()
        if (onCreated) {
          onCreated(createdItem)
        }
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || messages.createError || 'Có lỗi xảy ra khi tạo mới'
      toastError(errorMessage)
    }
  }
  
  // Handle update
  const handleUpdate = async (id: string | number, itemData: any) => {
    try {
      const updatedItem = await composable.updateItem?.(id, itemData)
      if (updatedItem) {
        toastSuccess(messages.updateSuccess || 'Cập nhật thành công')
        closeEditModal()
        if (onUpdated) {
          onUpdated(updatedItem)
        }
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || messages.updateError || 'Có lỗi xảy ra khi cập nhật'
      toastError(errorMessage)
    }
  }
  
  // Handle delete
  const handleDelete = async (id: string | number) => {
    try {
      await composable.deleteItem?.(id)
      toastSuccess(messages.deleteSuccess || 'Xóa thành công')
      closeDeleteModal()
      if (onDeleted) {
        onDeleted(id)
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || messages.deleteError || 'Có lỗi xảy ra khi xóa'
      toastError(errorMessage)
    }
  }
  
  return {
    // State
    items,
    loading,
    pagination,
    filters,
    apiErrors,
    hasData,
    
    // Modals
    modals,
    selectedItem,
    openCreateModal,
    closeCreateModal,
    openEditModal,
    closeEditModal,
    openDeleteModal,
    closeDeleteModal,
    
    // Actions
    updateFilters,
    changePage,
    refresh,
    clearApiErrors,
    handleCreate,
    handleUpdate,
    handleDelete,
    
    // Utils
    getSerialNumber,
    showSuccess: toastSuccess,
    showError: toastError
  }
}

export default useAdminListPage

