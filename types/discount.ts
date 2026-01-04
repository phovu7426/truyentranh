// Discount types and interfaces for the e-commerce system

export interface Coupon {
    id: number
    code: string
    name: string
    description: string
    discount_type: DiscountType
    discount_value: number
    minimum_order_amount?: number
    maximum_discount_amount?: number
    usage_limit?: number
    usage_count: number
    start_date: string
    end_date: string
    is_active: boolean
    applicable_for: string
    user_usage_count: number
    can_use: boolean
}

export interface AppliedCoupon {
    id: number
    code: string
    name: string
    discount_type: DiscountType
    discount_value: number
    discount_amount: number
}

export interface CartWithDiscount {
    cart_uuid: string
    subtotal: number
    discount_amount: number
    shipping_amount: number
    tax_amount: number
    total_amount: number
    applied_coupon?: AppliedCoupon
    items: CartItem[]
}

export interface CartItem {
    id: number
    product_name: string
    quantity: number
    unit_price: number
    total_price: number
}

export interface AvailableCouponsResponse {
    success: boolean
    message: string
    data: Coupon[]
}

export interface ApplyCouponRequest {
    cart_uuid: string
    coupon_code: string
}

export interface ApplyCouponResponse {
    success: boolean
    message: string
    data: CartWithDiscount
}

export interface RemoveCouponResponse {
    success: boolean
    message: string
    data: CartWithDiscount
}

export interface ValidateCouponRequest {
    coupon_code: string
    cart_total?: number
}

export interface ValidateCouponResponse {
    success: boolean
    message: string
    data: {
        id: number
        code: string
        name: string
        description: string
        discount_type: DiscountType
        discount_value: number
        minimum_order_amount?: number
        maximum_discount_amount?: number
        is_valid: boolean
        estimated_discount: number
        final_amount: number
        user_usage_count: number
        remaining_usage?: number
    }
}

export interface ErrorResponse {
    success: false
    message: string
    code: string
}

// Discount types
export const DISCOUNT_TYPES = {
    PERCENTAGE: 'percentage',
    FIXED_AMOUNT: 'fixed_amount',
    SHIPPING: 'shipping',
    BUY_X_GET_Y: 'buy_x_get_y'
} as const

export type DiscountType = typeof DISCOUNT_TYPES[keyof typeof DISCOUNT_TYPES]

// Discount type labels in Vietnamese
export const DISCOUNT_TYPE_LABELS = {
    [DISCOUNT_TYPES.PERCENTAGE]: 'Giảm theo phần trăm',
    [DISCOUNT_TYPES.FIXED_AMOUNT]: 'Giảm số tiền cố định',
    [DISCOUNT_TYPES.SHIPPING]: 'Miễn phí vận chuyển',
    [DISCOUNT_TYPES.BUY_X_GET_Y]: 'Mua X tặng Y'
} as const

// Coupon status
export const COUPON_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    EXPIRED: 'expired',
    USED_UP: 'used_up'
} as const

export type CouponStatus = typeof COUPON_STATUS[keyof typeof COUPON_STATUS]

// Coupon status labels in Vietnamese
export const COUPON_STATUS_LABELS = {
    [COUPON_STATUS.ACTIVE]: 'Đang hoạt động',
    [COUPON_STATUS.INACTIVE]: 'Không hoạt động',
    [COUPON_STATUS.EXPIRED]: 'Đã hết hạn',
    [COUPON_STATUS.USED_UP]: 'Đã sử dụng hết'
} as const

// Error codes
export const DISCOUNT_ERROR_CODES = {
    INVALID_COUPON: 'INVALID_COUPON',
    MINIMUM_ORDER_NOT_MET: 'MINIMUM_ORDER_NOT_MET',
    USAGE_LIMIT_EXCEEDED: 'USAGE_LIMIT_EXCEEDED',
    COUPON_NOT_FOUND: 'COUPON_NOT_FOUND',
    COUPON_EXPIRED: 'COUPON_EXPIRED',
    COUPON_INACTIVE: 'COUPON_INACTIVE'
} as const

export type DiscountErrorCode = typeof DISCOUNT_ERROR_CODES[keyof typeof DISCOUNT_ERROR_CODES]