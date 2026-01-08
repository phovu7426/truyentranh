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
  contacts: {
    create: '/api/public/contacts',
  },
  systemConfigs: {
    getByGroup: (group: string) => `/api/system-configs/group/${group}`,
    general: '/api/public/system-config/general',
  },
  banners: {
    list: '/api/public/banners',
    show: (id: Id) => `/api/public/banners/${id}`,
    getByLocation: (locationCode: string) => `/api/public/banners/location/${locationCode}`,
  },
  homepage: '/api/public/homepage',
  comicCategories: {
    list: '/api/public/comic-categories',
  },
  comics: {
    list: '/api/public/comics',
    showBySlug: (slug: string) => `/api/public/comics/${slug}`,
    trending: '/api/public/comics/trending',
    popular: '/api/public/comics/popular',
    newest: '/api/public/comics/newest',
    getChapters: (slug: string) => `/api/public/comics/${slug}/chapters`,
    getChapterByIndex: (slug: string, chapterIndex: number | string) => `/api/public/comics/${slug}/chapters/${chapterIndex}`,
  },
  chapters: {
    list: '/api/public/chapters',
    show: (id: Id) => `/api/public/chapters/${id}`,
    getPages: (id: Id) => `/api/public/chapters/${id}/pages`,
    getNext: (id: Id) => `/api/public/chapters/${id}/next`,
    getPrev: (id: Id) => `/api/public/chapters/${id}/prev`,
    trackView: (id: Id) => `/api/public/chapters/${id}/view`,
  },
  comments: {
    getByComic: (comicId: Id) => `/api/public/comments/comics/${comicId}`,
    getByChapter: (chapterId: Id) => `/api/public/comments/chapters/${chapterId}`,
  },
  reviews: {
    getByComic: (comicId: Id) => `/api/public/reviews/comics/${comicId}`,
  },
} as const

// User endpoints (require authentication)
export const userEndpoints = {
  bookmarks: {
    list: '/api/user/bookmarks',
    create: '/api/user/bookmarks',
    delete: (id: Id) => `/api/user/bookmarks/${id}`,
  },
  comments: {
    list: '/api/user/comments',
    create: '/api/user/comments',
    update: (id: Id) => `/api/user/comments/${id}`,
    delete: (id: Id) => `/api/user/comments/${id}`,
  },
  follows: {
    list: '/api/user/follows',
    follow: (comicId: Id) => `/api/user/follows/comics/${comicId}`,
    unfollow: (comicId: Id) => `/api/user/follows/comics/${comicId}`,
    isFollowing: (comicId: Id) => `/api/user/follows/comics/${comicId}/is-following`,
  },
  readingHistory: {
    list: '/api/user/reading-history',
    create: '/api/user/reading-history',
    delete: (id: Id) => `/api/user/reading-history/${id}`,
  },
  reviews: {
    list: '/api/user/reviews',
    createOrUpdate: (comicId: Id) => `/api/user/reviews/comics/${comicId}`,
    delete: (comicId: Id) => `/api/user/reviews/comics/${comicId}`,
  },
} as const

export type UserEndpoints = typeof userEndpoints

export type PublicEndpoints = typeof publicEndpoints
