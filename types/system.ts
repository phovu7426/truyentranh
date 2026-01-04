// ===== SYSTEM CONFIG TYPES =====
// Gộp tất cả system types vào một file

import type { Ref, ComputedRef } from 'vue'

export interface SystemConfigItem {
  id: string | number
  key: string
  value: any
  type: 'string' | 'number' | 'boolean' | 'json' | 'array'
  group: string
  description?: string
  is_public?: boolean
  created_at?: string
  updated_at?: string
}

export interface ContactChannel {
  type: string
  value: string
  label?: string | null
  icon?: string | null
  url_template?: string | null
  enabled: boolean
  sort_order?: number | null
}

export interface SystemConfigGeneral {
  id?: number
  site_name?: string
  site_description?: string | null
  site_logo?: string | null
  site_favicon?: string | null
  site_email?: string | null
  site_phone?: string | null
  site_address?: string | null
  site_copyright?: string | null
  timezone?: string
  locale?: string
  currency?: string
  contact_channels?: ContactChannel[] | null
  // SEO Meta Tags
  meta_title?: string | null
  meta_description?: string | null
  meta_keywords?: string | null
  og_title?: string | null
  og_description?: string | null
  og_image?: string | null
  canonical_url?: string | null
  // Tracking & Analytics
  google_analytics_id?: string | null
  google_search_console?: string | null
  facebook_pixel_id?: string | null
  twitter_site?: string | null
  // Audit fields
  created_user_id?: number | null
  updated_user_id?: number | null
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
  // Legacy fields
  name?: string
  version?: string
  [key: string]: any
}

export interface SystemConfigEmail {
  id?: number
  smtp_host?: string
  smtp_port?: number
  smtp_secure?: boolean
  smtp_username?: string
  smtp_password?: string
  from_email?: string
  from_name?: string
  reply_to_email?: string | null
  created_user_id?: number | null
  updated_user_id?: number | null
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
  [key: string]: any
}

export interface SystemConfigCache {
  data: SystemConfigGeneral
  timestamp: number
  ttl: number
}

export interface SystemConfigOptions {
  forceRefresh?: boolean
  enableCache?: boolean
}

export interface SystemConfigResult {
  data: Readonly<Ref<SystemConfigGeneral | null>>
  loading: Readonly<Ref<boolean>>
  error: Readonly<Ref<any>>
  isCacheValid: ComputedRef<boolean>
  systemInfo: ComputedRef<{
    name: string
    version: string
    timezone: string
  }>
  getData: () => Promise<SystemConfigGeneral | null>
  fetchData: () => Promise<void>
  refresh: () => Promise<void>
  clearCache: () => void
  getConfigValue: (key: string, defaultValue?: any) => any
}
