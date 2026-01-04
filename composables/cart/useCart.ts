import { ref, computed, readonly, nextTick } from 'vue'
import type {
    Cart,
    CartItem,
    CartSummary,
    AddToCartRequest,
    UpdateCartItemRequest,
    ApplyCouponRequest,
    CartResponse,
    CartSummaryResponse,
    CartActionResponse
} from '~/types/cart'
import { publicEndpoints } from '@/api/endpoints'
import { useApiClient } from '~/composables/api/useApiClient'
import { useApiBase } from '~/composables/api/useApiBase'
import { useToast } from '~/composables/ui/useToast'
import { useDiscount } from '~/composables/discount/useDiscount'
import { getOrCreateCartUuid, setCartUuid, isValidUUID, migrateFromSessionIdToUuid, generateUUID } from '~/utils/uuid'

// Reactive state
const cart = ref<Cart | null>(null)
const cartUuid = ref<string | null>(null)
const { state, isLoading, errorMessage, setLoading, setError, handleApiCall } = useApiBase<Cart>()

// Helper function to get cart UUID from sessionStorage or create new
const getCartUuidFromSessionOrCreate = (): string => {
    if (typeof window === 'undefined') {
        // Server-side, return empty string for now
        return ''
    }

    let cartUuid = sessionStorage.getItem('cart_uuid')
    if (!cartUuid || !isValidUUID(cartUuid)) {
        cartUuid = generateUUID()
        sessionStorage.setItem('cart_uuid', cartUuid)
    }

    return cartUuid
}

// Initialize cart UUID
const initializeCartUuid = () => {
    if (typeof window !== 'undefined') {
        // Client-side only
        if (!cartUuid.value) {
            // Try to get from sessionStorage first, then migrate from session_id to cart_uuid
            const existingCartUuid = sessionStorage.getItem('cart_uuid')

            if (existingCartUuid && isValidUUID(existingCartUuid)) {
                cartUuid.value = existingCartUuid
            } else {
                // Try to migrate from session_id to cart_uuid first
                cartUuid.value = migrateFromSessionIdToUuid()
            }
        }
    }
}

// Sync cart UUID with response from API
const syncCartUuid = (responseUuid: string) => {
    if (responseUuid && responseUuid !== cartUuid.value) {

        // Only sync if we don't have a valid cart_uuid or if the server has items
        // This prevents server from overriding our client-side cart_uuid unnecessarily
        if (!cartUuid.value || !isValidUUID(cartUuid.value)) {
            cartUuid.value = responseUuid
            // Use sessionStorage instead of localStorage
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('cart_uuid', responseUuid)
            }
        }
    }
}

// Set cart UUID from external source (for debugging/manual sync)
const setCartUuidFromExternal = (newCartUuid: string) => {
    if (newCartUuid) {
        // Check if it's a UUID or an owner_key
        if (isValidUUID(newCartUuid)) {
            cartUuid.value = newCartUuid
            // Use sessionStorage instead of localStorage
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('cart_uuid', newCartUuid)
            }
        } else {
            // It's an owner_key, store it for API calls
            if (typeof window !== 'undefined') {
                localStorage.setItem('cart_owner_key', newCartUuid)
            }
        }
    }
}

export function useCart() {
    // Initialize cart UUID when composable is used
    // Only initialize if not already set to preserve SSR state
    if (!cartUuid.value && typeof window !== 'undefined') {
        initializeCartUuid()
    }

    // Computed properties
    const items = computed(() => cart.value?.items || [])
    const itemsCount = computed(() => items.value.reduce((total, item) => total + item.quantity, 0) || 0)
    const subtotal = computed(() => cart.value?.subtotal || 0)
    const tax = computed(() => cart.value?.tax || 0)
    const shippingCost = computed(() => cart.value?.shipping_cost || 0)
    const discountAmount = computed(() => cart.value?.discount_amount || 0)
    const totalAmount = computed(() => cart.value?.total_amount || 0)
    const appliedCoupon = computed(() => cart.value?.applied_coupon || null)
    const hasItems = computed(() => itemsCount.value > 0)
    const isEmpty = computed(() => itemsCount.value === 0)
    const hasAppliedCoupon = computed(() => !!appliedCoupon.value)

    // Get API client and toast
    const { apiClient } = useApiClient()
    const { showSuccess, showError } = useToast()
    const {
        applyCoupon: applyDiscountCoupon,
        removeCoupon: removeDiscountCoupon,
        validateCoupon,
        fetchAvailableCoupons
    } = useDiscount()

    // Fetch cart from API using cart_uuid
    const fetchCart = async () => {
        if (!cartUuid.value) {
            // Always get from sessionStorage or create new on client-side
            if (typeof window !== 'undefined') {
                cartUuid.value = getCartUuidFromSessionOrCreate()
            } else {
                // Server-side, just use getOrCreateCartUuid
                cartUuid.value = getOrCreateCartUuid()
            }
        }

        try {

            // Always use cart_uuid, not owner_key
            const response = await handleApiCall(
                () => apiClient.get(`${publicEndpoints.cart.list}?cart_uuid=${cartUuid.value}`)
            )

            if (response && response.data) {
                // Extract the actual cart data from the nested response structure
                const cartData = response.data.data || response.data

                // Sync cartUuid with response from API
                if (cartData.cart_uuid) {
                    syncCartUuid(cartData.cart_uuid)
                }

                // Don't store owner_key from server to avoid conflicts
                // We'll stick with cart_uuid from sessionStorage

                // Map API response to expected Cart structure

                const mappedItems = (cartData.items || []).map((item: any) => {
                    return {
                        id: item.id || '',
                        product_id: item.product_id || '',
                        product_name: item.product_name || '',
                        product_slug: item.product_slug || '',
                        product_image: item.product_image || item.variant?.image || null,
                        variant_id: item.product_variant_id || '',
                        variant_name: item.variant_name || '',
                        quantity: item.quantity || 0,
                        price: parseFloat(item.unit_price || '0'),
                        total_price: parseFloat(item.total_price || '0'),
                        variant: item.variant || null,
                        created_at: item.created_at || new Date().toISOString(),
                        updated_at: item.updated_at || new Date().toISOString()
                    }
                })

                cart.value = {
                    id: cartData.cart_id || 0,
                    items: mappedItems,
                    subtotal: parseFloat(cartData.subtotal || '0'),
                    tax: parseFloat(cartData.tax_amount || '0'),
                    shipping_cost: parseFloat(cartData.shipping_amount || '0'),
                    discount_amount: parseFloat(cartData.discount_amount || '0'),
                    total_amount: parseFloat(cartData.total_amount || '0'),
                    currency: 'VND',
                    applied_coupon: cartData.applied_coupon || undefined,
                    cart_uuid: cartData.cart_uuid || cartUuid.value,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
                return cart.value
            }

            // If no response, create empty cart
            cart.value = {
                id: 0,
                items: [],
                subtotal: 0,
                tax: 0,
                shipping_cost: 0,
                discount_amount: 0,
                total_amount: 0,
                currency: 'VND',
                applied_coupon: undefined,
                cart_uuid: cartUuid.value,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
            return cart.value
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Không thể tải giỏ hàng'
            setError(errorMessage)

            // Create empty cart on error to prevent UI from breaking
            cart.value = {
                id: 0,
                items: [],
                subtotal: 0,
                tax: 0,
                shipping_cost: 0,
                discount_amount: 0,
                total_amount: 0,
                currency: 'VND',
                applied_coupon: undefined,
                cart_uuid: cartUuid.value,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
            throw error
        }
    }

    // Add item to cart using cart_uuid or owner_key
    const addToCart = async (request: AddToCartRequest) => {
        if (!cartUuid.value) {
            // Always get from sessionStorage or create new on client-side
            if (typeof window !== 'undefined') {
                cartUuid.value = getCartUuidFromSessionOrCreate()
            } else {
                // Server-side, just use getOrCreateCartUuid
                cartUuid.value = getOrCreateCartUuid()
            }
        }

        try {
            // Add cart_uuid to request (no owner_key)
            const enhancedRequest = {
                ...request,
                cart_uuid: cartUuid.value || ''
            }

            const response = await handleApiCall(
                () => apiClient.post(publicEndpoints.cart.add, enhancedRequest)
            )

            if (response && response.data) {
                // Extract the actual cart data from the nested response structure
                const cartData = response.data.data || response.data

                // Sync cartUuid with response from API
                if (cartData.cart_uuid) {
                    syncCartUuid(cartData.cart_uuid)
                }

                // Map API response to expected Cart structure

                const mappedItems = (cartData.items || []).map((item: any) => {
                    return {
                        id: item.id || '',
                        product_id: item.product_id || '',
                        product_name: item.product_name || '',
                        product_slug: item.product_slug || '',
                        product_image: item.product_image || item.variant?.image || null,
                        variant_id: item.product_variant_id || '',
                        variant_name: item.variant_name || '',
                        quantity: item.quantity || 0,
                        price: parseFloat(item.unit_price || '0'),
                        total_price: parseFloat(item.total_price || '0'),
                        variant: item.variant || null,
                        created_at: item.created_at || new Date().toISOString(),
                        updated_at: item.updated_at || new Date().toISOString()
                    }
                })

                cart.value = {
                    id: cartData.cart_id || 0,
                    items: mappedItems,
                    subtotal: parseFloat(cartData.subtotal || '0'),
                    tax: parseFloat(cartData.tax_amount || '0'),
                    shipping_cost: parseFloat(cartData.shipping_amount || '0'),
                    discount_amount: parseFloat(cartData.discount_amount || '0'),
                    total_amount: parseFloat(cartData.total_amount || '0'),
                    currency: 'VND',
                    applied_coupon: cartData.applied_coupon || undefined,
                    cart_uuid: cartData.cart_uuid || cartUuid.value || '',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
                showSuccess('Đã thêm sản phẩm vào giỏ hàng')
                return cart.value
            }

            return cart.value
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Không thể thêm sản phẩm vào giỏ hàng'
            showError(errorMessage)
            throw error
        }
    }

    // Update cart item quantity
    const updateCartItem = async (itemId: string, request: UpdateCartItemRequest) => {
        if (!cartUuid.value) {
            // Always get from sessionStorage or create new on client-side
            if (typeof window !== 'undefined') {
                cartUuid.value = getCartUuidFromSessionOrCreate()
            } else {
                // Server-side, just use getOrCreateCartUuid
                cartUuid.value = getOrCreateCartUuid()
            }
        }

        try {
            // Add cart_uuid to request (no owner_key)
            const enhancedRequest = {
                ...request,
                cart_uuid: cartUuid.value || ''
            }

            const response = await handleApiCall(
                () => apiClient.put(publicEndpoints.cart.update(itemId), enhancedRequest)
            )

            if (response && response.data) {
                // Extract the actual cart data from the nested response structure
                const cartData = response.data.data || response.data

                // Sync cartUuid with response from API
                if (cartData.cart_uuid) {
                    syncCartUuid(cartData.cart_uuid)
                }

                // Map API response to expected Cart structure

                const mappedItems = (cartData.items || []).map((item: any) => {
                    return {
                        id: item.id || '',
                        product_id: item.product_id || '',
                        product_name: item.product_name || '',
                        product_slug: item.product_slug || '',
                        product_image: item.product_image || item.variant?.image || null,
                        variant_id: item.product_variant_id || '',
                        variant_name: item.variant_name || '',
                        quantity: item.quantity || 0,
                        price: parseFloat(item.unit_price || '0'),
                        total_price: parseFloat(item.total_price || '0'),
                        variant: item.variant || null,
                        created_at: item.created_at || new Date().toISOString(),
                        updated_at: item.updated_at || new Date().toISOString()
                    }
                })

                cart.value = {
                    id: cartData.cart_id || 0,
                    items: mappedItems,
                    subtotal: parseFloat(cartData.subtotal || '0'),
                    tax: parseFloat(cartData.tax_amount || '0'),
                    shipping_cost: parseFloat(cartData.shipping_amount || '0'),
                    discount_amount: parseFloat(cartData.discount_amount || '0'),
                    total_amount: parseFloat(cartData.total_amount || '0'),
                    currency: 'VND',
                    applied_coupon: cartData.applied_coupon || undefined,
                    cart_uuid: cartData.cart_uuid || cartUuid.value || '',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
                showSuccess('Đã cập nhật giỏ hàng')
                return cart.value
            }

            return cart.value
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Không thể cập nhật giỏ hàng'
            showError(errorMessage)
            throw error
        }
    }

    // Remove item from cart
    const removeFromCart = async (itemId: string) => {
        if (!cartUuid.value) {
            // Always get from sessionStorage or create new on client-side
            if (typeof window !== 'undefined') {
                cartUuid.value = getCartUuidFromSessionOrCreate()
            } else {
                // Server-side, just use getOrCreateCartUuid
                cartUuid.value = getOrCreateCartUuid()
            }
        }

        try {
            // Always use cart_uuid
            const url = `${publicEndpoints.cart.remove(itemId)}?cart_uuid=${cartUuid.value}`

            const response = await handleApiCall(
                () => apiClient.delete(url)
            )

            if (response && response.data) {
                // Extract the actual cart data from the nested response structure
                const cartData = response.data.data || response.data

                // Sync cartUuid with response from API
                if (cartData.cart_uuid) {
                    syncCartUuid(cartData.cart_uuid)
                }

                // Map API response to expected Cart structure
                cart.value = {
                    id: cartData.cart_id || 0,
                    items: (cartData.items || []).map((item: any) => ({
                        id: item.id || '',
                        product_id: item.product_id || '',
                        product_name: item.product_name || '',
                        product_slug: item.product_slug || '',
                        product_image: item.product_image || item.variant?.image || null,
                        variant_id: item.product_variant_id || '',
                        variant_name: item.variant_name || '',
                        quantity: item.quantity || 0,
                        price: parseFloat(item.unit_price || '0'),
                        total_price: parseFloat(item.total_price || '0'),
                        variant: item.variant || null,
                        created_at: item.created_at || new Date().toISOString(),
                        updated_at: item.updated_at || new Date().toISOString()
                    })),
                    subtotal: parseFloat(cartData.subtotal || '0'),
                    tax: parseFloat(cartData.tax_amount || '0'),
                    shipping_cost: parseFloat(cartData.shipping_amount || '0'),
                    discount_amount: parseFloat(cartData.discount_amount || '0'),
                    total_amount: parseFloat(cartData.total_amount || '0'),
                    currency: 'VND',
                    applied_coupon: cartData.applied_coupon || undefined,
                    cart_uuid: cartData.cart_uuid || cartUuid.value || '',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
                showSuccess('Đã xóa sản phẩm khỏi giỏ hàng')
                return cart.value
            }

            return cart.value
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Không thể xóa sản phẩm khỏi giỏ hàng'
            showError(errorMessage)
            throw error
        }
    }

    // Clear entire cart
    const clearCart = async () => {
        if (!cartUuid.value) {
            // Always get from sessionStorage or create new on client-side
            if (typeof window !== 'undefined') {
                cartUuid.value = getCartUuidFromSessionOrCreate()
            } else {
                // Server-side, just use getOrCreateCartUuid
                cartUuid.value = getOrCreateCartUuid()
            }
        }

        try {
            // Always use cart_uuid
            const url = `${publicEndpoints.cart.clear}?cart_uuid=${cartUuid.value}`

            const response = await handleApiCall(
                () => apiClient.delete(url)
            )

            if (response && response.data) {
                // Extract the actual cart data from the nested response structure
                const cartData = response.data.data || response.data

                // Sync cartUuid with response from API
                if (cartData.cart_uuid) {
                    syncCartUuid(cartData.cart_uuid)
                }

                // Map API response to expected Cart structure
                cart.value = {
                    id: cartData.cart_id || 0,
                    items: (cartData.items || []).map((item: any) => ({
                        id: item.id || '',
                        product_id: item.product_id || '',
                        product_name: item.product_name || '',
                        product_slug: item.product_slug || '',
                        product_image: item.product_image || item.variant?.image || null,
                        variant_id: item.product_variant_id || '',
                        variant_name: item.variant_name || '',
                        quantity: item.quantity || 0,
                        price: parseFloat(item.unit_price || '0'),
                        total_price: parseFloat(item.total_price || '0'),
                        variant: item.variant || null,
                        created_at: item.created_at || new Date().toISOString(),
                        updated_at: item.updated_at || new Date().toISOString()
                    })),
                    subtotal: parseFloat(cartData.subtotal || '0'),
                    tax: parseFloat(cartData.tax_amount || '0'),
                    shipping_cost: parseFloat(cartData.shipping_amount || '0'),
                    discount_amount: parseFloat(cartData.discount_amount || '0'),
                    total_amount: parseFloat(cartData.total_amount || '0'),
                    currency: 'VND',
                    applied_coupon: cartData.applied_coupon || undefined,
                    cart_uuid: cartData.cart_uuid || cartUuid.value || '',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
                showSuccess('Đã xóa giỏ hàng')
                return cart.value
            }

            return cart.value
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Không thể xóa giỏ hàng'
            showError(errorMessage)
            throw error
        }
    }

    // Apply coupon to cart
    const applyCoupon = async (couponCode: string) => {
        if (!cartUuid.value) {
            // Always get from sessionStorage or create new on client-side
            if (typeof window !== 'undefined') {
                cartUuid.value = getCartUuidFromSessionOrCreate()
            } else {
                // Server-side, just use getOrCreateCartUuid
                cartUuid.value = getOrCreateCartUuid()
            }
        }

        try {
            const request = {
                coupon_code: couponCode,
                cart_uuid: cartUuid.value || ''
            }

            const response = await handleApiCall(
                () => apiClient.post(publicEndpoints.cart.applyCoupon, request)
            )

            if (response && response.data) {
                // Extract the actual cart data from the nested response structure
                const cartData = response.data.data || response.data

                // Sync cartUuid with response from API
                if (cartData.cart_uuid) {
                    syncCartUuid(cartData.cart_uuid)
                }

                // Map API response to expected Cart structure
                cart.value = {
                    id: cartData.cart_id || 0,
                    items: (cartData.items || []).map((item: any) => ({
                        id: item.id || '',
                        product_id: item.product_id || '',
                        product_name: item.product_name || '',
                        product_slug: item.product_slug || '',
                        product_image: item.product_image || item.variant?.image || null,
                        variant_id: item.product_variant_id || '',
                        variant_name: item.variant_name || '',
                        quantity: item.quantity || 0,
                        price: parseFloat(item.unit_price || '0'),
                        total_price: parseFloat(item.total_price || '0'),
                        variant: item.variant || null,
                        created_at: item.created_at || new Date().toISOString(),
                        updated_at: item.updated_at || new Date().toISOString()
                    })),
                    subtotal: parseFloat(cartData.subtotal || '0'),
                    tax: parseFloat(cartData.tax_amount || '0'),
                    shipping_cost: parseFloat(cartData.shipping_amount || '0'),
                    discount_amount: parseFloat(cartData.discount_amount || '0'),
                    total_amount: parseFloat(cartData.total_amount || '0'),
                    currency: 'VND',
                    applied_coupon: cartData.applied_coupon || undefined,
                    cart_uuid: cartData.cart_uuid || cartUuid.value || '',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
                showSuccess('Đã áp dụng mã giảm giá')
                return response.data
            }

            return cart.value
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Không thể áp dụng mã giảm giá'
            showError(errorMessage)
            throw error
        }
    }

    // Remove coupon from cart
    const removeCoupon = async () => {
        if (!cartUuid.value) {
            // Always get from sessionStorage or create new on client-side
            if (typeof window !== 'undefined') {
                cartUuid.value = getCartUuidFromSessionOrCreate()
            } else {
                // Server-side, just use getOrCreateCartUuid
                cartUuid.value = getOrCreateCartUuid()
            }
        }

        try {
            const request = {
                cart_uuid: cartUuid.value || ''
            }

            const response = await handleApiCall(
                () => apiClient.delete(publicEndpoints.cart.removeCoupon, { data: request })
            )

            if (response && response.data) {
                // Extract the actual cart data from the nested response structure
                const cartData = response.data.data || response.data

                // Sync cartUuid with response from API
                if (cartData.cart_uuid) {
                    syncCartUuid(cartData.cart_uuid)
                }

                // Map API response to expected Cart structure
                cart.value = {
                    id: cartData.cart_id || 0,
                    items: (cartData.items || []).map((item: any) => ({
                        id: item.id || '',
                        product_id: item.product_id || '',
                        product_name: item.product_name || '',
                        product_slug: item.product_slug || '',
                        product_image: item.product_image || item.variant?.image || null,
                        variant_id: item.product_variant_id || '',
                        variant_name: item.variant_name || '',
                        quantity: item.quantity || 0,
                        price: parseFloat(item.unit_price || '0'),
                        total_price: parseFloat(item.total_price || '0'),
                        variant: item.variant || null,
                        created_at: item.created_at || new Date().toISOString(),
                        updated_at: item.updated_at || new Date().toISOString()
                    })),
                    subtotal: parseFloat(cartData.subtotal || '0'),
                    tax: parseFloat(cartData.tax_amount || '0'),
                    shipping_cost: parseFloat(cartData.shipping_amount || '0'),
                    discount_amount: parseFloat(cartData.discount_amount || '0'),
                    total_amount: parseFloat(cartData.total_amount || '0'),
                    currency: 'VND',
                    applied_coupon: cartData.applied_coupon || undefined,
                    cart_uuid: cartData.cart_uuid || cartUuid.value || '',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
                showSuccess('Đã xóa mã giảm giá')
                return response.data
            }

            return cart.value
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Không thể xóa mã giảm giá'
            showError(errorMessage)
            throw error
        }
    }

    // Get available coupons for current cart
    const getAvailableCoupons = async () => {
        try {
            return await fetchAvailableCoupons()
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Không thể lấy danh sách mã giảm giá'
            showError(errorMessage)
            return []
        }
    }

    // Get cart summary
    const getCartSummary = async () => {
        if (!cartUuid.value) {
            // Always get from sessionStorage or create new on client-side
            if (typeof window !== 'undefined') {
                cartUuid.value = getCartUuidFromSessionOrCreate()
            } else {
                // Server-side, just use getOrCreateCartUuid
                cartUuid.value = getOrCreateCartUuid()
            }
        }

        try {
            // Always use cart_uuid
            const url = `${publicEndpoints.cart.summary}?cart_uuid=${cartUuid.value}`

            const response = await handleApiCall(
                () => apiClient.get(url)
            )

            if (response && response.data) {
                // Extract the actual cart data from the nested response structure
                const cartData = response.data.data || response.data
                return cartData
            }

            return null
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Không thể lấy thông tin tóm tắt giỏ hàng'
            showError(errorMessage)
            return null
        }
    }

    // Initialize cart on composable creation
    const initializeCart = async () => {
        try {
            // On client-side, always prioritize sessionStorage
            if (typeof window !== 'undefined') {
                const storedCartUuid = sessionStorage.getItem('cart_uuid')
                const storedOwnerKey = localStorage.getItem('cart_owner_key')

                // Always use the stored cart UUID if it exists and is valid
                if (storedCartUuid && isValidUUID(storedCartUuid)) {
                    cartUuid.value = storedCartUuid
                    // Also update sessionStorage to ensure consistency
                    sessionStorage.setItem('cart_uuid', storedCartUuid)
                } else if (!cartUuid.value) {
                    // Only create new if we don't have any cart UUID
                    cartUuid.value = getCartUuidFromSessionOrCreate()
                }

            } else {
                // Server-side, just proceed with current cartUuid
            }

            await fetchCart()

            // After fetching, check if we have items but they're not displaying properly
            // This could be a session ID mismatch issue
            if (cart.value && cart.value.items.length > 0 && items.value.length === 0) {

                // Try to force a reactivity update
                const tempCart = { ...cart.value }
                cart.value = null
                await nextTick()
                cart.value = tempCart
            }
        } catch (error) {
            // Don't throw error here, just handle it silently
            // The cart will be set to empty state in fetchCart error handler
        }
    }

    return {
        // State
        cart: readonly(cart),
        cartUuid: readonly(cartUuid),
        isLoading,
        errorMessage,

        // Computed properties
        items,
        itemsCount,
        subtotal,
        tax,
        shippingCost,
        discountAmount,
        totalAmount,
        appliedCoupon,
        hasItems,
        isEmpty,
        hasAppliedCoupon,

        // Methods
        fetchCart,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        getCartSummary,
        applyCoupon,
        removeCoupon,
        getAvailableCoupons,
        initializeCart,
        getOrCreateCartUuid,
        setCartUuidFromExternal
    }
}