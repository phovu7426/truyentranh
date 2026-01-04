import { ref, computed } from 'vue'
import { useApiClient } from '~/composables/api/useApiClient'
import { useApiBase } from '~/composables/api/useApiBase'
import { useToast } from '~/composables/ui/useToast'
import { publicEndpoints } from '@/api/endpoints'

// Types
export interface CreatePaymentUrlRequest {
    order_id: number
    payment_method_id: number
    return_url?: string
    cancel_url?: string
}

export interface CreatePaymentUrlResponse {
    success: boolean
    message: string
    data: {
        payment_id: number
        payment_url: string
        expires_at: string
    }
}

export interface VerifyPaymentResponse {
    success: boolean
    message: string
    data: {
        order_id: number
        order_number: string
        payment_status: string
        transaction_id?: string
        amount: string
    }
}

export interface Payment {
    id: number
    order_id: number
    payment_method_id: number
    status: 'pending' | 'processing' | 'completed' | 'failed'
    amount: string
    transaction_id: string | null
    paid_at: string | null
    payment_method?: {
        id: number
        name: string
        code: string
    }
}

// Reactive state
const { state, isLoading, errorMessage, setLoading, setError, handleApiCall } = useApiBase<any>()

export function usePayments() {
    // Get API client and toast
    const { apiClient } = useApiClient()
    const { showSuccess, showError } = useToast()

    /**
     * Tạo payment URL cho online payment (VNPay, MoMo, etc.)
     * API: POST /api/public/payments/create-url
     */
    const createPaymentUrl = async (request: CreatePaymentUrlRequest): Promise<CreatePaymentUrlResponse['data']> => {
        try {
            setLoading(true)
            const response = await handleApiCall(
                () => apiClient.post<CreatePaymentUrlResponse>(
                    publicEndpoints.payments.createUrl,
                    request
                ),
                { errorMessage: 'Không thể tạo payment URL' }
            )

            if (response && response.data.success) {
                return response.data.data
            }

            throw new Error(response?.data?.message || 'Không thể tạo payment URL')
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Không thể tạo payment URL'
            setError(errorMessage)
            showError(errorMessage)
            throw error
        } finally {
            setLoading(false)
        }
    }

    /**
     * Xác minh thanh toán từ payment gateway (return URL)
     * API: GET /api/public/payments/verify/:gateway
     */
    const verifyPayment = async (gateway: string, queryParams: Record<string, string>): Promise<VerifyPaymentResponse['data']> => {
        try {
            setLoading(true)
            const params = new URLSearchParams(queryParams)
            const response = await handleApiCall(
                () => apiClient.get<VerifyPaymentResponse>(
                    `${publicEndpoints.payments.verify(gateway)}?${params.toString()}`
                ),
                { errorMessage: 'Không thể xác minh thanh toán' }
            )

            if (response && response.data.success) {
                showSuccess('Xác minh thanh toán thành công')
                return response.data.data
            }

            throw new Error(response?.data?.message || 'Xác minh thanh toán thất bại')
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Không thể xác minh thanh toán'
            setError(errorMessage)
            showError(errorMessage)
            throw error
        } finally {
            setLoading(false)
        }
    }

    /**
     * Lấy danh sách payments
     * API: GET /api/public/payments
     */
    const fetchPayments = async (filters?: { order_id?: number; status?: string }) => {
        try {
            setLoading(true)
            const params = new URLSearchParams()
            if (filters?.order_id) params.set('order_id', filters.order_id.toString())
            if (filters?.status) params.set('status', filters.status)

            const response = await handleApiCall(
                () => apiClient.get<{ success: boolean; data: Payment[] }>(
                    `${publicEndpoints.payments.list}${params.toString() ? `?${params.toString()}` : ''}`
                ),
                { errorMessage: 'Không thể lấy danh sách thanh toán' }
            )

            if (response && response.data.success) {
                return response.data.data
            }

            return []
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Không thể lấy danh sách thanh toán'
            setError(errorMessage)
            return []
        } finally {
            setLoading(false)
        }
    }

    /**
     * Lấy chi tiết payment
     * API: GET /api/public/payments/:id
     */
    const fetchPayment = async (paymentId: number): Promise<Payment | null> => {
        try {
            setLoading(true)
            const response = await handleApiCall(
                () => apiClient.get<{ success: boolean; data: Payment }>(
                    publicEndpoints.payments.show(paymentId)
                ),
                { errorMessage: 'Không thể lấy chi tiết thanh toán' }
            )

            if (response && response.data.success) {
                return response.data.data
            }

            return null
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Không thể lấy chi tiết thanh toán'
            setError(errorMessage)
            return null
        } finally {
            setLoading(false)
        }
    }

    return {
        // State
        isLoading,
        errorMessage,

        // Methods
        createPaymentUrl,
        verifyPayment,
        fetchPayments,
        fetchPayment
    }
}
