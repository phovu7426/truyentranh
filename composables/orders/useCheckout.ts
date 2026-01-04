import { ref, computed, reactive, readonly } from 'vue'
import { useGlobalApiClient } from '~/composables/api'
import { publicEndpoints } from '@/api/endpoints'
import { useCart } from '~/composables/cart/useCart'
import { useToast } from '~/composables/ui/useToast'
import type {
    CheckoutAddressRequest,
    CheckoutOrderRequest,
    Order,
    UseCheckoutOptions,
    CheckoutState
} from './order.types'

export default function useCheckout(options: UseCheckoutOptions = {}) {
    const { apiClient } = useGlobalApiClient()
    const cart = useCart()
    const { showSuccess, showError } = useToast()

    // Create our own reactive state for checkout
    const checkoutState = reactive<CheckoutState>({
        address: null,
        loading: false,
        error: null
    })

    // Loading and error states
    const isLoading = ref(false)
    const errorMessage = ref<string | null>(null)

    // Local state for checkout process
    const currentStep = ref<'address' | 'payment' | 'confirmation' | 'complete'>('address')
    const orderData = ref<any>(null)
    const paymentData = ref<any>(null)

    // Shipping and payment methods
    const shippingMethods = ref<any[]>([])
    const paymentMethods = ref<any[]>([])

    // Computed properties
    const hasAddress = computed(() => !!checkoutState.address)
    const currentStepName = computed(() => currentStep.value)

    // Generic API call handler
    const handleApiCall = async <R>(
        apiCall: () => Promise<R>,
        options: {
            successMessage?: string
            errorMessage?: string
            onSuccess?: (data: R) => void
            onError?: (error: any) => void
            silent?: boolean  // Don't set errorMessage if true
        } = {}
    ): Promise<R | null> => {
        try {
            isLoading.value = true
            if (!options.silent) {
                errorMessage.value = null
            }

            const response = await apiCall()

            if (options.onSuccess) {
                options.onSuccess(response)
            }

            return response
        } catch (error: any) {
            const message = options.errorMessage || error.message || 'An error occurred'

            // Only set error message if not silent
            if (!options.silent) {
                errorMessage.value = message
            }

            if (options.onError) {
                options.onError(error)
            }

            // API Error
            return null
        } finally {
            isLoading.value = false
        }
    }

    // Methods
    const saveAddress = async (addressData: CheckoutAddressRequest) => {
        try {
            checkoutState.address = { ...addressData }
            showSuccess('Đã lưu thông tin giao hàng')
            return addressData
        } catch (error: any) {
            showError('Không thể lưu thông tin giao hàng')
            throw error
        }
    }

    const createOrder = async (orderRequestData: CheckoutOrderRequest) => {
        try {
            const response = await handleApiCall(
                () => apiClient.post<{ success: boolean; data: { order: Order; payment?: any }; message: string }>(
                    publicEndpoints.orders.create,
                    orderRequestData
                ),
                { errorMessage: 'Không thể tạo đơn hàng' }
            )

            if (response && response.data.success) {
                orderData.value = response.data.data.order
                paymentData.value = response.data.data.payment

                showSuccess(response.data.message || 'Đặt hàng thành công')

                // Clear cart after successful order
                await cart.clearCart()

                return response.data.data
            }

            throw new Error('Failed to create order')
        } catch (error: any) {
            showError(error.message || 'Không thể tạo đơn hàng')
            throw error
        }
    }

    const fetchShippingMethods = async () => {
        try {
            const response = await handleApiCall(
                () => apiClient.get(publicEndpoints.shippingMethods.active),
                {
                    errorMessage: 'Không thể tải phương thức vận chuyển',
                    silent: true  // Don't show error on page load
                }
            )

            if (response && response.data.success) {
                shippingMethods.value = response.data.data
                return response.data.data
            }

            return []
        } catch (error: any) {
            // Error fetching shipping methods
            return []
        }
    }

    const fetchPaymentMethods = async () => {
        try {
            const response = await handleApiCall(
                () => apiClient.get(publicEndpoints.paymentMethods.list),
                {
                    errorMessage: 'Không thể tải phương thức thanh toán',
                    silent: true  // Don't show error on page load
                }
            )

            if (response && response.data.success) {
                paymentMethods.value = response.data.data
                return response.data.data
            }

            return []
        } catch (error: any) {
            // Error fetching payment methods
            return []
        }
    }

    const calculateShippingCost = async (shippingMethodId: number, address: any) => {
        try {
            const response = await handleApiCall(
                () => apiClient.post(publicEndpoints.shippingMethods.calculate, {
                    shipping_method_id: shippingMethodId,
                    shipping_address: address
                }),
                { errorMessage: 'Không thể tính phí vận chuyển' }
            )

            if (response && response.data.success) {
                return response.data.data.shipping_fee
            }

            return 0
        } catch (error: any) {
            // Error calculating shipping cost
            return 0
        }
    }

    const goToStep = (step: 'address' | 'payment' | 'confirmation' | 'complete') => {
        currentStep.value = step
    }

    const nextStep = () => {
        switch (currentStep.value) {
            case 'address':
                currentStep.value = 'payment'
                break
            case 'payment':
                currentStep.value = 'confirmation'
                break
            case 'confirmation':
                currentStep.value = 'complete'
                break
        }
    }

    const previousStep = () => {
        switch (currentStep.value) {
            case 'payment':
                currentStep.value = 'address'
                break
            case 'confirmation':
                currentStep.value = 'payment'
                break
            case 'complete':
                currentStep.value = 'confirmation'
                break
        }
    }

    const resetCheckout = () => {
        currentStep.value = 'address'
        orderData.value = null
        paymentData.value = null
        checkoutState.address = null
        checkoutState.loading = false
        checkoutState.error = null
    }

    const canProceedToPayment = computed(() => {
        return hasAddress.value &&
            checkoutState.address?.customer_name &&
            checkoutState.address?.customer_email &&
            checkoutState.address?.customer_phone &&
            checkoutState.address?.shipping_address
    })

    const canProceedToConfirmation = computed(() => {
        return canProceedToPayment.value && !!orderData.value
    })

    const canCompleteCheckout = computed(() => {
        return canProceedToConfirmation.value && !!paymentData.value
    })

    // Initialize if immediate option is true
    if (options.immediate) {
        // Clear any previous errors
        errorMessage.value = null
        // Fetch shipping and payment methods
        fetchShippingMethods()
        fetchPaymentMethods()
    }

    return {
        // State (exposed for template access)
        state: readonly(checkoutState),
        checkoutState,
        currentStep: readonly(currentStep),
        orderData: readonly(orderData),
        paymentData: readonly(paymentData),
        shippingMethods: readonly(shippingMethods),
        paymentMethods: readonly(paymentMethods),

        // Cart state
        cart: readonly(cart.cart),
        cartItems: cart.items,
        cartSubtotal: cart.subtotal,
        cartTotal: cart.totalAmount,

        // Computed
        isLoading,
        errorMessage,
        hasAddress,
        currentStepName,
        canProceedToPayment,
        canProceedToConfirmation,
        canCompleteCheckout,

        // Methods
        saveAddress,
        createOrder,
        fetchShippingMethods,
        fetchPaymentMethods,
        calculateShippingCost,
        goToStep,
        nextStep,
        previousStep,
        resetCheckout
    }
}