// Re-export từ types mới (đã được gộp)
export type {
  ApiClientOptions,
  EnhancedError,
  ApiClientMethods,
  EnhancedApiClient,
  ApiClientResult,
  HttpMethod,
  RequestConfig,
  RetryConfig,
  CacheItem,
  ApiResponse,
  ApiFetchOptions,
  ApiFetchResult,
  ApiState,
  PaginationState,
} from '@/types/api'

// Legacy types for backward compatibility
import type { AxiosError } from 'axios'
export interface ApiError extends Error {
  status?: number
  statusText?: string
  data?: any
  method?: string
  url?: string
  timestamp?: string
  userMessage?: string
}

export interface ErrorHandler {
  (error: AxiosError): EnhancedError
}