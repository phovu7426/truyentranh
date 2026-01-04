import { computed } from 'vue'
import { useGlobalSystemConfig } from '@/composables/system-config'

/**
 * Composable để setup SEO meta tags và tracking scripts ở app level
 * Lấy từ system config và apply vào <head>
 */
export function useAppSEO() {
  const { getConfigValue } = useGlobalSystemConfig()
  const config = useRuntimeConfig()
  const route = useRoute()

  // Helper để kiểm tra giá trị có thực sự tồn tại không
  const hasValue = (val: any): boolean => {
    if (val === null || val === undefined) return false
    if (typeof val === 'string') return val.trim() !== ''
    return true
  }

  // Lấy các giá trị từ config
  const siteFavicon = computed(() => getConfigValue('site_favicon') || null)
  const siteName = computed(() => getConfigValue('site_name') || 'Hệ thống')
  const siteUrl = computed(() => getConfigValue('canonical_url') || config.public.siteUrl || '')

  // SEO meta tags từ system config
  const metaTitle = computed(() => getConfigValue('meta_title') || siteName.value)
  const metaKeywords = computed(() => getConfigValue('meta_keywords') || null)
  
  // Mô tả website (dùng cho UI, không phải SEO)
  const siteDescription = computed(() => {
    return getConfigValue('site_description') || 
           'Hệ thống'
  })

  // SEO meta description (riêng biệt với site_description)
  const metaDescription = computed(() => {
    // Ưu tiên meta_description từ API (dành cho SEO)
    const metaDesc = getConfigValue('meta_description')
    if (hasValue(metaDesc)) return metaDesc
    
    // Fallback về site_description nếu không có meta_description
    const siteDesc = getConfigValue('site_description')
    if (hasValue(siteDesc)) return siteDesc
    
    return 'Hệ thống'
  })

  // Open Graph từ system config
  const ogTitle = computed(() => {
    const ogTitleVal = getConfigValue('og_title')
    if (hasValue(ogTitleVal)) return ogTitleVal
    return metaTitle.value
  })

  const ogDescription = computed(() => {
    // Ưu tiên og_description từ API, nếu không có thì dùng site_description
    const ogDesc = getConfigValue('og_description')
    if (hasValue(ogDesc)) return ogDesc
    
    const siteDesc = getConfigValue('site_description')
    if (hasValue(siteDesc)) return siteDesc
    
    return metaDescription.value
  })

  const ogImage = computed(() => {
    const image = getConfigValue('og_image')
    if (!image) return null
    return image.startsWith('http') ? image : `${siteUrl.value}${image}`
  })

  // Canonical URL từ system config
  const canonicalUrl = computed(() => getConfigValue('canonical_url') || siteUrl.value)
  
  const twitterSite = computed(() => {
    const twitter = getConfigValue('twitter_site')
    return twitter ? `@${twitter}` : null
  })

  // Tracking & Analytics từ system config
  const googleAnalyticsId = computed(() => getConfigValue('google_analytics_id') || null)
  const googleSearchConsole = computed(() => getConfigValue('google_search_console') || null)
  const facebookPixelId = computed(() => getConfigValue('facebook_pixel_id') || null)

  // Set <head> theo reactive values
  useHead(() => {
    const head: any = {
      meta: [
        {
          name: 'description',
          content: metaDescription.value // SEO meta description (riêng biệt)
        }
      ]
    }

    // Meta keywords nếu có
    if (metaKeywords.value) {
      head.meta.push({
        name: 'keywords',
        content: metaKeywords.value
      })
    }

    // Chỉ set title mặc định nếu không có page nào override (fallback)
    // Các page sẽ tự set title riêng
    if (!route.meta?.title) {
      head.title = metaTitle.value
    }

    // Open Graph meta tags
    head.meta.push(
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: siteName.value },
      { property: 'og:title', content: ogTitle.value },
      { property: 'og:description', content: ogDescription.value },
      { property: 'og:url', content: canonicalUrl.value || `${siteUrl.value}${route.fullPath}` }
    )

    if (ogImage.value) {
      head.meta.push({ property: 'og:image', content: ogImage.value })
    }

    // Twitter Card meta tags
    head.meta.push(
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: ogTitle.value },
      { name: 'twitter:description', content: ogDescription.value }
    )

    if (ogImage.value) {
      head.meta.push({ name: 'twitter:image', content: ogImage.value })
    }

    if (twitterSite.value) {
      head.meta.push({ name: 'twitter:site', content: twitterSite.value })
    }

    // Link tags
    head.link = []

    // Canonical URL
    if (canonicalUrl.value) {
      head.link.push({
        rel: 'canonical',
        href: canonicalUrl.value
      })
    }

    // Thêm favicon nếu có
    if (siteFavicon.value) {
      head.link.push({
        rel: 'icon',
        type: 'image/x-icon',
        href: siteFavicon.value
      })
    }

    // Google Search Console verification
    if (googleSearchConsole.value) {
      head.meta.push({
        name: 'google-site-verification',
        content: googleSearchConsole.value
      })
    }

    // Tracking scripts
    head.script = []

    // Google Analytics (GA4)
    if (googleAnalyticsId.value && import.meta.client) {
      head.script.push(
        {
          src: `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId.value}`,
          async: true
        },
        {
          innerHTML: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${googleAnalyticsId.value}');
          `,
          type: 'text/javascript'
        }
      )
    }

    // Facebook Pixel
    if (facebookPixelId.value && import.meta.client) {
      head.script.push({
        innerHTML: `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${facebookPixelId.value}');
          fbq('track', 'PageView');
        `,
        type: 'text/javascript'
      })
    }

    return head
  })
}

