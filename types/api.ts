// ===== API TYPES =====
// Gộp tất cả API types vào một file

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import type { Ref } from 'vue'

// Client types
export interface ApiClientOptions {
  retryAttempts?: number
  retryDelay?: number
  timeout?: number
  enableRetry?: boolean
  preventDuplicateCalls?: boolean
}

export interface EnhancedError extends AxiosError {
  method?: string
  url?: string
  timestamp?: string
  userMessage?: string
}

export interface ApiClientMethods {
  get: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>
  delete: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>
  handleError: (error: AxiosError, method: string, url: string) => EnhancedError
  getUserFriendlyMessage: (error: AxiosError) => string
  clearActiveRequests: () => void
}

export interface EnhancedApiClient extends Omit<AxiosInstance, 'get' | 'post' | 'put' | 'delete' | 'patch'>, ApiClientMethods {}

export interface ApiClientResult {
  apiClient: EnhancedApiClient
}

export type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch'

export interface RequestConfig extends AxiosRequestConfig {
  method: HttpMethod
  url: string
  data?: any
}

export interface RetryConfig {
  attempts: number
  delay: number
  backoff?: 'linear' | 'exponential'
  maxDelay?: number
  retryCondition?: (error: AxiosError) => boolean
}

export interface CacheItem<T = any> {
  data: T
  timestamp: number
  ttl: number
}

export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message: string
  timestamp: string
  errors?: Record<string, string[]>
}

// Common types
export interface ApiFetchOptions {
  immediate?: boolean
  params?: Record<string, any>
}

export interface ApiFetchResult<T = any> {
  data: any
  loading: boolean
  error: any
  fetchData: () => Promise<void>
}

export interface ApiState<T = any> {
  data: T | null
  loading: boolean
  error: string | null
}

export interface PaginationState {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

// Public endpoints
type Id = string | number

export const publicEndpoints = {
  auth: {
    login: '/api/login',
    register: '/api/register',
    logout: '/api/logout',
    refresh: '/api/refresh',
  },
  users: {
    me: '/api/users/me',
    updateProfile: '/api/users/me',
    changePassword: '/api/users/me/password',
  },
  posts: {
    list: '/api/public/posts',
    featured: '/api/public/posts/featured',
    showBySlug: (slug: string) => `/api/public/posts/${slug}`,
  },
  postCategories: {
    list: '/api/public/post-categories',
    showBySlug: (slug: string) => `/api/public/post-categories/${slug}`,
  },
  postTags: {
    list: '/api/public/post-tags',
    showBySlug: (slug: string) => `/api/public/post-tags/${slug}`,
  },
  productCategories: {
    list: '/api/public/product-categories',
    show: (id: Id) => `/api/public/product-categories/${id}`,
    showBySlug: (slug: string) => `/api/public/product-categories/${slug}`,
    tree: '/api/public/product-categories/tree',
    root: '/api/public/product-categories/root',
    popular: '/api/public/product-categories/popular',
    search: '/api/public/product-categories/search',
    products: (id: Id) => `/api/public/product-categories/${id}/products`,
    productsBySlug: (slug: string) => `/api/public/product-categories/${slug}/products`,
  },
  products: {
    list: '/api/public/products',
    show: (id: Id) => `/api/public/products/${id}`,
    showBySlug: (slug: string) => `/api/public/products/${slug}`,
    featured: '/api/public/products/featured',
    bestSelling: '/api/public/products/best-selling',
    newArrivals: '/api/public/products/new-arrivals',
    search: '/api/public/products/search',
    byCategory: (slug: string) => `/api/public/products/category/${slug}`,
    reviews: (id: Id) => `/api/public/products/${id}/reviews`,
  },
  contacts: {
    create: '/api/public/contacts',
  },
  systemConfigs: {
    getByGroup: (group: string) => `/api/system-configs/group/${group}`,
    general: '/api/public/system-config/general',
  },
  orders: {
    list: '/api/public/orders',
    create: '/api/public/orders',
    show: (id: Id) => `/api/public/orders/${id}`,
    cancel: (id: Id) => `/api/public/orders/${id}/cancel`,
    status: (orderNumber: string) => `/api/public/orders/status/${orderNumber}`,
    showGuest: (orderNumber: string, email: string) => `/api/public/orders/guest/${orderNumber}?email=${email}`,
    userAddress: '/api/public/orders/user-address',
    payment: (orderId: Id) => `/api/public/orders/${orderId}/payment`,
  },
  paymentMethods: {
    list: '/api/public/payment-methods',
  },
  shippingMethods: {
    list: '/api/public/shipping-methods',
    active: '/api/public/shipping-methods/active',
    show: (id: Id) => `/api/public/shipping-methods/${id}`,
    calculate: '/api/public/shipping-methods/calculate',
  },
  cart: {
    list: '/api/public/cart',
    add: '/api/public/cart/add',
    update: (itemId: Id) => `/api/public/cart/items/${itemId}`,
    remove: (itemId: Id) => `/api/public/cart/item/${itemId}`,
    clear: '/api/public/cart/clear',
    summary: '/api/public/cart/summary',
  },
  discounts: {
    coupons: {
      available: '/api/public/discounts/coupons/available',
    },
    applyCoupon: '/api/public/discounts/apply-coupon',
    removeCoupon: (cartIdOrUuid: Id) => `/api/public/discounts/remove-coupon/${cartIdOrUuid}`,
    validateCoupon: '/api/public/discounts/validate-coupon',
  },
  payments: {
    list: '/api/public/payments',
    show: (id: Id) => `/api/public/payments/${id}`,
    createUrl: '/api/public/payments/create-url',
    verify: (gateway: string) => `/api/public/payments/verify/${gateway}`,
  },
  banners: {
    list: '/api/public/banners',
    show: (id: Id) => `/api/public/banners/${id}`,
    getByLocation: (locationCode: string) => `/api/public/banners/location/${locationCode}`,
  },
} as const

export type PublicEndpoints = typeof publicEndpoints
