import { ref, type Ref } from 'vue'

// Re-export từ types mới (đã được gộp)
export type { AdminModals } from '@/types/admin'

/**
 * Interface cho kết quả trả về
 */
export interface AdminModalsResult {
  // State
  modals: Ref<AdminModals>
  selectedItem: Ref<any>
  
  // Create modal handlers
  openCreateModal: () => void
  closeCreateModal: () => void
  
  // Edit modal handlers
  openEditModal: (item: any) => void
  closeEditModal: () => void
  
  // Delete modal handlers
  openDeleteModal: (item: any) => void
  closeDeleteModal: () => void
  
  // View modal handlers (optional)
  openViewModal: (item: any) => void
  closeViewModal: () => void
  
  // Custom modal handlers
  openModal: (modalName: string, item?: any) => void
  closeModal: (modalName: string) => void
  
  // Utility
  closeAllModals: () => void
  resetSelectedItem: () => void
}

/**
 * Options cho composable
 */
export interface AdminModalsOptions {
  /**
   * Callback được gọi khi mở modal
   */
  onOpen?: (modalName: string, item?: any) => void
  
  /**
   * Callback được gọi khi đóng modal
   */
  onClose?: (modalName: string) => void
  
  /**
   * Callback để clear API errors (nếu có)
   */
  clearApiErrors?: () => void
  
  /**
   * Các modal tùy chỉnh thêm vào
   */
  customModals?: string[]
  
  /**
   * Có bao gồm view modal không
   */
  includeViewModal?: boolean
}

/**
 * Composable để quản lý các modal trong trang admin CRUD
 * 
 * @example
 * ```ts
 * const {
 *   modals,
 *   selectedItem,
 *   openCreateModal,
 *   closeCreateModal,
 *   openEditModal,
 *   closeEditModal,
 *   openDeleteModal,
 *   closeDeleteModal
 * } = useAdminModals({
 *   clearApiErrors: () => clearApiErrors()
 * })
 * ```
 */
export function useAdminModals(options: AdminModalsOptions = {}): AdminModalsResult {
  const {
    onOpen,
    onClose,
    clearApiErrors,
    customModals = [],
    includeViewModal = false
  } = options
  
  // Initialize modals state
  const initialModals: AdminModals = {
    create: false,
    edit: false,
    delete: false
  }
  
  // Add view modal if needed
  if (includeViewModal) {
    initialModals.view = false
  }
  
  // Add custom modals
  customModals.forEach(modalName => {
    initialModals[modalName] = false
  })
  
  // State
  const modals = ref<AdminModals>(initialModals)
  const selectedItem = ref<any>(null)
  
  // Helper function to handle modal opening
  const handleModalOpen = (modalName: string, item?: any) => {
    modals.value[modalName] = true
    if (item !== undefined) {
      selectedItem.value = item
    }
    if (clearApiErrors) {
      clearApiErrors()
    }
    if (onOpen) {
      onOpen(modalName, item)
    }
  }
  
  // Helper function to handle modal closing
  const handleModalClose = (modalName: string, clearItem: boolean = true) => {
    modals.value[modalName] = false
    if (clearItem) {
      selectedItem.value = null
    }
    if (clearApiErrors) {
      clearApiErrors()
    }
    if (onClose) {
      onClose(modalName)
    }
  }
  
  // Create modal handlers
  const openCreateModal = () => {
    handleModalOpen('create')
  }
  
  const closeCreateModal = () => {
    handleModalClose('create', false) // Don't clear item for create
  }
  
  // Edit modal handlers
  const openEditModal = (item: any) => {
    handleModalOpen('edit', item)
  }
  
  const closeEditModal = () => {
    handleModalClose('edit')
  }
  
  // Delete modal handlers
  const openDeleteModal = (item: any) => {
    handleModalOpen('delete', item)
  }
  
  const closeDeleteModal = () => {
    handleModalClose('delete')
  }
  
  // View modal handlers
  const openViewModal = (item: any) => {
    handleModalOpen('view', item)
  }
  
  const closeViewModal = () => {
    handleModalClose('view')
  }
  
  // Generic modal handlers
  const openModal = (modalName: string, item?: any) => {
    handleModalOpen(modalName, item)
  }
  
  const closeModal = (modalName: string) => {
    handleModalClose(modalName)
  }
  
  // Utility functions
  const closeAllModals = () => {
    Object.keys(modals.value).forEach(key => {
      modals.value[key] = false
    })
    selectedItem.value = null
    if (clearApiErrors) {
      clearApiErrors()
    }
  }
  
  const resetSelectedItem = () => {
    selectedItem.value = null
  }
  
  return {
    // State
    modals,
    selectedItem,
    
    // Create modal handlers
    openCreateModal,
    closeCreateModal,
    
    // Edit modal handlers
    openEditModal,
    closeEditModal,
    
    // Delete modal handlers
    openDeleteModal,
    closeDeleteModal,
    
    // View modal handlers
    openViewModal,
    closeViewModal,
    
    // Custom modal handlers
    openModal,
    closeModal,
    
    // Utility
    closeAllModals,
    resetSelectedItem
  }
}

export default useAdminModals

