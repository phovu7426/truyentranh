import { computed, ref } from 'vue'
import { useGlobalApiClient } from '~/composables/api'
import { publicEndpoints } from '~/api/endpoints'
import type {
    Order,
    OrderListResponse,
    OrderStatusResponse,
    UseOrdersOptions,
    OrderFilters
} from './order.types'
import { useApiWithPagination } from '~/composables/api/useApiBase'

export default function useOrders(options: UseOrdersOptions = {}) {
    const { apiClient } = useGlobalApiClient()
    const {
        state,
        isLoading,
        errorMessage,
        hasData: hasOrders,
        currentPage,
        totalPages,
        totalItems: totalOrders,
        pagination,
        filters,
        handleApiCall,
        setPagination,
        setFilters,
        resetFilters,
        resetState,
        setData
    } = useApiWithPagination<Order>()
    
    // Separate state for current order (single order detail)
    const currentOrder = ref<Order | null>(null)

    // Methods
    const fetchOrders = async (page = 1, filters: OrderFilters = {}) => {
        const params = new URLSearchParams()
        params.set('page', page.toString())
        params.set('limit', pagination.per_page.toString())

        if (filters.status) params.set('status', filters.status)
        if (filters.paymentStatus) params.set('paymentStatus', filters.paymentStatus)
        if (filters.shippingStatus) params.set('shippingStatus', filters.shippingStatus)
        if (filters.customerEmail) params.set('customerEmail', filters.customerEmail)
        if (filters.startDate) params.set('startDate', filters.startDate)
        if (filters.endDate) params.set('endDate', filters.endDate)
        if (filters.search) params.set('search', filters.search)

        const response = await handleApiCall(
            () => apiClient.get<OrderListResponse>(
                `${publicEndpoints.orders.list}?${params.toString()}`
            ),
            { errorMessage: 'Failed to fetch orders' }
        )

        if (response) {
            setData(response.data.data)
            setPagination({
                current_page: response.data.meta.page,
                last_page: response.data.meta.totalPages,
                per_page: response.data.meta.limit,
                total: response.data.meta.totalItems
            })
        }
    }

    const fetchOrder = async (orderId: number) => {
        try {
            const response = await handleApiCall(
                () => apiClient.get<any>(
                    publicEndpoints.orders.show(orderId)
                ),
                { errorMessage: 'Failed to fetch order' }
            )

            if (!response || !response.data) {
                throw new Error('No response data received')
            }

            const responseData = response.data
            
            // Handle API response format: { success: true, data: {...}, ... }
            let orderData: any = null
            
            if (responseData.success === false) {
                throw new Error(responseData.message || 'Failed to fetch order')
            }
            
            // Extract order data from response
            if (responseData.data) {
                orderData = responseData.data
            } else if (responseData.id || responseData.order_number) {
                // Response is already the order data
                orderData = responseData
            } else {
                throw new Error('Invalid response format')
            }

            // Validate order data exists
            if (!orderData || (!orderData.id && !orderData.order_number)) {
                throw new Error('Invalid order data: missing id or order_number')
            }

            // Ensure order_items and payments are arrays (may be missing from API)
            if (!Array.isArray(orderData.order_items)) {
                orderData.order_items = []
            }
            if (!Array.isArray(orderData.payments)) {
                orderData.payments = []
            }

            // Parse shipping_address if it's a JSON string
            if (typeof orderData.shipping_address === 'string') {
                try {
                    orderData.shipping_address = JSON.parse(orderData.shipping_address)
                } catch (e) {
                    // If parsing fails, create a basic address object
                    orderData.shipping_address = {
                        address: orderData.shipping_address,
                        district: '',
                        city: '',
                        province: '',
                        postal_code: ''
                    }
                }
            } else if (!orderData.shipping_address) {
                orderData.shipping_address = {
                    address: '',
                    district: '',
                    city: '',
                    province: '',
                    postal_code: ''
                }
            }

            // Parse billing_address if it's a JSON string
            if (typeof orderData.billing_address === 'string') {
                try {
                    orderData.billing_address = JSON.parse(orderData.billing_address)
                } catch (e) {
                    // If parsing fails, use shipping address as fallback
                    orderData.billing_address = orderData.shipping_address || {
                        address: '',
                        district: '',
                        city: '',
                        province: '',
                        postal_code: ''
                    }
                }
            } else if (!orderData.billing_address) {
                orderData.billing_address = orderData.shipping_address || {
                    address: '',
                    district: '',
                    city: '',
                    province: '',
                    postal_code: ''
                }
            }

            // Convert id to number if it's a string
            if (typeof orderData.id === 'string') {
                orderData.id = parseInt(orderData.id) || orderData.id
            }

            // Set the current order
            currentOrder.value = orderData as Order
            return orderData as Order
        } catch (error: any) {
            // Reset current order on error
            currentOrder.value = null
            // Re-throw to let handleApiCall handle it
            throw error
        }
    }

    const fetchGuestOrder = async (orderNumber: string, email: string) => {
        const response = await handleApiCall(
            () => apiClient.get<{ data: Order }>(
                publicEndpoints.orders.showGuest(orderNumber, email)
            ),
            { errorMessage: 'Failed to fetch guest order' }
        )

        if (response) {
            currentOrder.value = response.data.data
            return response.data.data
        }

        throw new Error('Failed to fetch guest order')
    }

    const createOrder = async (orderData: any) => {
        const response = await handleApiCall(
            () => apiClient.post<{ data: Order }>(
                publicEndpoints.orders.create,
                orderData
            ),
            { errorMessage: 'Failed to create order' }
        )

        if (response) {
            return response.data.data
        }

        throw new Error('Failed to create order')
    }

    const processPayment = async (orderId: number, paymentData: any) => {
        const response = await handleApiCall(
            () => apiClient.post<{ data: any }>(
                publicEndpoints.orders.payment(orderId),
                paymentData
            ),
            { errorMessage: 'Failed to process payment' }
        )

        if (response) {
            // Update current order if it exists
            if (currentOrder.value && currentOrder.value.id === orderId) {
                currentOrder.value = { ...currentOrder.value, ...response.data.data }
            }

            return response.data.data
        }

        throw new Error('Failed to process payment')
    }

    const getOrderStatus = async (orderNumber: string) => {
        const response = await handleApiCall(
            () => apiClient.get<OrderStatusResponse>(
                publicEndpoints.orders.status(orderNumber)
            ),
            { errorMessage: 'Failed to get order status' }
        )

        if (response) {
            return response.data
        }

        throw new Error('Failed to get order status')
    }

    const getUserAddress = async () => {
        const response = await handleApiCall(
            () => apiClient.get<{ data: any }>(
                publicEndpoints.orders.userAddress
            ),
            { errorMessage: 'Failed to get user address' }
        )

        if (response) {
            return response.data.data
        }

        throw new Error('Failed to get user address')
    }

    const cancelOrder = async (orderId: number) => {
        const response = await handleApiCall(
            () => apiClient.put<{ data: Order }>(
                publicEndpoints.orders.cancel(orderId)
            ),
            { errorMessage: 'Failed to cancel order' }
        )

        if (response) {
            // Update current order if it exists
            if (currentOrder.value && currentOrder.value.id === orderId) {
                currentOrder.value = response.data.data
            }
            return response.data.data
        }

        throw new Error('Failed to cancel order')
    }

    const refreshOrders = () => {
        fetchOrders(pagination.current_page, filters)
    }

    // Initialize if immediate option is true
    if (options.immediate) {
        fetchOrders(options.page || 1, {
            search: options.search,
            status: options.status
        })
    }

    return {
        // State
        state,
        currentOrder: computed(() => currentOrder.value),

        // Computed
        hasOrders,
        isLoading,
        errorMessage,
        currentPage,
        totalPages,
        totalOrders,

        // Methods
        fetchOrders,
        fetchOrder,
        fetchGuestOrder,
        createOrder,
        processPayment,
        getOrderStatus,
        getUserAddress,
        cancelOrder,
        setFilters,
        resetFilters,
        refreshOrders
    }
}