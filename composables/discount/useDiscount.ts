import { ref, computed } from 'vue'
import type {
    Coupon,
    AppliedCoupon,
    AvailableCouponsResponse,
    ApplyCouponRequest,
    ApplyCouponResponse,
    RemoveCouponResponse,
    ValidateCouponRequest,
    ValidateCouponResponse,
    ErrorResponse
} from '~/types/discount'
import { publicEndpoints } from '@/api/endpoints'
import { useApiClient } from '~/composables/api/useApiClient'
import { useApiBase } from '~/composables/api/useApiBase'
import { useToast } from '~/composables/ui/useToast'

// Reactive state
const availableCoupons = ref<Coupon[]>([])
const appliedCoupon = ref<AppliedCoupon | null>(null)
const { state, isLoading, errorMessage, setLoading, setError, handleApiCall } = useApiBase<any>()

export function useDiscount() {
    // Get API client and toast
    const { apiClient } = useApiClient()
    const { showSuccess, showError } = useToast()

    // Computed properties
    const hasAvailableCoupons = computed(() => availableCoupons.value.length > 0)
    const hasAppliedCoupon = computed(() => !!appliedCoupon.value)
    const usableCoupons = computed(() => availableCoupons.value.filter(coupon => coupon.can_use))

    // Fetch available coupons
    const fetchAvailableCoupons = async () => {
        try {
            setLoading(true)
            const response = await apiClient.get('/api/public/discounts/coupons/available')
            
            if (response.data.success) {
                availableCoupons.value = response.data.data
                return response.data.data
            } else {
                throw new Error(response.data.message || 'Không thể tải danh sách mã giảm giá')
            }
        } catch (error: any) {
            setError(error.message || 'Không thể tải danh sách mã giảm giá')
            return []
        } finally {
            setLoading(false)
        }
    }

    // Apply coupon to cart
    const applyCoupon = async (cartUuid: string, couponCode: string, cartId?: number) => {
        try {
            setLoading(true)
            const requestBody: any = {
                coupon_code: couponCode
            }
            
            // Use cart_id if available, otherwise use cart_uuid
            if (cartId) {
                requestBody.cart_id = cartId
            } else {
                requestBody.cart_uuid = cartUuid
            }
            
            const response = await apiClient.post(publicEndpoints.discounts.applyCoupon, requestBody)
            
            if (response.data.success) {
                // Update applied coupon with the response data
                appliedCoupon.value = response.data.data.applied_coupon
                showSuccess('Áp dụng mã giảm giá thành công!')
                return response.data.data
            } else {
                throw new Error(response.data.message || 'Không thể áp dụng mã giảm giá')
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Không thể áp dụng mã giảm giá'
            setError(errorMessage)
            showError(errorMessage)
            throw error
        } finally {
            setLoading(false)
        }
    }

    // Remove coupon from cart
    const removeCoupon = async (cartUuidOrId: string | number) => {
        try {
            setLoading(true)
            const response = await apiClient.delete(publicEndpoints.discounts.removeCoupon(cartUuidOrId))
            
            if (response.data.success) {
                appliedCoupon.value = null
                showSuccess('Xóa mã giảm giá thành công!')
                return response.data.data
            } else {
                throw new Error(response.data.message || 'Không thể xóa mã giảm giá')
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Không thể xóa mã giảm giá'
            setError(errorMessage)
            showError(errorMessage)
            throw error
        } finally {
            setLoading(false)
        }
    }

    // Validate coupon
    const validateCoupon = async (couponCode: string, cartTotal?: number) => {
        try {
            const response = await apiClient.post(publicEndpoints.discounts.validateCoupon, {
                coupon_code: couponCode,
                cart_total: cartTotal || 0
            })
            
            if (response.data.success) {
                return response.data.data
            } else {
                throw new Error(response.data.message || 'Mã giảm giá không hợp lệ')
            }
        } catch (error: any) {
            throw error
        }
    }

    // Find coupon by code
    const findCouponByCode = (code: string): Coupon | undefined => {
        return availableCoupons.value.find(coupon => 
            coupon.code.toLowerCase() === code.toLowerCase()
        )
    }

    // Check if coupon is applicable for cart total
    const isCouponApplicable = (coupon: Coupon, cartTotal: number): boolean => {
        if (!coupon.is_active) return false
        if (coupon.minimum_order_amount && cartTotal < coupon.minimum_order_amount) return false
        if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) return false
        if (new Date(coupon.end_date) < new Date()) return false
        if (new Date(coupon.start_date) > new Date()) return false
        return true
    }

    // Calculate discount amount
    const calculateDiscountAmount = (coupon: Coupon, cartTotal: number): number => {
        if (!isCouponApplicable(coupon, cartTotal)) return 0

        let discountAmount = 0

        switch (coupon.discount_type) {
            case 'percentage':
                discountAmount = cartTotal * (coupon.discount_value / 100)
                break
            case 'fixed_amount':
                discountAmount = Math.min(coupon.discount_value, cartTotal)
                break
            case 'shipping':
                // Shipping discount would be calculated based on shipping cost
                // This is a placeholder - actual shipping cost would come from cart
                discountAmount = coupon.discount_value
                break
            case 'buy_x_get_y':
                // Buy X get Y logic would be more complex
                // This is a placeholder
                discountAmount = coupon.discount_value
                break
            default:
                discountAmount = 0
        }

        // Apply maximum discount limit if set
        if (coupon.maximum_discount_amount) {
            discountAmount = Math.min(discountAmount, coupon.maximum_discount_amount)
        }

        return discountAmount
    }

    // Format discount display text
    const formatDiscountText = (coupon: Coupon): string => {
        switch (coupon.discount_type) {
            case 'percentage':
                return `Giảm ${coupon.discount_value}%`
            case 'fixed_amount':
                return `Giảm ${new Intl.NumberFormat('vi-VN', { 
                    style: 'currency', 
                    currency: 'VND' 
                }).format(coupon.discount_value)}`
            case 'shipping':
                return 'Miễn phí vận chuyển'
            case 'buy_x_get_y':
                return `Mua X tặng Y`
            default:
                return 'Giảm giá'
        }
    }

    // Clear applied coupon
    const clearAppliedCoupon = () => {
        appliedCoupon.value = null
    }

    // Reset discount state
    const resetDiscountState = () => {
        availableCoupons.value = []
        appliedCoupon.value = null
    }

    return {
        // State
        availableCoupons,
        appliedCoupon,
        isLoading,
        errorMessage,

        // Computed properties
        hasAvailableCoupons,
        hasAppliedCoupon,
        usableCoupons,

        // Methods
        fetchAvailableCoupons,
        applyCoupon,
        removeCoupon,
        validateCoupon,
        findCouponByCode,
        isCouponApplicable,
        calculateDiscountAmount,
        formatDiscountText,
        clearAppliedCoupon,
        resetDiscountState
    }
}