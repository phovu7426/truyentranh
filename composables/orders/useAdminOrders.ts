import { computed, ref } from 'vue'
import { useGlobalApiClient } from '@/composables/api'
import { adminEndpoints } from '@/api/endpoints'
import type {
  Order,
  OrderListResponse,
  UpdateOrderStatusRequest,
  UpdateOrderRequest,
  OrderFilters
} from './order.types'
import { useToast } from '@/composables/ui/useToast'

export interface UseAdminOrdersOptions {
  immediate?: boolean
  page?: number
  limit?: number
}

/**
 * Composable để quản lý đơn hàng trong Admin
 * Hỗ trợ các API:
 * - GET /api/admin/orders - Lấy danh sách đơn hàng
 * - GET /api/admin/orders/:id - Lấy chi tiết đơn hàng
 * - PATCH /api/admin/orders/:id/status - Cập nhật trạng thái đơn hàng
 * - PATCH /api/admin/orders/:id - Cập nhật thông tin đơn hàng
 */
export function useAdminOrders(options: UseAdminOrdersOptions = {}) {
  const { apiClient } = useGlobalApiClient()
  const { showSuccess, showError } = useToast()

  // State
  const loading = ref(false)
  const error = ref<string | null>(null)
  const orders = ref<Order[]>([])
  const currentOrder = ref<Order | null>(null)
  const pagination = ref({
    page: options.page || 1,
    limit: options.limit || 10,
    totalItems: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  })
  const filters = ref<OrderFilters>({
    status: '',
    paymentStatus: '',
    shippingStatus: '',
    customerEmail: '',
    startDate: '',
    endDate: '',
    search: ''
  })

  // Computed
  const hasData = computed(() => orders.value.length > 0)
  const isLoading = computed(() => loading.value)
  const errorMessage = computed(() => error.value)

  /**
   * Lấy danh sách đơn hàng với filters và pagination
   */
  const fetchOrders = async (page?: number, customFilters?: Partial<OrderFilters>) => {
    loading.value = true
    error.value = null

    try {
      const currentPage = page || pagination.value.page
      const currentFilters = { ...filters.value, ...customFilters }

      const params = new URLSearchParams()
      params.set('page', currentPage.toString())
      params.set('limit', pagination.value.limit.toString())

      // Add filters to params
      if (currentFilters.status) params.set('status', currentFilters.status)
      if (currentFilters.paymentStatus) params.set('paymentStatus', currentFilters.paymentStatus)
      if (currentFilters.shippingStatus) params.set('shippingStatus', currentFilters.shippingStatus)
      if (currentFilters.customerEmail) params.set('customerEmail', currentFilters.customerEmail)
      if (currentFilters.startDate) params.set('startDate', currentFilters.startDate)
      if (currentFilters.endDate) params.set('endDate', currentFilters.endDate)
      if (currentFilters.search) params.set('search', currentFilters.search)

      const response = await apiClient.get<{ success?: boolean; data?: Order[]; meta?: any } | OrderListResponse>(
        `${adminEndpoints.orders.list}?${params.toString()}`
      )

      // Handle both response formats: { success, data, meta } or { data, meta }
      const responseData = response.data as any
      
      if (responseData?.success !== false) {
        // Check if response has nested data (API format with success field)
        const ordersList = responseData?.data || responseData?.orders || (Array.isArray(responseData) ? responseData : [])
        const meta = responseData?.meta

        orders.value = Array.isArray(ordersList) ? ordersList : []
        
        if (meta) {
          pagination.value = {
            page: meta.page || pagination.value.page,
            limit: meta.limit || pagination.value.limit,
            totalItems: meta.totalItems || 0,
            totalPages: meta.totalPages || 0,
            hasNextPage: meta.hasNextPage || false,
            hasPreviousPage: meta.hasPreviousPage || false
          }
        }
      } else {
        orders.value = []
      }

      return orders.value
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Không thể lấy danh sách đơn hàng'
      orders.value = []
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Lấy chi tiết đơn hàng
   */
  const fetchOrder = async (orderId: number | string) => {
    loading.value = true
    error.value = null

    try {
      const response = await apiClient.get<{ success?: boolean; data?: Order } | { data: Order }>(
        adminEndpoints.orders.show(orderId)
      )

      // Handle both response formats: { success, data } or { data }
      const responseData = response.data as any
      const orderData = responseData?.data || responseData

      if (orderData && orderData.id) {
        currentOrder.value = orderData
        return orderData
      } else {
        throw new Error('Không tìm thấy đơn hàng')
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Không thể lấy chi tiết đơn hàng'
      currentOrder.value = null
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Cập nhật trạng thái đơn hàng
   * API: PATCH /api/admin/orders/:id/status
   */
  const updateOrderStatus = async (
    orderId: number | string,
    statusData: UpdateOrderStatusRequest,
    showNotification = true
  ) => {
    loading.value = true
    error.value = null

    try {
      const response = await apiClient.patch<{ success?: boolean; data?: Order } | { data: Order }>(
        adminEndpoints.orders.updateStatus(orderId),
        statusData
      )

      // Handle both response formats: { success, data } or { data }
      const responseData = response.data as any
      const updatedOrder = responseData?.data || responseData

      if (updatedOrder && updatedOrder.id) {

        // Update current order if it matches
        if (currentOrder.value?.id === updatedOrder.id) {
          currentOrder.value = updatedOrder
        }

        // Update order in list if it exists
        const orderIndex = orders.value.findIndex(order => order.id === updatedOrder.id)
        if (orderIndex !== -1) {
          orders.value[orderIndex] = updatedOrder
        }

        if (showNotification) {
          showSuccess('Cập nhật trạng thái đơn hàng thành công')
        }

        return updatedOrder
      } else {
        throw new Error('Cập nhật trạng thái thất bại: Không nhận được dữ liệu hợp lệ')
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Không thể cập nhật trạng thái đơn hàng'
      if (showNotification) {
        showError(error.value)
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Cập nhật trạng thái thanh toán (thông qua Admin Payment API)
   * API: PATCH /api/admin/payments/:id/status
   */
  const updatePaymentStatus = async (
    paymentId: number | string,
    status: 'pending' | 'processing' | 'completed' | 'failed',
    notes?: string,
    showNotification = true
  ) => {
    loading.value = true
    error.value = null

    try {
      const response = await apiClient.patch<{ success?: boolean; data?: any } | { data: any }>(
        adminEndpoints.adminPayments.updateStatus(paymentId),
        { status, notes }
      )

      const responseData = response.data as any
      const updatedPayment = responseData?.data || responseData

      if (updatedPayment) {
        // Refresh order để cập nhật payment status
        if (currentOrder.value) {
          await fetchOrder(currentOrder.value.id)
        }

        if (showNotification) {
          showSuccess('Cập nhật trạng thái thanh toán thành công')
        }

        return updatedPayment
      } else {
        throw new Error('Cập nhật trạng thái thanh toán thất bại')
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Không thể cập nhật trạng thái thanh toán'
      if (showNotification) {
        showError(error.value)
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Cập nhật thông tin đơn hàng
   * API: PATCH /api/admin/orders/:id
   * 
   * Lưu ý:
   * - Chỉ có thể cập nhật customer_name, customer_email, customer_phone, 
   *   shipping_address, billing_address khi status = pending hoặc confirmed
   * - Có thể cập nhật notes, tracking_number, shipping_method_id ở bất kỳ trạng thái nào (trừ cancelled và delivered)
   */
  const updateOrder = async (
    orderId: number | string,
    payload: UpdateOrderRequest,
    showNotification = true
  ) => {
    loading.value = true
    error.value = null

    try {
      const response = await apiClient.patch<{ success?: boolean; data?: Order } | { data: Order }>(
        adminEndpoints.orders.update(orderId),
        payload
      )

      // Handle both response formats: { success, data } or { data }
      const responseData = response.data as any
      const updatedOrder = responseData?.data || responseData

      if (updatedOrder && updatedOrder.id) {

        // Update current order if it matches
        if (currentOrder.value?.id === updatedOrder.id) {
          currentOrder.value = updatedOrder
        }

        // Update order in list if it exists
        const orderIndex = orders.value.findIndex(order => order.id === updatedOrder.id)
        if (orderIndex !== -1) {
          orders.value[orderIndex] = updatedOrder
        }

        if (showNotification) {
          showSuccess('Cập nhật thông tin đơn hàng thành công')
        }

        return updatedOrder
      } else {
        throw new Error('Cập nhật thông tin thất bại: Không nhận được dữ liệu hợp lệ')
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Không thể cập nhật thông tin đơn hàng'
      if (showNotification) {
        showError(error.value)
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Cập nhật filters
   */
  const updateFilters = (newFilters: Partial<OrderFilters>) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  /**
   * Reset filters về mặc định
   */
  const resetFilters = () => {
    filters.value = {
      status: '',
      paymentStatus: '',
      shippingStatus: '',
      customerEmail: '',
      startDate: '',
      endDate: '',
      search: ''
    }
  }

  /**
   * Change page
   */
  const changePage = async (page: number) => {
    await fetchOrders(page)
  }

  /**
   * Refresh orders list
   */
  const refresh = async () => {
    await fetchOrders(pagination.value.page, filters.value)
  }

  // Initialize if immediate option is true
  if (options.immediate) {
    fetchOrders(options.page || 1)
  }

  return {
    // State
    orders,
    currentOrder,
    loading: isLoading,
    error: errorMessage,
    pagination,
    filters,
    hasData,

    // Methods
    fetchOrders,
    fetchOrder,
    updateOrderStatus,
    updatePaymentStatus,
    updateOrder,
    updateFilters,
    resetFilters,
    changePage,
    refresh
  }
}

