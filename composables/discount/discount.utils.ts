import type { Coupon, DiscountType } from '~/types/discount'
import { DISCOUNT_TYPES, DISCOUNT_ERROR_CODES } from '~/types/discount'

// ===== DISCOUNT VALIDATION UTILITIES =====

/**
 * Check if coupon is currently valid based on dates
 */
export function isCouponDateValid(coupon: Coupon): boolean {
    const now = new Date()
    const startDate = new Date(coupon.start_date)
    const endDate = new Date(coupon.end_date)
    
    return now >= startDate && now <= endDate
}

/**
 * Check if coupon has reached its usage limit
 */
export function isCouponUsageLimitReached(coupon: Coupon): boolean {
    if (!coupon.usage_limit) return false
    return coupon.usage_count >= coupon.usage_limit
}

/**
 * Check if user has reached their usage limit for this coupon
 */
export function isUserUsageLimitReached(coupon: Coupon): boolean {
    // This would typically check against user's usage count
    // For now, we'll use the user_usage_count from the coupon
    if (!coupon.usage_limit) return false
    return coupon.user_usage_count >= coupon.usage_limit
}

/**
 * Check if cart total meets minimum order requirement
 */
export function meetsMinimumOrder(coupon: Coupon, cartTotal: number): boolean {
    if (!coupon.minimum_order_amount) return true
    return cartTotal >= coupon.minimum_order_amount
}

/**
 * Comprehensive coupon validation
 */
export function validateCoupon(coupon: Coupon, cartTotal: number): {
    isValid: boolean
    reason?: string
    code?: string
} {
    // Check if coupon is active
    if (!coupon.is_active) {
        return {
            isValid: false,
            reason: 'Mã giảm giá không hoạt động',
            code: DISCOUNT_ERROR_CODES.COUPON_INACTIVE
        }
    }

    // Check date validity
    if (!isCouponDateValid(coupon)) {
        const now = new Date()
        const endDate = new Date(coupon.end_date)
        
        if (now > endDate) {
            return {
                isValid: false,
                reason: 'Mã giảm giá đã hết hạn',
                code: DISCOUNT_ERROR_CODES.COUPON_EXPIRED
            }
        } else {
            return {
                isValid: false,
                reason: 'Mã giảm giá chưa bắt đầu',
                code: DISCOUNT_ERROR_CODES.INVALID_COUPON
            }
        }
    }

    // Check usage limits
    if (isCouponUsageLimitReached(coupon)) {
        return {
            isValid: false,
            reason: 'Mã giảm giá đã được sử dụng hết',
            code: DISCOUNT_ERROR_CODES.USAGE_LIMIT_EXCEEDED
        }
    }

    if (isUserUsageLimitReached(coupon)) {
        return {
            isValid: false,
            reason: 'Bạn đã sử dụng mã giảm giá này số lần tối đa cho phép',
            code: DISCOUNT_ERROR_CODES.USAGE_LIMIT_EXCEEDED
        }
    }

    // Check minimum order
    if (!meetsMinimumOrder(coupon, cartTotal)) {
        return {
            isValid: false,
            reason: `Đơn hàng tối thiểu phải đạt ${formatCurrency(coupon.minimum_order_amount!)} để sử dụng mã này`,
            code: DISCOUNT_ERROR_CODES.MINIMUM_ORDER_NOT_MET
        }
    }

    return { isValid: true }
}

// ===== DISCOUNT CALCULATION UTILITIES =====

/**
 * Calculate discount amount based on coupon type and cart total
 */
export function calculateDiscountAmount(coupon: Coupon, cartTotal: number): number {
    const validation = validateCoupon(coupon, cartTotal)
    if (!validation.isValid) return 0

    let discountAmount = 0

    switch (coupon.discount_type) {
        case DISCOUNT_TYPES.PERCENTAGE:
            discountAmount = cartTotal * (coupon.discount_value / 100)
            break
        case DISCOUNT_TYPES.FIXED_AMOUNT:
            discountAmount = Math.min(coupon.discount_value, cartTotal)
            break
        case DISCOUNT_TYPES.SHIPPING:
            // For shipping discounts, the discount_value would be the shipping cost
            // This is a simplified implementation
            discountAmount = coupon.discount_value
            break
        case DISCOUNT_TYPES.BUY_X_GET_Y:
            // Buy X get Y logic would be more complex and depend on cart items
            // This is a placeholder implementation
            discountAmount = coupon.discount_value
            break
        default:
            discountAmount = 0
    }

    // Apply maximum discount limit if set
    if (coupon.maximum_discount_amount) {
        discountAmount = Math.min(discountAmount, coupon.maximum_discount_amount)
    }

    return Math.round(discountAmount) // Round to avoid floating point issues
}

/**
 * Calculate final amount after applying discount
 */
export function calculateFinalAmount(cartTotal: number, discountAmount: number): number {
    return Math.max(0, cartTotal - discountAmount)
}

// ===== FORMATTING UTILITIES =====

/**
 * Format discount amount for display
 */
export function formatDiscountAmount(coupon: Coupon, cartTotal: number): string {
    const discountAmount = calculateDiscountAmount(coupon, cartTotal)
    
    switch (coupon.discount_type) {
        case DISCOUNT_TYPES.PERCENTAGE:
            return `Giảm ${coupon.discount_value}%`
        case DISCOUNT_TYPES.FIXED_AMOUNT:
            return `Giảm ${formatCurrency(coupon.discount_value)}`
        case DISCOUNT_TYPES.SHIPPING:
            return 'Miễn phí vận chuyển'
        case DISCOUNT_TYPES.BUY_X_GET_Y:
            return `Mua X tặng Y`
        default:
            return 'Giảm giá'
    }
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount)
}

/**
 * Format coupon validity period
 */
export function formatCouponValidity(coupon: Coupon): string {
    const startDate = new Date(coupon.start_date)
    const endDate = new Date(coupon.end_date)
    
    const formatDate = (date: Date) => {
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
    }
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`
}

// ===== COUPON SEARCH AND FILTER UTILITIES =====

/**
 * Find coupon by code (case insensitive)
 */
export function findCouponByCode(coupons: Coupon[], code: string): Coupon | undefined {
    return coupons.find(coupon => 
        coupon.code.toLowerCase() === code.toLowerCase()
    )
}

/**
 * Filter coupons that are applicable for given cart total
 */
export function filterApplicableCoupons(coupons: Coupon[], cartTotal: number): Coupon[] {
    return coupons.filter(coupon => {
        const validation = validateCoupon(coupon, cartTotal)
        return validation.isValid && coupon.can_use
    })
}

/**
 * Sort coupons by discount amount (highest first)
 */
export function sortCouponsByDiscount(coupons: Coupon[], cartTotal: number): Coupon[] {
    return [...coupons].sort((a, b) => {
        const discountA = calculateDiscountAmount(a, cartTotal)
        const discountB = calculateDiscountAmount(b, cartTotal)
        return discountB - discountA
    })
}

/**
 * Get best coupon for given cart total
 */
export function getBestCoupon(coupons: Coupon[], cartTotal: number): Coupon | null {
    const applicableCoupons = filterApplicableCoupons(coupons, cartTotal)
    if (applicableCoupons.length === 0) return null
    
    const sortedCoupons = sortCouponsByDiscount(applicableCoupons, cartTotal)
    return sortedCoupons[0] || null
}

// ===== ERROR HANDLING UTILITIES =====

/**
 * Get user-friendly error message for discount error codes
 */
export function getDiscountErrorMessage(errorCode: string, customMessage?: string): string {
    if (customMessage) return customMessage
    
    const messages: Record<string, string> = {
        [DISCOUNT_ERROR_CODES.INVALID_COUPON]: 'Mã giảm giá không hợp lệ',
        [DISCOUNT_ERROR_CODES.COUPON_NOT_FOUND]: 'Mã giảm giá không tồn tại',
        [DISCOUNT_ERROR_CODES.COUPON_EXPIRED]: 'Mã giảm giá đã hết hạn',
        [DISCOUNT_ERROR_CODES.COUPON_INACTIVE]: 'Mã giảm giá không hoạt động',
        [DISCOUNT_ERROR_CODES.MINIMUM_ORDER_NOT_MET]: 'Đơn hàng chưa đạt mức tối thiểu',
        [DISCOUNT_ERROR_CODES.USAGE_LIMIT_EXCEEDED]: 'Bạn đã sử dụng mã giảm giá này số lần tối đa'
    }
    
    return messages[errorCode] || 'Có lỗi xảy ra với mã giảm giá'
}

/**
 * Check if error is a discount-related error
 */
export function isDiscountError(error: any): boolean {
    return Object.values(DISCOUNT_ERROR_CODES).includes(error.code)
}

// ===== LOCAL STORAGE UTILITIES =====

/**
 * Save applied coupon to local storage
 */
export function saveAppliedCouponToStorage(coupon: AppliedCoupon): void {
    if (process.client) {
        localStorage.setItem('applied_coupon', JSON.stringify(coupon))
    }
}

/**
 * Get applied coupon from local storage
 */
export function getAppliedCouponFromStorage(): any {
    if (process.client) {
        const stored = localStorage.getItem('applied_coupon')
        return stored ? JSON.parse(stored) : null
    }
    return null
}

/**
 * Clear applied coupon from local storage
 */
export function clearAppliedCouponFromStorage(): void {
    if (process.client) {
        localStorage.removeItem('applied_coupon')
    }
}

// Type imports for internal use
import type { AppliedCoupon } from '~/types/discount'