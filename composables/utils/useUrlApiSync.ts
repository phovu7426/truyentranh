import { ref, type Ref } from 'vue'
import { useGlobalApiClient } from '@/composables/api'
import { useUrlListSync } from './useUrlListSync'

/**
 * Composable đơn giản để đồng bộ hóa URL và API
 * - Lấy list theo query URL (page, limit, filter, sort)
 * - Hỗ trợ CRUD cơ bản nếu truyền endpoint tương ứng
 */
export function useUrlApiSync<T extends { id: any } = any>(
  config: {
    endpoint: string
    createEndpoint?: string
    updateEndpoint?: (id: any) => string
    deleteEndpoint?: (id: any) => string
    transformItem?: (item: T) => T
  }
) {
  const { endpoint, createEndpoint, updateEndpoint, deleteEndpoint, transformItem } = config
  const { apiClient } = useGlobalApiClient()

  // Base list composable (URL sync, pagination, filters...)
  const listComposable = useUrlListSync<T>({ endpoint, transformItem })

  const loading = listComposable.loading
  const items = listComposable.items as Ref<T[]>
  const error = listComposable.error
  const pagination = listComposable.pagination
  const filters = listComposable.filters
  const changePage = listComposable.changePage
  const updateFilters = listComposable.updateFilters
  const updateSort = listComposable.updateSort
  const resetFilters = listComposable.resetFilters
  const resetAll = listComposable.resetAll
  const fetchFromUrl = listComposable.fetchFromUrl
  const refresh = listComposable.refresh

  // API errors
  const apiErrors = ref<any>(null)

  // CRUD (chỉ tạo nếu có endpoint)
  const createItem = createEndpoint
    ? async (itemData: any) => {
        loading.value = true
        apiErrors.value = null

        try {
          const response = await apiClient.post(createEndpoint, itemData)
          const payload = response.data?.data ?? response.data
          const newItem = transformItem ? transformItem(payload) : payload

          items.value = [newItem, ...items.value]

          return newItem
        } catch (err: any) {
          apiErrors.value = err.response?.data || err
          throw err
        } finally {
          loading.value = false
        }
      }
    : undefined

  const updateItem = updateEndpoint
    ? async (id: any, itemData: any) => {
        loading.value = true
        apiErrors.value = null

        try {
          const endpoint = updateEndpoint(id)
          const response = await apiClient.put(endpoint, itemData)
          const payload = response.data?.data ?? response.data
          const updatedItem = transformItem ? transformItem(payload) : payload

          const index = items.value.findIndex(item => item.id === id)
          if (index !== -1) {
            items.value = [
              ...items.value.slice(0, index),
              updatedItem,
              ...items.value.slice(index + 1)
            ]
          }

          return updatedItem
        } catch (err: any) {
          apiErrors.value = err.response?.data || err
          throw err
        } finally {
          loading.value = false
        }
      }
    : undefined

  const deleteItem = deleteEndpoint
    ? async (id: any) => {
        loading.value = true
        apiErrors.value = null

        try {
          await apiClient.delete(deleteEndpoint(id))

          items.value = items.value.filter(item => item.id !== id)

          return true
        } catch (err: any) {
          apiErrors.value = err.response?.data || err
          throw err
        } finally {
          loading.value = false
        }
      }
    : undefined

  const clearApiErrors = () => {
    apiErrors.value = null
  }

  return {
    // State
    loading,
    items,
    error,
    pagination,
    filters,

    // CRUD
    createItem,
    updateItem,
    deleteItem,

    // Errors
    apiErrors,
    clearApiErrors,

    // Methods
    changePage,
    updateFilters,
    updateSort,
    resetFilters,
    resetAll,
    fetchFromUrl,
    refresh
  }
}


