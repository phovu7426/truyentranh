import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios'
import type {
  ApiClientOptions,
  EnhancedError,
  EnhancedApiClient,
  ApiClientResult
} from './api.types'
import {
  createRequestKey,
  createEnhancedError,
  getUserFriendlyMessage,
  createDefaultConfig,
  createRequestTracker
} from './api.utils'

/**
 * Get API base URL from environment or config
 */
function getApiBaseUrl(): string {
  // Try to use Nuxt runtime config first
  try {
    const config = useRuntimeConfig()
    if (config?.public?.apiBase) {
      return config.public.apiBase as string
    }
  } catch {
    // useRuntimeConfig might not be available outside of Nuxt context
  }
  
  // Default fallback
  return 'http://127.0.0.1:8000'
}

/**
 * Composable to create and manage API client with basic features
 */
export function useApiClient(options: ApiClientOptions = {}): ApiClientResult {
  const apiBaseUrl = getApiBaseUrl()

  const {
    retryAttempts = 0,
    retryDelay = 1000,
    timeout = 10000,
    enableRetry = false,
    preventDuplicateCalls = true
  } = options

  const activeRequests = createRequestTracker()

  const api: AxiosInstance = axios.create(createDefaultConfig(apiBaseUrl))

  // Use Nuxt's useCookie for SSR support
  // NOTE: secure cookies bị browser block trên HTTP (dev/local). Chỉ bật secure ở production.
  const secureCookie = process.env.NODE_ENV === 'production'
  const authTokenCookie = useCookie('auth_token', {
    httpOnly: false,
    secure: secureCookie,
    sameSite: 'strict',
    default: () => null
  })

  const groupIdCookie = useCookie('group_id', {
    httpOnly: false,
    secure: secureCookie,
    sameSite: 'strict',
    default: () => null
  })

  const getToken = () => authTokenCookie.value
  
  // Get group ID: ưu tiên localStorage, fallback về cookie
  const getGroupId = () => {
    if (process.client) {
      // Ưu tiên localStorage (theo tài liệu mới)
      const storedGroupId = localStorage.getItem('selected_group_id')
      if (storedGroupId) {
        return storedGroupId
      }
    }
    // Fallback về cookie (backward compatible)
    return groupIdCookie.value
  }


  async function handleRequest<T>(
    method: 'get' | 'post' | 'put' | 'delete' | 'patch',
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    const requestKey = createRequestKey(method, url, config)

    if (preventDuplicateCalls && activeRequests.has(requestKey)) {
      return activeRequests.get(requestKey) as Promise<AxiosResponse<T>>
    }

    // Create new request with proper parameter handling
    let requestPromise: Promise<AxiosResponse<T>>

    if (method === 'get') {
      // For GET requests, params should be in config
      requestPromise = api.get(url, config) as Promise<AxiosResponse<T>>
    } else {
      // For other methods, data and config are separate
      requestPromise = (api as any)[method](url, data, config) as Promise<AxiosResponse<T>>
    }

    // Store active request
    if (preventDuplicateCalls) {
      activeRequests.set(requestKey, requestPromise)
    }

    try {
      const response = await requestPromise
      return response
    } finally {
      // Remove from active requests when done
      if (preventDuplicateCalls) {
        activeRequests.delete(requestKey)
      }
    }
  }

  // Request interceptor
  api.interceptors.request.use(
    (config) => {
      // Tự động thêm token vào header nếu có trong cookie
      const token = getToken()
      if (token) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${token}`
      }

      // Tự động thêm X-Group-Id header nếu có
      const groupId = getGroupId()
      if (groupId) {
        config.headers = config.headers || {}
        config.headers['X-Group-Id'] = String(groupId)
      }

      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // Response interceptor
  api.interceptors.response.use(
    (response) => {
      return response
    },
    async (error: AxiosError) => {
      // Xử lý lỗi 401: Token hết hạn → logout
      if (error.response?.status === 401) {
        if (process.client) {
          // Xóa token và group_id
          localStorage.removeItem('auth_token')
          localStorage.removeItem('selected_group_id')
          localStorage.removeItem('user_groups')
          
          // Xóa cookies
          authTokenCookie.value = null
          groupIdCookie.value = null
          
          // Redirect về login
          if (window.location.pathname !== '/auth/login') {
            window.location.href = '/auth/login'
          }
        }
      }
      
      // Xử lý lỗi 403: Không có quyền
      if (error.response?.status === 403) {
        // Log error để debug (không redirect, chỉ hiển thị thông báo)
        console.error('Access denied:', error.response.data)
      }
      
      // Throw error để component có thể xử lý
      return Promise.reject(error)
    }
  )

  // Enhanced methods with better error handling
  const enhancedApi: EnhancedApiClient = {
    ...api,

    async get<T = any>(url: string, config: AxiosRequestConfig = {}): Promise<AxiosResponse<T>> {
      try {
        return await handleRequest<T>('get', url, undefined, config)
      } catch (error) {
        throw this.handleError(error as AxiosError, 'GET', url)
      }
    },

    async post<T = any>(url: string, data: any = {}, config: AxiosRequestConfig = {}): Promise<AxiosResponse<T>> {
      try {
        return await handleRequest<T>('post', url, data, config)
      } catch (error) {
        throw this.handleError(error as AxiosError, 'POST', url)
      }
    },

    async put<T = any>(url: string, data: any = {}, config: AxiosRequestConfig = {}): Promise<AxiosResponse<T>> {
      try {
        return await handleRequest<T>('put', url, data, config)
      } catch (error) {
        throw this.handleError(error as AxiosError, 'PUT', url)
      }
    },

    async delete<T = any>(url: string, config: AxiosRequestConfig = {}): Promise<AxiosResponse<T>> {
      try {
        return await handleRequest<T>('delete', url, undefined, config)
      } catch (error) {
        throw this.handleError(error as AxiosError, 'DELETE', url)
      }
    },

    async patch<T = any>(url: string, data: any = {}, config: AxiosRequestConfig = {}): Promise<AxiosResponse<T>> {
      try {
        return await handleRequest<T>('patch', url, data, config)
      } catch (error) {
        throw this.handleError(error as AxiosError, 'PATCH', url)
      }
    },

    handleError(error: AxiosError, method: string, url: string): EnhancedError {
      return createEnhancedError(error, method, url)
    },

    getUserFriendlyMessage(error: AxiosError): string {
      return getUserFriendlyMessage(error)
    },

    clearActiveRequests(): void {
      activeRequests.clear()
    }
  } as EnhancedApiClient

  return {
    apiClient: enhancedApi
  }
}

// ===== SINGLETON INSTANCE =====

// Global API client instance để tránh duplicate calls across components
let globalApiClient: EnhancedApiClient | null = null

export function useGlobalApiClient(): { apiClient: EnhancedApiClient } {
  /**
   * IMPORTANT (SSR):
   * Không cache singleton trên server để tránh dùng chung instance giữa requests,
   * có thể dẫn tới leak cookie/context và hành vi không nhất quán.
   */
  if (process.server) {
    return useApiClient({ preventDuplicateCalls: true })
  }

  if (!globalApiClient) {
    const { apiClient } = useApiClient({ preventDuplicateCalls: true })
    globalApiClient = apiClient
  }

  return { apiClient: globalApiClient }
}
