import { computed, useRuntimeConfig } from '#imports'
import type { UseSeoMetaInput } from '#app'
import { useSystemConfig } from '@/composables/system-config'

export interface SeoOptions {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product' | 'profile'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  tags?: string[]
  noindex?: boolean
  canonical?: string
}

/**
 * Composable để quản lý SEO meta tags
 * Ưu tiên lấy từ system config, fallback về runtime config
 */
export function useSeo(options: SeoOptions = {}) {
  const config = useRuntimeConfig()
  const route = useRoute()
  
  // Lấy system config (có cache)
  const { data: systemConfig, getConfigValue } = useSystemConfig('general', { enableCache: true })
  
  // Helper để kiểm tra giá trị có thực sự tồn tại không (không phải null/undefined/empty)
  const hasValue = (val: any): boolean => {
    if (val === null || val === undefined) return false
    if (typeof val === 'string') return val.trim() !== ''
    return true
  }
  
  // Helper để lấy site URL
  const siteUrl = computed(() => {
    const canonical = getConfigValue('canonical_url')
    if (hasValue(canonical)) return canonical
    return config.public.siteUrl || ''
  })
  
  // Tính toán các giá trị SEO từ options
  const seoTitle = computed(() => {
    if (options.title) {
      const siteName = getConfigValue('og_title') || config.public.siteName || ''
      return options.title.includes(siteName) ? options.title : `${options.title} | ${siteName}`
    }
    return getConfigValue('og_title') || getConfigValue('meta_title') || getConfigValue('site_name') || config.public.siteName || ''
  })
  
  const seoDescription = computed(() => {
    if (options.description) return options.description
    const seoDesc = getConfigValue('meta_description') || getConfigValue('og_description')
    if (hasValue(seoDesc)) return seoDesc
    return config.public.siteDescription || ''
  })
  
  const seoImage = computed(() => {
    if (options.image) {
      return options.image.startsWith('http') ? options.image : `${siteUrl.value}${options.image}`
    }
    const ogImg = getConfigValue('og_image')
    const image = hasValue(ogImg) ? ogImg : (config.public.ogImage || '/default.svg')
    return image.startsWith('http') ? image : `${siteUrl.value}${image}`
  })
  
  const seoUrl = computed(() => {
    if (options.url) {
      return options.url.startsWith('http') ? options.url : `${siteUrl.value}${options.url}`
    }
    return `${siteUrl.value}${route.fullPath}`
  })
  
  const canonicalUrl = computed(() => {
    // Nếu có canonical từ options, dùng nó
    if (options.canonical) {
      return options.canonical.startsWith('http') ? options.canonical : `${siteUrl.value}${options.canonical}`
    }
    
    // Mỗi page có canonical riêng dựa trên route
    return `${siteUrl.value}${route.path}`
  })
  
  const seoType = computed(() => options.type || '')
  
  // Tạo meta tags - lấy trực tiếp từ config theo yêu cầu
  const metaTags = computed<UseSeoMetaInput>(() => {
    // Lấy giá trị trực tiếp từ config
    const siteDescription = getConfigValue('site_description') || ''
    const ogTitle = getConfigValue('og_title') || ''
    const ogDescription = getConfigValue('og_description') || ''
    const ogImage = getConfigValue('og_image') || ''
    const canonicalUrl = getConfigValue('canonical_url') || siteUrl.value || ''
    const ogSiteName = canonicalUrl || getConfigValue('site_name') || config.public.siteName || ''
    
    // Twitter site
    const twitter = getConfigValue('twitter_site')
    const twitterSite = twitter ? `@${twitter}` : null
    
    const meta: UseSeoMetaInput = {
      title: seoTitle.value,
      description: siteDescription, // Lấy từ site_description
      robots: options.noindex ? 'noindex,nofollow' : 'index,follow',
      
      // Meta keywords từ config nếu có
      ...(getConfigValue('meta_keywords') ? { keywords: getConfigValue('meta_keywords') } : {}),
      
      // Open Graph - lấy trực tiếp từ config
      ogTitle: ogTitle, // Lấy từ og_title
      ogDescription: ogDescription, // Lấy từ og_description
      ogImage: ogImage, // Lấy từ og_image
      ogUrl: canonicalUrl, // Lấy từ canonical_url
      ogType: seoType.value,
      ogSiteName: ogSiteName, // Lấy từ canonical_url (hoặc site_name nếu không có)
      
      // Twitter Card
      twitterCard: 'summary_large_image',
      twitterTitle: ogTitle,
      twitterDescription: ogDescription,
      twitterImage: ogImage,
      ...(twitterSite ? { twitterSite } : {}),
    }
    
    // Article specific meta
    if (seoType.value === 'article') {
      if (options.publishedTime) {
        meta.articlePublishedTime = options.publishedTime
      }
      if (options.modifiedTime) {
        meta.articleModifiedTime = options.modifiedTime
      }
      if (options.author) {
        meta.articleAuthor = options.author
      }
      if (options.tags && options.tags.length > 0) {
        meta.articleTag = options.tags
      }
    }
    
    return meta
  })
  
  // Link tags
  const linkTags = computed(() => {
    const links: Array<{ rel: string; href: string }> = []
    
    if (canonicalUrl.value) {
      links.push({
        rel: 'canonical',
        href: canonicalUrl.value
      })
    }
    
    return links
  })
  
  // Structured Data (JSON-LD)
  const structuredData = computed(() => {
    const siteName = getConfigValue('site_name') || config.public.siteName || 'Cửa hàng'
    
    const baseData: any = {
      '@context': 'https://schema.org',
      '@type': seoType.value === 'product' ? 'Product' : seoType.value === 'article' ? 'Article' : 'WebSite',
      name: seoTitle.value,
      description: seoDescription.value,
      url: seoUrl.value,
      image: seoImage.value,
    }
    
    if (seoType.value === 'website') {
      baseData.potentialAction = {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${siteUrl.value}/home/products?search={search_term_string}`
        },
        'query-input': 'required name=search_term_string'
      }
    }
    
    if (seoType.value === 'article') {
      baseData.headline = seoTitle.value
      baseData.datePublished = options.publishedTime
      baseData.dateModified = options.modifiedTime || options.publishedTime
      if (options.author) {
        baseData.author = {
          '@type': 'Person',
          name: options.author
        }
      }
      baseData.publisher = {
        '@type': 'Organization',
        name: siteName,
        logo: {
          '@type': 'ImageObject',
          url: seoImage.value
        }
      }
    }
    
    if (seoType.value === 'product') {
      // Có thể mở rộng thêm với product-specific data
      baseData.brand = {
        '@type': 'Brand',
        name: siteName
      }
    }
    
    return baseData
  })
  
  // Apply SEO - dùng useHead với reactive function để giữ reactivity
  // Gộp tất cả vào một useHead để tránh ghi đè và đảm bảo reactivity
  useHead(() => {
    const meta = metaTags.value
    return {
      title: meta.title,
      meta: [
        { name: 'description', content: meta.description },
        ...(meta.robots ? [{ name: 'robots', content: meta.robots }] : []),
        ...(meta.keywords ? [{ name: 'keywords', content: meta.keywords }] : []),
        // Open Graph
        { property: 'og:title', content: meta.ogTitle },
        { property: 'og:description', content: meta.ogDescription },
        { property: 'og:image', content: meta.ogImage },
        { property: 'og:url', content: meta.ogUrl },
        { property: 'og:type', content: meta.ogType },
        { property: 'og:site_name', content: meta.ogSiteName },
        // Twitter Card
        { name: 'twitter:card', content: meta.twitterCard },
        { name: 'twitter:title', content: meta.twitterTitle },
        { name: 'twitter:description', content: meta.twitterDescription },
        { name: 'twitter:image', content: meta.twitterImage },
        ...(meta.twitterSite ? [{ name: 'twitter:site', content: meta.twitterSite }] : []),
        // Article specific
        ...(meta.articlePublishedTime ? [{ property: 'article:published_time', content: meta.articlePublishedTime }] : []),
        ...(meta.articleModifiedTime ? [{ property: 'article:modified_time', content: meta.articleModifiedTime }] : []),
        ...(meta.articleAuthor ? [{ property: 'article:author', content: meta.articleAuthor }] : []),
        ...(meta.articleTag ? (Array.isArray(meta.articleTag) ? meta.articleTag.map((tag: string) => ({ property: 'article:tag', content: tag })) : [{ property: 'article:tag', content: meta.articleTag }]) : []),
      ],
      link: linkTags.value,
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify(structuredData.value)
        }
      ]
    }
  })
  
  return {
    seoTitle,
    seoDescription,
    seoImage,
    seoUrl,
    canonicalUrl,
    metaTags,
    linkTags,
    structuredData
  }
}

