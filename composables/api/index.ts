// API Composables - Provides direct access to API endpoints with enhanced features
import type {
  ApiClientOptions,
  ApiFetchOptions,
  ApiFetchResult
} from './api.types'

// Export directly instead of dynamic import for better Nuxt composable support
export { useApiClient, useGlobalApiClient } from './useApiClient'
export { default as useApiFetch } from './useApiFetch'

// Types
export type {
  ApiClientOptions,
  EnhancedError,
  ApiClientMethods,
  EnhancedApiClient,
  ApiClientResult,
  ApiFetchOptions,
  ApiFetchResult
} from './api.types'

// Utilities
export {
  getTokenFromCookie,
  createRequestKey,
  createEnhancedError,
  getUserFriendlyMessage,
  createDefaultConfig,
  createRequestTracker
} from './api.utils'
