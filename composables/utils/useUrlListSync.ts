import { ref, watch, computed, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGlobalApiClient } from '@/composables/api'

/**
 * Đồng bộ URL <-> API list (pagination, filters, sort) mà không bao gồm CRUD.
 * Dùng cho các trang chỉ cần danh sách.
 */
export function useUrlListSync<T extends { id: any } = any>(
  config: {
    endpoint: string
    transformItem?: (item: T) => T
  }
) {
  const { endpoint, transformItem } = config
  const route = useRoute()
  const router = useRouter()
  const { apiClient } = useGlobalApiClient()

  /**
   * SSR-safe:
   * - Trên Windows, hydration rất dễ lệch nếu server render <table> nhưng client render Skeleton (hoặc ngược lại).
   * - App hiện tại fetch list trên client (watch immediate), còn server không fetch.
   * => Đặt loading = true mặc định để server & client đều render Skeleton ban đầu.
   */
  const loading = ref(true)
  let isFetching = false
  const items = ref<T[]>([]) as Ref<T[]>
  const error = ref<any>(null)
  const pagination = ref({
    page: 1,
    totalPages: 1,
    limit: 10,
    totalItems: 0
  })

  const getUrlParams = (): Record<string, any> => {
    const params: Record<string, any> = {}

    if (route.query && typeof route.query === 'object') {
      Object.keys(route.query).forEach(key => {
        const value = route.query[key]
        if (value !== undefined && value !== null) {
          if (key === 'page' || key === 'limit' || key === 'per_page') {
            const parsed = parseInt(value as string, 10)
            if (!isNaN(parsed)) {
              params[key] = parsed
            }
          } else {
            params[key] = value
          }
        }
      })
    }

    return params
  }

  const fetchFromUrl = async () => {
    if (isFetching) return

    isFetching = true
    loading.value = true
    error.value = null

    try {
      const params = getUrlParams()
      const response = await apiClient.get(endpoint, { params })

      const data = response.data?.data || []
      items.value = transformItem ? data.map(transformItem) : data

      const meta = response.data?.meta || response.data?.pagination || null
      if (meta) {
        pagination.value = {
          page: meta.page ?? meta.current_page ?? pagination.value.page,
          totalPages: meta.totalPages ?? meta.last_page ?? pagination.value.totalPages,
          limit: meta.limit ?? meta.per_page ?? pagination.value.limit,
          totalItems: meta.totalItems ?? meta.total ?? pagination.value.totalItems
        }
      }
    } catch (err: any) {
      error.value = err
    } finally {
      loading.value = false
      isFetching = false
    }
  }

  // Flag để đảm bảo chỉ fetch một lần trên server
  let hasInitialFetch = false

  // Watch route.query changes với immediate: true
  // Trên client, fetch ngay lần đầu
  // Trên server, không fetch (để page component await)
  // SSR-safe: chỉ watch trên client để tránh hydration mismatch
  if (process.client) {
    watch(
      () => route.query,
      () => {
        // Trên client, fetch bình thường
        if (!hasInitialFetch) {
          hasInitialFetch = true
        }
        fetchFromUrl()
      },
      { immediate: true, deep: true }
    )
  }

  const changePage = (page: number) => {
    router.push({
      query: {
        ...route.query,
        page: page > 1 ? page : undefined,
        limit: route.query.limit || route.query.per_page || 10
      }
    })
  }

  const updateFilters = (filters: Record<string, any>) => {
    const query: Record<string, any> = { ...route.query }

    Object.keys(query).forEach(key => {
      if (key !== 'page' && key !== 'limit' && key !== 'per_page') {
        delete query[key]
      }
    })

    Object.keys(filters).forEach(key => {
      const value = filters[key]
      if (value !== undefined && value !== null && value !== '') {
        query[key] = value
      }
    })

    query.page = undefined

    router.push({ query })
  }

  const updateSort = (sortBy: string, sortOrder: 'asc' | 'desc' = 'desc') => {
    router.push({
      query: {
        ...route.query,
        sort_by: sortBy,
        sort_order: sortOrder,
        page: undefined
      }
    })
  }

  const resetFilters = () => {
    const query: Record<string, any> = { ...route.query }

    Object.keys(query).forEach(key => {
      if (key !== 'page' && key !== 'limit' && key !== 'per_page') {
        delete query[key]
      }
    })

    router.push({ query })
  }

  const resetAll = () => {
    router.push({ query: {} })
  }

  return {
    loading,
    items,
    error,
    pagination,
    filters: computed(() => getUrlParams()),

    changePage,
    updateFilters,
    updateSort,
    resetFilters,
    resetAll,
    fetchFromUrl,
    refresh: fetchFromUrl
  }
}


