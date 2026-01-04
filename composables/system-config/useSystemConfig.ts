import { ref, computed, readonly } from 'vue'
import { publicEndpoints } from '../../api/endpoints'
import type { 
  SystemConfigGeneral, 
  SystemConfigCache, 
  SystemConfigOptions, 
  SystemConfigResult 
} from './types'

// ===== CACHE MANAGEMENT =====

// Cache TTL: 1 giờ (3600 giây)
const CACHE_TTL = 60 * 60 * 1000

// Cache key cho localStorage
const CACHE_KEY_PREFIX = 'system-config-cache'

const getStorageKey = (group: string) =>
  group === 'general' ? CACHE_KEY_PREFIX : `${CACHE_KEY_PREFIX}:${group}`

// Helper function để kiểm tra cache có hết hạn không
const isCacheExpired = (timestamp: number): boolean => {
  return Date.now() - timestamp > CACHE_TTL
}

// Helper function để lấy cache từ localStorage
const getCacheFromStorage = (group: string): SystemConfigCache | null => {
  if (typeof window === 'undefined') return null
  
  try {
    const cached = localStorage.getItem(getStorageKey(group))
    if (!cached) return null
    
    const parsedCache: SystemConfigCache = JSON.parse(cached)
    
    // Kiểm tra cache có hết hạn không
    if (isCacheExpired(parsedCache.timestamp)) {
      localStorage.removeItem(getStorageKey(group))
      return null
    }
    
    return parsedCache
  } catch (error) {
    localStorage.removeItem(getStorageKey(group))
    return null
  }
}

// Helper function để lưu cache vào localStorage
const saveCacheToStorage = (group: string, cache: SystemConfigCache): void => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(getStorageKey(group), JSON.stringify(cache))
  } catch (error) {
    // Error saving cache to localStorage
  }
}

// Helper function để xóa cache khỏi localStorage
const clearCacheFromStorage = (group: string): void => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(getStorageKey(group))
  } catch (error) {
    // Error clearing cache from localStorage
  }
}

// ===== COMPOSABLE =====

/**
 * Composable để lấy cấu hình hệ thống với cache 1 giờ
 * Luôn gọi API backend public (không dùng mock data)
 * @param group - Nhóm cấu hình (ví dụ: 'general')
 * @param options - Tùy chọn cache
 */
export function useSystemConfig(
  group: string = 'general',
  options: SystemConfigOptions = {}
): SystemConfigResult {
  const { forceRefresh = false, enableCache = true } = options
  
  /**
   * SSR-safe global state (per-request trên server, hydrated sang client)
   * - data/cache: dùng chung giữa các component/layout/page
   * - tránh leak state giữa requests (không dùng module-level singleton)
   */
  const stateKey = `system-config:${group}`
  const cacheState = useState<SystemConfigCache | null>(`${stateKey}:cache`, () => null)
  const dataState = useState<SystemConfigGeneral | null>(`${stateKey}:data`, () => null)
  
  // Reactive state
  const data = dataState
  const loading = ref(false)
  const error = ref<any>(null)
  
  // Computed để kiểm tra cache có hợp lệ không
  const isCacheValid = computed(() => {
    if (!enableCache || !cacheState.value) return false
    return !isCacheExpired(cacheState.value.timestamp)
  })
  
  const resolveEndpoint = (): string => {
    // Sử dụng API mới cho general config
    if (group === 'general') return publicEndpoints.systemConfigs.general
    // Fallback về API cũ cho các group khác
    return publicEndpoints.systemConfigs.getByGroup(group)
  }

  const resolveFetchUrl = (endpoint: string): string => {
    const config = useRuntimeConfig()
    // Luôn gọi API backend qua apiBase (không dùng mock mode nữa)
    const base = String(config.public.apiBase || '')
    try {
      return new URL(endpoint, base).toString()
    } catch {
      return endpoint
    }
  }

  const getFetchClient = () => (import.meta.server ? useRequestFetch() : $fetch)

  const normalizeConfigData = (responseData: any): SystemConfigGeneral => {
    let configData: SystemConfigGeneral

    // Nếu API trả về format có wrapper { success, data, ... }
    // Ví dụ: { success: true, data: { site_name: "...", ... } }
    if (responseData && typeof responseData === 'object' && !Array.isArray(responseData)) {
      // Kiểm tra nếu có structure { success, data, ... }
      if (responseData.data && typeof responseData.data === 'object' && !Array.isArray(responseData.data)) {
        configData = responseData.data
      } else {
        // Nếu không có wrapper, dùng trực tiếp responseData
        configData = responseData
      }

      // Map legacy fields nếu cần
      if ((configData as any).site_name && !(configData as any).name) {
        ;(configData as any).name = (configData as any).site_name
      }
      return configData
    }

    // Nếu API trả về array của config items (format cũ)
    if (Array.isArray(responseData)) {
      configData = {}
      responseData.forEach((item: any) => {
        if (item?.key && item.value !== undefined) {
          ;(configData as any)[item.key] = item.value
        }
      })
      return configData
    }

    return {}
  }

  const applyConfigData = (configData: SystemConfigGeneral): void => {
    data.value = configData

    if (enableCache) {
      const cacheData: SystemConfigCache = {
        data: configData,
        timestamp: Date.now(),
        ttl: CACHE_TTL
      }

      cacheState.value = cacheData
      saveCacheToStorage(group, cacheData)
    }
  }

  // Function để fetch data từ API
  const fetchData = async (): Promise<void> => {
    try {
      loading.value = true
      error.value = null
      
      const endpoint = resolveEndpoint()
      const url = resolveFetchUrl(endpoint)

      // SSR: dùng request-aware fetch để tránh vấn đề baseURL/origin
      const fetcher = getFetchClient()
      const responseData = await fetcher<any>(url)
      
      const configData = normalizeConfigData(responseData)

      // Nếu backend trả về rỗng/không hợp lệ, throw error
      if (group === 'general' && (!configData || Object.keys(configData).length === 0)) {
        throw new Error('Empty system config response from API')
      }

      applyConfigData(configData)
      
    } catch (err) {
      // Không fallback về mock nữa, chỉ set error
      error.value = err
    } finally {
      loading.value = false
    }
  }
  
  // Function để lấy data (từ cache hoặc fetch mới)
  const getData = async (): Promise<SystemConfigGeneral | null> => {
    // Nếu tắt cache hoặc force refresh, luôn gọi API mới
    if (!enableCache || forceRefresh) {
      await fetchData()
      return data.value
    }
    
    // Kiểm tra cache từ localStorage nếu chưa có trong memory (client only)
    if (!cacheState.value && import.meta.client) {
      const cachedData = getCacheFromStorage(group)
      if (cachedData) {
        cacheState.value = cachedData
        data.value = cachedData.data
        return cachedData.data
      }
    }
    
    // Nếu có cache hợp lệ, dùng cache
    if (isCacheValid.value) {
      data.value = cacheState.value!.data
      return cacheState.value!.data
    }
    
    // Fetch data mới nếu cache không hợp lệ
    await fetchData()
    return data.value
  }
  
  // Function để clear cache
  const clearCache = (): void => {
    cacheState.value = null
    data.value = null
    clearCacheFromStorage(group)
    // System config cache cleared
  }
  
  // Function để refresh data (force fetch)
  const refresh = async (): Promise<void> => {
    await fetchData()
  }
  
  // Function để lấy một config value cụ thể
  const getConfigValue = (key: string, defaultValue: any = null): any => {
    if (!data.value) return defaultValue
    return data.value[key] ?? defaultValue
  }
  
  const systemInfo = computed(() => ({
    name: getConfigValue('site_name') || getConfigValue('name', ''),
    version: getConfigValue('version', ''),
    timezone: getConfigValue('timezone', 'Asia/Ho_Chi_Minh')
  }))
  
  return {
    // State
    data: readonly(data),
    loading: readonly(loading),
    error: readonly(error),
    
    // Computed
    isCacheValid,
    systemInfo,
    
    // Methods
    getData,
    fetchData,
    refresh,
    clearCache,
    getConfigValue
  }
}

// ===== GLOBAL SYSTEM CONFIG COMPOSABLE =====

/**
 * Global composable để lấy cấu hình general (sử dụng ở mọi trang)
 * Mỗi lần load trang sẽ gọi API mới (không dùng cache)
 */
export function useGlobalSystemConfig(): SystemConfigResult {
  return useSystemConfig('general', {
    enableCache: true, // Tắt cache để luôn gọi API mới
    forceRefresh: false  // Force refresh mỗi lần
  })
}
