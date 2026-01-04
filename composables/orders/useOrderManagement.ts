import { computed, reactive, readonly } from 'vue'
import { useGlobalApiClient } from '~/composables/api'
import { adminEndpoints } from '~/api/endpoints'
import type {
    Order,
    OrderListResponse,
    UpdateOrderStatusRequest,
    UpdateOrderRequest,
    UseOrderManagementOptions,
    OrderState,
    OrderFilters
} from './order.types'

export default function useOrderManagement(options: UseOrderManagementOptions = {}) {
    const { apiClient } = useGlobalApiClient()

    // State
    const state = reactive<OrderState>({
        orders: [],
        currentOrder: null,
        loading: false,
        error: null,
        pagination: {
            page: 1,
            totalPages: 1,
            limit: 20,
            totalItems: 0,
            hasNextPage: false,
            hasPreviousPage: false
        },
        filters: {
            status: '',
            paymentStatus: '',
            shippingStatus: '',
            customerEmail: '',
            startDate: '',
            endDate: '',
            sortBy: '',
            sortOrder: 'desc',
            search: ''
        }
    })

    // Computed properties
    const hasOrders = computed(() => state.orders.length > 0)
    const isLoading = computed(() => state.loading)
    const errorMessage = computed(() => state.error)
    const currentPage = computed(() => state.pagination.page)
    const totalPages = computed(() => state.pagination.totalPages)
    const pageSize = computed(() => state.pagination.limit)
    const totalOrders = computed(() => state.pagination.totalItems)

    // Methods
    const fetchOrders = async (page = 1, filters: OrderFilters = {}) => {
        state.loading = true
        state.error = null

        try {
            const params = new URLSearchParams()
            params.set('page', page.toString())
            params.set('limit', state.pagination.limit.toString())

            if (filters.status) params.set('status', filters.status)
            if (filters.paymentStatus) params.set('paymentStatus', filters.paymentStatus)
            if (filters.shippingStatus) params.set('shippingStatus', filters.shippingStatus)
            if (filters.customerEmail) params.set('customerEmail', filters.customerEmail)
            if (filters.startDate) params.set('startDate', filters.startDate)
            if (filters.endDate) params.set('endDate', filters.endDate)
            if (filters.search) params.set('search', filters.search)
            if (filters.sortBy) params.set('sortBy', filters.sortBy)
            if (filters.sortOrder) params.set('sortOrder', filters.sortOrder)

            const response = await apiClient.get<OrderListResponse>(
                `${adminEndpoints.orders.list}?${params.toString()}`
            )

            state.orders = response.data.data
            state.pagination = {
                page: response.data.meta.page,
                totalPages: response.data.meta.totalPages,
                limit: response.data.meta.limit,
                totalItems: response.data.meta.totalItems,
                hasNextPage: response.data.meta.hasNextPage,
                hasPreviousPage: response.data.meta.hasPreviousPage
            }
        } catch (error: any) {
            state.error = error.message || 'Failed to fetch orders'
            // Error fetching orders
        } finally {
            state.loading = false
        }
    }

    const fetchOrder = async (orderId: number) => {
        state.loading = true
        state.error = null

        try {
            const response = await apiClient.get<{ data: Order }>(
                adminEndpoints.orders.show(orderId)
            )
            state.currentOrder = response.data.data
            return response.data.data
        } catch (error: any) {
            state.error = error.message || 'Failed to fetch order'
            // Error fetching order
            throw error
        } finally {
            state.loading = false
        }
    }

    const updateOrderStatus = async (orderId: number, statusData: UpdateOrderStatusRequest) => {
        state.loading = true
        state.error = null

        try {
            const response = await apiClient.patch<{ data: Order }>(
                adminEndpoints.orders.updateStatus(orderId),
                statusData
            )

            // Update current order if it exists
            if (state.currentOrder && state.currentOrder.id === orderId) {
                state.currentOrder = { ...state.currentOrder, ...response.data.data }
            }

            // Update order in list if it exists
            const orderIndex = state.orders.findIndex(order => order.id === orderId)
            if (orderIndex !== -1) {
                state.orders[orderIndex] = { ...state.orders[orderIndex], ...response.data.data }
            }

            return response.data.data
        } catch (error: any) {
            state.error = error.message || 'Failed to update order status'
            // Error updating order status
            throw error
        } finally {
            state.loading = false
        }
    }

    const updateOrder = async (orderId: number, payload: UpdateOrderRequest) => {
        state.loading = true
        state.error = null

        try {
            const response = await apiClient.patch<{ data: Order }>(
                adminEndpoints.orders.update(orderId),
                payload
            )

            if (state.currentOrder && state.currentOrder.id === orderId) {
                state.currentOrder = { ...state.currentOrder, ...response.data.data }
            }

            const orderIndex = state.orders.findIndex(order => order.id === orderId)
            if (orderIndex !== -1) {
                state.orders[orderIndex] = { ...state.orders[orderIndex], ...response.data.data }
            }

            return response.data.data
        } catch (error: any) {
            state.error = error.message || 'Failed to update order'
            throw error
        } finally {
            state.loading = false
        }
    }

    const updateFilters = (filters: Partial<OrderFilters>) => {
        state.filters = { ...state.filters, ...filters }
    }

    const resetFilters = () => {
        state.filters = {
            status: '',
            paymentStatus: '',
            shippingStatus: '',
            customerEmail: '',
            startDate: '',
            endDate: '',
            sortBy: '',
            sortOrder: 'desc',
            search: ''
        }
    }

    const refreshOrders = () => {
        fetchOrders(state.pagination.page, state.filters)
    }

    // Initialize if immediate option is true
    if (options.immediate) {
        fetchOrders()
    }

    if (options.orderId) {
        fetchOrder(options.orderId)
    }

    return {
        // State
        state: readonly(state),

        // Computed
        hasOrders,
        isLoading,
        errorMessage,
        currentPage,
        totalPages,
        pageSize,
        totalOrders,

        // Methods
        fetchOrders,
        fetchOrder,
        updateOrderStatus,
        updateOrder,
        updateFilters,
        resetFilters,
        refreshOrders
    }
}