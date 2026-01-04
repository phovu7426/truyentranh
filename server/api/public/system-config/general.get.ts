/**
 * Public API: Lấy cấu hình chung (có cache 1 giờ)
 *
 * Route: GET /api/public/system-config/general
 *
 * Ghi chú:
 * - API này có cache 1 giờ (3600 giây) để tối ưu hiệu năng.
 * - Cache key: 'public:general-config'
 * - Cache tự động bị xóa khi admin cập nhật config.
 * - Proxy đến backend API thực tế.
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase as string

  // Cache TTL: 1 giờ (3600 giây)
  const CACHE_TTL = 60 * 60 * 1000
  const CACHE_KEY = 'public:general-config'

  // Kiểm tra cache
  const cached = await useStorage('cache').getItem<{ data: any; timestamp: number }>(CACHE_KEY)
  
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    // Trả về dữ liệu từ cache
    setHeader(event, 'X-Cache', 'HIT')
    return cached.data
  }

  try {
    // Gọi backend API
    const response: any = await $fetch(`${apiBase}/api/public/system-config/general`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Lưu vào cache
    await useStorage('cache').setItem(CACHE_KEY, {
      data: response,
      timestamp: Date.now()
    })

    setHeader(event, 'X-Cache', 'MISS')
    return response
  } catch (error: any) {
    // Nếu có cache cũ, trả về cache cũ thay vì lỗi
    if (cached) {
      setHeader(event, 'X-Cache', 'STALE')
      return cached.data
    }

    // Nếu không có cache và backend lỗi, trả về config mặc định
    const defaultConfig = {
      site_name: config.public.siteName || 'Cửa hàng',
      site_description: config.public.siteDescription || '',
      site_logo: null,
      site_favicon: null,
      site_email: null,
      site_phone: null,
      site_address: null,
      site_copyright: null,
      timezone: 'Asia/Ho_Chi_Minh',
      locale: 'vi',
      currency: 'VND',
      contact_channels: null,
      meta_title: null,
      meta_description: null,
      meta_keywords: null,
      og_title: null,
      og_description: null,
      og_image: null,
      canonical_url: null,
      google_analytics_id: null,
      google_search_console: null,
      facebook_pixel_id: null,
      twitter_site: null
    }

    // Proxy lỗi từ backend nhưng vẫn trả về default config
    setHeader(event, 'X-Cache', 'ERROR')
    return defaultConfig
  }
})

